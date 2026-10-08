import math
import uuid

from sqlalchemy.orm import Session

from . import models


def calculate_distance_km(
    latitude1,
    longitude1,
    latitude2,
    longitude2
):
    """
    Calculate approximate distance between two hospitals
    using the Haversine formula.
    """

    if (
        latitude1 is None
        or longitude1 is None
        or latitude2 is None
        or longitude2 is None
    ):
        return 0.0

    radius = 6371.0

    lat1 = math.radians(latitude1)
    lat2 = math.radians(latitude2)

    delta_lat = math.radians(latitude2 - latitude1)
    delta_lon = math.radians(longitude2 - longitude1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return radius * c


def blood_group_compatible(
    donor_blood_group,
    recipient_blood_group
):
    """
    Simplified ABO compatibility rule for the
    student prototype.

    Rh positive/negative symbols are ignored for
    this simplified ABO check.

    Actual transplant compatibility is organ-specific
    and requires clinical testing.
    """

    if not donor_blood_group or not recipient_blood_group:
        return False

    donor = donor_blood_group.upper().strip()
    recipient = recipient_blood_group.upper().strip()

    # Convert O+, O-, A+, A-, etc. into
    # their ABO groups: O, A, B, AB.
    donor_abo = donor.replace("+", "").replace("-", "")
    recipient_abo = recipient.replace("+", "").replace("-", "")

    compatibility = {
        "O": {"O", "A", "B", "AB"},
        "A": {"A", "AB"},
        "B": {"B", "AB"},
        "AB": {"AB"},
    }

    return recipient_abo in compatibility.get(
        donor_abo,
        set()
    )


def calculate_urgency_score(
    urgency_category
):
    """
    Convert recipient urgency category
    into the numeric feature used by the ML model.
    """

    if not urgency_category:
        return 0.25

    urgency = urgency_category.lower()

    if urgency in [
        "critical",
        "super urgent",
        "super-urgent",
        "super_urgent"
    ]:
        return 1.0

    if urgency in [
        "urgent",
        "high"
    ]:
        return 0.75

    if urgency in [
        "priority",
        "moderate"
    ]:
        return 0.50

    return 0.25


def calculate_waiting_time_score(
    waiting_days
):
    """
    Normalize waiting time into approximately 0-1.

    One year is used as the normalization reference.
    """

    if waiting_days is None:
        return 0.0

    score = waiting_days / 365.0

    return min(
        max(score, 0.0),
        1.0
    )


def calculate_hospital_readiness_score(
    hospital
):
    """
    Convert hospital readiness into the simplified
    0.5 / 1.0 scale used by the synthetic ML dataset.

    Ready -> 1.0
    Partially_Ready -> 0.5
    """

    if not hospital:
        return 0.5

    readiness = (
        hospital.readiness_status or ""
    ).lower()

    if readiness in [
        "ready",
        "available",
        "fully ready",
        "active"
    ]:
        return 1.0

    return 0.5


def hospital_is_authorized(
    hospital
):
    """
    Check whether the hospital is authorized
    to participate in the prototype workflow.

    This matches the actual values in the project
    database:
        authorization_status = "Authorized"
        transplant_center_status = "Transplant Center"
    """

    if not hospital:
        return False

    authorization = (
        hospital.authorization_status or ""
    ).strip().lower()

    transplant_status = (
        hospital.transplant_center_status or ""
    ).strip().lower()

    authorized = authorization in [
        "authorized",
        "active",
        "approved",
        "yes",
        "true"
    ]

    transplant_center = transplant_status in [
        "transplant center",
        "transplant centre",
        "active",
        "authorized",
        "approved",
        "yes",
        "true"
    ]

    return (
        authorized
        and transplant_center
    )


def hospital_is_ready(
    hospital
):
    """
    Determine whether the hospital is fully ready.

    Readiness is stored separately from authorization.
    A partially-ready hospital can still be considered
    in the prototype; readiness contributes to ranking.
    """

    if not hospital:
        return False

    readiness = (
        hospital.readiness_status or ""
    ).strip().lower()

    return readiness in [
        "ready",
        "available",
        "fully ready",
        "active"
    ]


def get_existing_compatibility(
    db: Session,
    organ,
    recipient
):
    """
    Look for an existing compatibility record.

    If one exists, use its stored compatibility
    information.

    If one does not exist, the prototype uses
    simplified assumptions for crossmatch and
    size compatibility.
    """

    compatibility = (
        db.query(models.Compatibility)
        .filter(
            models.Compatibility.donor_id
            == organ.donor_id,
            models.Compatibility.recipient_id
            == recipient.recipient_id,
            models.Compatibility.organ_type
            == organ.organ_type
        )
        .first()
    )

    return compatibility


def generate_match_runs_for_organ(
    db: Session,
    organ
):
    """
    Generate match-run records for one newly
    available organ.

    If match runs already exist for the organ,
    no duplicate records are created.
    """

    existing_runs = (
        db.query(models.MatchRun)
        .filter(
            models.MatchRun.organ_id
            == organ.organ_id
        )
        .count()
    )

    if existing_runs > 0:
        return {
            "created": 0,
            "existing": existing_runs,
            "message": "Match runs already exist for this organ"
        }

    donor = (
        db.query(models.Donor)
        .filter(
            models.Donor.donor_id
            == organ.donor_id
        )
        .first()
    )

    if not donor:
        return {
            "created": 0,
            "existing": 0,
            "message": "Donor not found"
        }

    donor_hospital_id = (
        organ.current_hospital_id
        or donor.hospital_id
    )

    donor_hospital = (
        db.query(models.Hospital)
        .filter(
            models.Hospital.hospital_id
            == donor_hospital_id
        )
        .first()
    )

    recipients = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.required_organ
            == organ.organ_type
        )
        .all()
    )

    if not recipients:
        return {
            "created": 0,
            "existing": 0,
            "message": "No recipients found for this organ type"
        }

    created_runs = []

    for recipient in recipients:

        recipient_hospital = (
            db.query(models.Hospital)
            .filter(
                models.Hospital.hospital_id
                == recipient.hospital_id
            )
            .first()
        )

        compatibility = get_existing_compatibility(
            db,
            organ,
            recipient
        )

        if compatibility:
            blood_compatible = bool(
                compatibility.blood_group_compatible
            )
        else:
            blood_compatible = blood_group_compatible(
                donor.blood_group,
                recipient.blood_group
            )

        if compatibility:
            crossmatch_compatible = (
                compatibility.crossmatch_status
                in [
                    "Negative",
                    "Compatible",
                    "negative",
                    "compatible"
                ]
            )
        else:
            crossmatch_compatible = True

        if compatibility:
            size_compatible = bool(
                compatibility.size_compatible
            )
        else:
            size_compatible = True

        recipient_active = (
            str(
                recipient.active_status
            ).strip().lower()
            in [
                "active",
                "yes",
                "true"
            ]
        )

        recipient_consent_verified = (
            str(
                recipient.consent_status
            ).strip().lower()
            in [
                "verified",
                "approved",
                "active",
                "yes",
                "true"
            ]
        )

        hospital_authorized = hospital_is_authorized(
            recipient_hospital
        )

        hospital_ready = hospital_is_ready(
            recipient_hospital
        )

        medical_eligible = (
            recipient_active
            and recipient_consent_verified
        )

        distance_km = calculate_distance_km(
            donor_hospital.latitude
            if donor_hospital else None,
            donor_hospital.longitude
            if donor_hospital else None,
            recipient_hospital.latitude
            if recipient_hospital else None,
            recipient_hospital.longitude
            if recipient_hospital else None
        )

        estimated_travel_minutes = distance_km

        urgency_score = calculate_urgency_score(
            recipient.urgency_category
        )

        waiting_time_score = calculate_waiting_time_score(
            recipient.waiting_days
        )

        hospital_readiness_score = (
            calculate_hospital_readiness_score(
                recipient_hospital
            )
        )

        match_run = models.MatchRun(
            match_id=(
                f"MR-{uuid.uuid4().hex[:10].upper()}"
            ),

            organ_id=organ.organ_id,
            donor_id=organ.donor_id,
            recipient_id=recipient.recipient_id,
            organ_type=organ.organ_type,

            blood_group_compatible=blood_compatible,
            crossmatch_compatible=crossmatch_compatible,
            size_compatible=size_compatible,

            recipient_active=recipient_active,
            recipient_consent_verified=(
                recipient_consent_verified
            ),

            hospital_authorized=hospital_authorized,
            hospital_ready=hospital_ready,

            medical_eligible=medical_eligible,

            urgency_score=urgency_score,
            waiting_time_score=waiting_time_score,

            distance_km=distance_km,
            estimated_travel_minutes=(
                estimated_travel_minutes
            ),

            hospital_readiness_score=(
                hospital_readiness_score
            ),

            priority_score=None
        )

        db.add(match_run)

        created_runs.append(match_run)

    db.commit()

    return {
        "created": len(created_runs),
        "existing": 0,
        "message": "Match runs created successfully"
    }