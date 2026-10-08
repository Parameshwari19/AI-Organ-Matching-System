from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from pydantic import BaseModel

from .database import get_db

from . import models

from .ml_model import model, explainer

from .email_service import send_email


router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)


# ==========================================================
# SINGLE PRIORITY PREDICTION
# ==========================================================

class PriorityPredictionRequest(BaseModel):

    urgency_score: float

    waiting_time_score: float

    distance_km: float

    hospital_readiness_score: float


@router.post("/predict")
def predict_priority(
    request: PriorityPredictionRequest
):

    features = [[

        request.urgency_score,

        request.waiting_time_score,

        request.distance_km,

        request.hospital_readiness_score

    ]]

    prediction = model.predict(features)[0]

    return {

        "priority_score": float(prediction)

    }


# ==========================================================
# NOTIFICATION RESPONSE REQUEST
# ==========================================================

class NotificationResponseRequest(BaseModel):

    response: str


# ==========================================================
# SEND NOTIFICATION TO A RANKED HOSPITAL
# ==========================================================

def send_ranked_hospital_notification(
    db: Session,
    organ,
    candidate
):

    recipient_id = candidate["recipient_id"]

    match_id = candidate["match_id"]

    rank = candidate["rank"]


    # ------------------------------------------------------
    # Find recipient
    # ------------------------------------------------------

    recipient = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.recipient_id
            == recipient_id
        )
        .first()
    )

    if not recipient:

        return {
            "success": False,
            "status": "Failed",
            "message": "Recipient not found"
        }


    hospital_id = recipient.hospital_id


    # ------------------------------------------------------
    # Find hospital
    # ------------------------------------------------------

    hospital = (
        db.query(models.Hospital)
        .filter(
            models.Hospital.hospital_id
            == hospital_id
        )
        .first()
    )

    if not hospital:

        return {
            "success": False,
            "status": "Failed",
            "message": "Hospital not found"
        }


    # ------------------------------------------------------
    # Find hospital contact
    # ------------------------------------------------------

    contact = (
        db.query(models.HospitalContact)
        .filter(
            models.HospitalContact.hospital_id
            == hospital_id
        )
        .first()
    )


    if not contact:

        return {
            "success": False,
            "status": "Not Sent",
            "message": (
                "No contact information found "
                "for this hospital"
            ),
            "hospital_id": hospital_id,
            "hospital_name": hospital.hospital_name,
            "rank": rank
        }


    if not contact.email:

        return {
            "success": False,
            "status": "Not Sent",
            "message": (
                "Hospital does not have "
                "an email address"
            ),
            "hospital_id": hospital_id,
            "hospital_name": hospital.hospital_name,
            "rank": rank
        }


    # ------------------------------------------------------
    # Check duplicate notification
    # ------------------------------------------------------

    existing_notification = (
        db.query(models.Notification)
        .filter(
            models.Notification.organ_id
            == organ.organ_id,

            models.Notification.match_id
            == match_id,

            models.Notification.rank
            == rank
        )
        .first()
    )


    if existing_notification:

        return {
            "success": True,
            "status": "Already Exists",
            "message": (
                "Notification already exists "
                "for this ranked candidate"
            ),
            "notification_id":
                existing_notification.notification_id,
            "hospital_id":
                hospital_id,
            "hospital_name":
                hospital.hospital_name,
            "email":
                contact.email,
            "rank":
                rank
        }


    # ------------------------------------------------------
    # Prepare email
    # ------------------------------------------------------

    subject = (
        "Organ Offer Notification - "
        f"{organ.organ_type} - Rank {rank}"
    )


    body = f"""
Dear {contact.contact_name},

This is an automated notification from the
AI-Assisted Organ Matching and Recipient Ranking
student prototype.

An available organ has been ranked and your hospital
has been identified as the next candidate in the
prototype's ranking process.

Organ Details
-------------
Organ ID: {organ.organ_id}
Organ Type: {organ.organ_type}
Candidate Rank: {rank}

Recipient Details
-----------------
Recipient ID: {recipient.recipient_id}
Blood Group: {recipient.blood_group}
Urgency Category: {recipient.urgency_category}
Age: {recipient.age}
Sex: {recipient.sex}

Priority Score
--------------
{candidate["predicted_priority_score"]:.6f}

Hospital
--------
{hospital.hospital_name}
Hospital ID: {hospital.hospital_id}

This notification is part of a student academic
prototype and is not an official transplant allocation
decision or clinical instruction.

Any actual transplant decision must be reviewed and
authorized by the appropriate clinical and transplant
authorities.

Regards,

AI Organ Matching System
Student Project Prototype
"""


    # ------------------------------------------------------
    # Send email
    # ------------------------------------------------------

    email_result = send_email(
        recipient_email=contact.email,
        subject=subject,
        body=body
    )


    current_time = datetime.now().isoformat()


    # ------------------------------------------------------
    # Notification status
    # ------------------------------------------------------

    if email_result["success"]:

        notification_status = "Sent"

    else:

        notification_status = "Failed"


    # ------------------------------------------------------
    # Create notification record
    # ------------------------------------------------------

    notification = models.Notification(

        notification_id=(
            f"NOTIF-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
        ),

        organ_id=organ.organ_id,

        match_id=match_id,

        recipient_id=recipient.recipient_id,

        hospital_id=hospital.hospital_id,

        rank=rank,

        notification_type="Organ Offer",

        status=notification_status,

        sent_at=current_time
        if email_result["success"]
        else None,

        responded_at=None,

        response=None

    )


    db.add(notification)

    db.commit()

    db.refresh(notification)


    # ------------------------------------------------------
    # Return successful notification
    # ------------------------------------------------------

    if email_result["success"]:

        return {

            "success": True,

            "status": "Sent",

            "message": (
                f"Rank {rank} hospital notification "
                "sent successfully"
            ),

            "notification_id":
                notification.notification_id,

            "hospital_id":
                hospital.hospital_id,

            "hospital_name":
                hospital.hospital_name,

            "contact_name":
                contact.contact_name,

            "email":
                contact.email,

            "rank":
                rank

        }


    # ------------------------------------------------------
    # Return failed notification
    # ------------------------------------------------------

    return {

        "success": False,

        "status": "Failed",

        "message": (
            f"Rank {rank} hospital notification "
            "could not be sent"
        ),

        "notification_id":
            notification.notification_id,

        "hospital_id":
            hospital.hospital_id,

        "hospital_name":
            hospital.hospital_name,

        "email":
            contact.email,

        "rank":
            rank,

        "error":
            email_result["message"]

    }


# ==========================================================
# RANK 1 HOSPITAL NOTIFICATION
# ==========================================================

def notify_rank_one_hospital(
    db: Session,
    organ,
    rank_one_candidate
):

    return send_ranked_hospital_notification(
        db,
        organ,
        rank_one_candidate
    )


# ==========================================================
# FIND NEXT RANKED CANDIDATE
# ==========================================================

def find_next_ranked_candidate(
    db: Session,
    organ_id: str,
    current_rank: int
):

    # ------------------------------------------------------
    # Re-run the same ranking calculation
    # ------------------------------------------------------

    organ = (
        db.query(models.Organ)
        .filter(
            models.Organ.organ_id
            == organ_id
        )
        .first()
    )


    if not organ:

        return None


    match_runs = (
        db.query(models.MatchRun)
        .filter(
            models.MatchRun.organ_id
            == organ_id
        )
        .all()
    )


    eligible_runs = []


    for run in match_runs:

        if not run.blood_group_compatible:
            continue

        if not run.crossmatch_compatible:
            continue

        if not run.size_compatible:
            continue

        if not run.recipient_active:
            continue

        if not run.recipient_consent_verified:
            continue

        if not run.hospital_authorized:
            continue

        if not run.medical_eligible:
            continue

        eligible_runs.append(run)


    if not eligible_runs:

        return None


    # ------------------------------------------------------
    # Prepare ML features
    # ------------------------------------------------------

    feature_rows = []


    for run in eligible_runs:

        feature_rows.append([

            run.urgency_score,

            run.waiting_time_score,

            run.distance_km,

            run.hospital_readiness_score

        ])


    # ------------------------------------------------------
    # XGBoost predictions
    # ------------------------------------------------------

    predictions = model.predict(
        feature_rows
    )


    # ------------------------------------------------------
    # SHAP values
    # ------------------------------------------------------

    shap_values = explainer.shap_values(
        feature_rows
    )


    candidates = []


    for index, (run, prediction) in enumerate(

        zip(
            eligible_runs,
            predictions
        )

    ):

        recipient = (

            db.query(models.Recipient)

            .filter(
                models.Recipient.recipient_id
                == run.recipient_id
            )

            .first()

        )


        candidate_shap = shap_values[index]


        candidates.append({

            "match_id":
                run.match_id,

            "recipient_id":
                run.recipient_id,

            "organ_id":
                run.organ_id,

            "organ_type":
                run.organ_type,

            "urgency_score":
                run.urgency_score,

            "waiting_time_score":
                run.waiting_time_score,

            "distance_km":
                run.distance_km,

            "hospital_readiness_score":
                run.hospital_readiness_score,

            "predicted_priority_score":
                float(prediction),

            "shap_explanation": {

                "urgency_score":
                    float(candidate_shap[0]),

                "waiting_time_score":
                    float(candidate_shap[1]),

                "distance_km":
                    float(candidate_shap[2]),

                "hospital_readiness_score":
                    float(candidate_shap[3])

            },

            "recipient": {

                "age":
                    recipient.age
                    if recipient
                    else None,

                "sex":
                    recipient.sex
                    if recipient
                    else None,

                "blood_group":
                    recipient.blood_group
                    if recipient
                    else None,

                "urgency_category":
                    recipient.urgency_category
                    if recipient
                    else None

            }

        })


    # ------------------------------------------------------
    # Sort candidates
    # ------------------------------------------------------

    candidates.sort(

        key=lambda item:
            item["predicted_priority_score"],

        reverse=True

    )


    # ------------------------------------------------------
    # Add rank
    # ------------------------------------------------------

    for index, candidate in enumerate(

        candidates,

        start=1

    ):

        candidate["rank"] = index


    # ------------------------------------------------------
    # Return next rank
    # ------------------------------------------------------

    for candidate in candidates:

        if candidate["rank"] <= current_rank:
            continue

        return candidate


    return None


# ==========================================================
# HOSPITAL ACCEPT / REJECT NOTIFICATION
# ==========================================================

@router.post(
    "/notification/{notification_id}/respond"
)
def respond_to_notification(

    notification_id: str,

    request: NotificationResponseRequest,

    db: Session = Depends(get_db)

):

    # ------------------------------------------------------
    # 1. Validate response
    # ------------------------------------------------------

    response = (
        request.response
        .strip()
        .upper()
    )


    if response not in [
        "ACCEPT",
        "REJECT"
    ]:

        raise HTTPException(

            status_code=400,

            detail=(
                "Response must be either "
                "ACCEPT or REJECT"
            )

        )


    # ------------------------------------------------------
    # 2. Find notification
    # ------------------------------------------------------

    notification = (

        db.query(models.Notification)

        .filter(

            models.Notification.notification_id
            == notification_id

        )

        .first()

    )


    if not notification:

        raise HTTPException(

            status_code=404,

            detail="Notification not found"

        )


    # ------------------------------------------------------
    # 3. Check whether already responded
    # ------------------------------------------------------

    if notification.response:

        raise HTTPException(

            status_code=400,

            detail=(
                "This notification has already "
                "received a response"
            )

        )


    # ------------------------------------------------------
    # 4. Save hospital response
    # ------------------------------------------------------

    notification.response = response

    notification.responded_at = (
        datetime.now().isoformat()
    )

    notification.status = "Responded"


    db.commit()

    db.refresh(notification)


    # ------------------------------------------------------
    # 5. ACCEPT
    # ------------------------------------------------------

    if response == "ACCEPT":

        review_id = (
            f"CR-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
        )

        clinical_review = models.ClinicalReview(

            review_id=review_id,

            organ_id=notification.organ_id,

            recipient_id=notification.recipient_id,

            hospital_id=notification.hospital_id,

            rank=notification.rank,

            status="Pending Review",

            reviewed_by=None,

            review_date=None,

            decision="Pending",

            remarks=None

        )

        db.add(clinical_review)

        db.commit()

        db.refresh(clinical_review)

        return {

            "success": True,

            "message": (
                "Ranked hospital accepted the "
                "organ offer notification"
            ),

            "next_action":
                "Human clinical review",

            "clinical_review": {

                "review_id":
                    clinical_review.review_id,

                "organ_id":
                    clinical_review.organ_id,

                "recipient_id":
                    clinical_review.recipient_id,

                "hospital_id":
                    clinical_review.hospital_id,

                "rank":
                    clinical_review.rank,

                "status":
                    clinical_review.status,

                "decision":
                    clinical_review.decision

            },

            "notification_id":
                notification.notification_id,

            "organ_id":
                notification.organ_id,

            "recipient_id":
                notification.recipient_id,

            "hospital_id":
                notification.hospital_id,

            "rank":
                notification.rank,

            "status":
                notification.status,

            "response":
                notification.response,

            "responded_at":
                notification.responded_at

        }


    # ------------------------------------------------------
    # 6. REJECT
    # ------------------------------------------------------

    next_candidate = find_next_ranked_candidate(

        db,

        notification.organ_id,

        notification.rank

    )


    if not next_candidate:

        return {

            "success": True,

            "message": (
                "Hospital rejected the notification "
                "and no further ranked candidate "
                "is available"
            ),

            "next_notification":
                None,

            "notification_id":
                notification.notification_id,

            "response":
                notification.response

        }


    # ------------------------------------------------------
    # 7. Send notification to next rank
    # ------------------------------------------------------

    next_notification_result = (
        send_ranked_hospital_notification(

            db,

            (
                db.query(models.Organ)
                .filter(
                    models.Organ.organ_id
                    == notification.organ_id
                )
                .first()
            ),

            next_candidate

        )
    )


    # ------------------------------------------------------
    # 8. Return rejection + next notification
    # ------------------------------------------------------

    return {

        "success": True,

        "message": (
            f"Rank {notification.rank} hospital "
            "rejected the notification"
        ),

        "rejected_notification": {

            "notification_id":
                notification.notification_id,

            "hospital_id":
                notification.hospital_id,

            "rank":
                notification.rank,

            "response":
                notification.response,

            "status":
                notification.status

        },

        "next_notification":
            next_notification_result

    }


# ==========================================================
# RECIPIENT RANKING
# ==========================================================

@router.get("/rank/{organ_id}")
def rank_recipients(

    organ_id: str,

    db: Session = Depends(get_db)

):

    # ------------------------------------------------------
    # 1. Check whether organ exists
    # ------------------------------------------------------

    organ = (

        db.query(models.Organ)

        .filter(
            models.Organ.organ_id == organ_id
        )

        .first()

    )


    if not organ:

        raise HTTPException(

            status_code=404,

            detail="Organ not found"

        )


    # ------------------------------------------------------
    # 2. Check organ availability
    # ------------------------------------------------------

    if organ.status != "Available":

        return {

            "organ_id": organ_id,

            "organ_type": organ.organ_type,

            "status": organ.status,

            "candidates": [],

            "message": (
                "Organ is not currently available"
            )

        }


    # ------------------------------------------------------
    # 3. Get existing match-run records
    # ------------------------------------------------------

    match_runs = (

        db.query(models.MatchRun)

        .filter(

            models.MatchRun.organ_id
            == organ_id

        )

        .all()

    )


    if not match_runs:

        return {

            "organ_id": organ_id,

            "organ_type": organ.organ_type,

            "candidates": [],

            "message": (
                "No match-run records found "
                "for this organ"
            )

        }


    # ------------------------------------------------------
    # 4. Rule-based eligibility
    # ------------------------------------------------------

    eligible_runs = []


    for run in match_runs:

        if not run.blood_group_compatible:

            continue


        if not run.crossmatch_compatible:

            continue


        if not run.size_compatible:

            continue


        if not run.recipient_active:

            continue


        if not run.recipient_consent_verified:

            continue


        if not run.hospital_authorized:

            continue


        if not run.medical_eligible:

            continue


        eligible_runs.append(run)


    # ------------------------------------------------------
    # 5. No eligible recipients
    # ------------------------------------------------------

    if not eligible_runs:

        return {

            "organ_id": organ_id,

            "organ_type": organ.organ_type,

            "candidates": [],

            "message": (
                "No eligible recipients found"
            )

        }


    # ------------------------------------------------------
    # 6. Prepare ML features
    # ------------------------------------------------------

    feature_rows = []


    for run in eligible_runs:

        feature_rows.append([

            run.urgency_score,

            run.waiting_time_score,

            run.distance_km,

            run.hospital_readiness_score

        ])


    # ------------------------------------------------------
    # 7. XGBoost prediction
    # ------------------------------------------------------

    predictions = model.predict(
        feature_rows
    )


    # ------------------------------------------------------
    # 8. SHAP explanations
    # ------------------------------------------------------

    shap_values = explainer.shap_values(
        feature_rows
    )


    # ------------------------------------------------------
    # 9. Build ranked candidates
    # ------------------------------------------------------

    candidates = []


    for index, (run, prediction) in enumerate(

        zip(
            eligible_runs,
            predictions
        )

    ):

        recipient = (

            db.query(models.Recipient)

            .filter(

                models.Recipient.recipient_id
                == run.recipient_id

            )

            .first()

        )


        candidate_shap = shap_values[index]


        candidates.append({

            "match_id":
                run.match_id,

            "recipient_id":
                run.recipient_id,

            "organ_id":
                run.organ_id,

            "organ_type":
                run.organ_type,

            "urgency_score":
                run.urgency_score,

            "waiting_time_score":
                run.waiting_time_score,

            "distance_km":
                run.distance_km,

            "hospital_readiness_score":
                run.hospital_readiness_score,

            "predicted_priority_score":
                float(prediction),

            "shap_explanation": {

                "urgency_score":
                    float(candidate_shap[0]),

                "waiting_time_score":
                    float(candidate_shap[1]),

                "distance_km":
                    float(candidate_shap[2]),

                "hospital_readiness_score":
                    float(candidate_shap[3])

            },

            "recipient": {

                "age":
                    recipient.age
                    if recipient
                    else None,

                "sex":
                    recipient.sex
                    if recipient
                    else None,

                "blood_group":
                    recipient.blood_group
                    if recipient
                    else None,

                "urgency_category":
                    recipient.urgency_category
                    if recipient
                    else None

            }

        })


    # ------------------------------------------------------
    # 10. Sort by predicted priority
    # ------------------------------------------------------

    candidates.sort(

        key=lambda item:
            item["predicted_priority_score"],

        reverse=True

    )


    # ------------------------------------------------------
    # 11. Add ranking position
    # ------------------------------------------------------

    for index, candidate in enumerate(

        candidates,

        start=1

    ):

        candidate["rank"] = index


    # ------------------------------------------------------
    # 12. Notify Rank 1 hospital
    # ------------------------------------------------------

    rank_one_candidate = candidates[0]


    notification_result = (
        notify_rank_one_hospital(
            db,
            organ,
            rank_one_candidate
        )
    )


    # ------------------------------------------------------
    # 13. Return ranking + notification
    # ------------------------------------------------------

    return {

        "organ_id":
            organ_id,

        "organ_type":
            organ.organ_type,

        "candidate_count":
            len(candidates),

        "candidates":
            candidates,

        "rank_one_notification":
            notification_result

    }

# ==========================================================
# CLINICAL REVIEW DECISION
# ==========================================================

class ClinicalReviewDecisionRequest(BaseModel):

    reviewed_by: str

    decision: str

    remarks: str | None = None


# ==========================================================
# FINALIZE APPROVED ALLOCATION
# ==========================================================

def finalize_approved_allocation(
    db: Session,
    clinical_review
):
    organ = (
        db.query(models.Organ)
        .filter(
            models.Organ.organ_id
            == clinical_review.organ_id
        )
        .first()
    )

    if not organ:
        raise HTTPException(
            status_code=404,
            detail="Organ not found for clinical review"
        )

    recipient = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.recipient_id
            == clinical_review.recipient_id
        )
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Recipient not found for clinical review"
        )

    hospital = (
        db.query(models.Hospital)
        .filter(
            models.Hospital.hospital_id
            == clinical_review.hospital_id
        )
        .first()
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found for clinical review"
        )

    # ------------------------------------------------------
    # Final allocation
    # ------------------------------------------------------

    organ.status = "Allocated"

    # Recipient model uses active_status
    recipient.active_status = "Allocated"

    # Accepted hospital becomes the current hospital
    organ.current_hospital_id = (
        clinical_review.hospital_id
    )

    # ------------------------------------------------------
    # Close remaining open notifications for this organ
    # ------------------------------------------------------

    open_notifications = (
        db.query(models.Notification)
        .filter(
            models.Notification.organ_id
            == clinical_review.organ_id,
            models.Notification.status == "Sent"
        )
        .all()
    )

    for notification in open_notifications:
        notification.status = "Closed"

    # ------------------------------------------------------
    # Save final allocation
    # ------------------------------------------------------

    db.commit()

    db.refresh(organ)
    db.refresh(recipient)

    return {
        "organ_id": organ.organ_id,
        "organ_status": organ.status,
        "current_hospital_id":
            organ.current_hospital_id,
        "current_hospital_name":
            hospital.hospital_name,
        "recipient_id":
            recipient.recipient_id,
        "recipient_status":
            recipient.active_status,
        "allocation_status":
            "Final Allocation Completed"
    }

    # ==========================================================
# GET HOSPITAL NOTIFICATIONS / ORGAN OFFERS
# ==========================================================

@router.get(
    "/notifications/hospital/{hospital_id}"
)
def get_hospital_notifications(
    hospital_id: str,
    db: Session = Depends(get_db)
):
    hospital = (
        db.query(models.Hospital)
        .filter(
            models.Hospital.hospital_id == hospital_id
        )
        .first()
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found"
        )

    notifications = (
        db.query(models.Notification)
        .filter(
            models.Notification.hospital_id == hospital_id
        )
        .order_by(
            models.Notification.sent_at.desc()
        )
        .all()
    )

    offers = []

    for notification in notifications:

        organ = (
            db.query(models.Organ)
            .filter(
                models.Organ.organ_id
                == notification.organ_id
            )
            .first()
        )

        recipient = (
            db.query(models.Recipient)
            .filter(
                models.Recipient.recipient_id
                == notification.recipient_id
            )
            .first()
        )

        offers.append(
            {
                "notification_id":
                    notification.notification_id,

                "organ_id":
                    notification.organ_id,

                "match_id":
                    notification.match_id,

                "recipient_id":
                    notification.recipient_id,

                "hospital_id":
                    notification.hospital_id,

                "rank":
                    notification.rank,

                "notification_type":
                    notification.notification_type,

                "status":
                    notification.status,

                "response":
                    notification.response,

                "sent_at":
                    notification.sent_at,

                "responded_at":
                    notification.responded_at,

                "organ_type":
                    organ.organ_type if organ else None,


                "organ_blood_group": None,

                "recipient_blood_group":
                    recipient.blood_group
                    if recipient else None,

                "recipient_urgency":
                    recipient.urgency_category
                    if recipient else None,

                "can_respond":
                    notification.status == "Sent"
                    and notification.response is None
            }
        )

    return {
        "success": True,
        "hospital_id": hospital_id,
        "hospital_name": hospital.hospital_name,
        "offer_count": len(offers),
        "offers": offers
    }


# ==========================================================
# GET PENDING CLINICAL REVIEWS
# ==========================================================

@router.get(
    "/clinical-reviews/pending"
)
def get_pending_clinical_reviews(

    db: Session = Depends(get_db)

):

    reviews = (
        db.query(models.ClinicalReview)
        .filter(
            models.ClinicalReview.status
            == "Pending Review"
        )
        .all()
    )


    return {

        "success": True,

        "review_count": len(reviews),

        "reviews": [

            {

                "review_id": review.review_id,

                "organ_id": review.organ_id,

                "recipient_id": review.recipient_id,

                "hospital_id": review.hospital_id,

                "rank": review.rank,

                "status": review.status,

                "reviewed_by": review.reviewed_by,

                "review_date": review.review_date,

                "decision": review.decision,

                "remarks": review.remarks

            }

            for review in reviews

        ]

    }


# ==========================================================
# SUBMIT CLINICAL REVIEW DECISION
# ==========================================================

@router.post(
    "/clinical-reviews/{review_id}/decision"
)
def submit_clinical_review_decision(

    review_id: str,

    request: ClinicalReviewDecisionRequest,

    db: Session = Depends(get_db)

):

    # ------------------------------------------------------
    # 1. Validate decision
    # ------------------------------------------------------

    decision = (
        request.decision
        .strip()
        .upper()
    )


    if decision not in [
        "APPROVED",
        "NOT APPROVED"
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Decision must be either "
                "APPROVED or NOT APPROVED"
            )
        )


    # ------------------------------------------------------
    # 2. Find clinical review
    # ------------------------------------------------------

    clinical_review = (
        db.query(models.ClinicalReview)
        .filter(
            models.ClinicalReview.review_id
            == review_id
        )
        .first()
    )


    if not clinical_review:

        raise HTTPException(
            status_code=404,
            detail="Clinical review not found"
        )


    # ------------------------------------------------------
    # 3. Prevent duplicate decision
    # ------------------------------------------------------

    if clinical_review.status == "Completed":

        raise HTTPException(
            status_code=400,
            detail=(
                "This clinical review has already "
                "been completed"
            )
        )


    # ------------------------------------------------------
    # 4. Save reviewer decision
    # ------------------------------------------------------

    clinical_review.reviewed_by = (
        request.reviewed_by.strip()
    )

    if not clinical_review.reviewed_by:

        raise HTTPException(
            status_code=400,
            detail="reviewed_by cannot be empty"
        )


    clinical_review.review_date = (
        datetime.now().isoformat()
    )

    clinical_review.decision = decision

    clinical_review.remarks = request.remarks

    clinical_review.status = "Completed"


    db.commit()

    db.refresh(clinical_review)


    # ------------------------------------------------------
    # 5. APPROVED
    # ------------------------------------------------------

    if decision == "APPROVED":

        allocation = finalize_approved_allocation(
            db,
            clinical_review
        )

        return {

            "success": True,

            "message": (
                "Clinical review approved and "
                "organ allocation finalized"
            ),

            "next_action":
                "Allocation finalized",

            "clinical_review": {

                "review_id":
                    clinical_review.review_id,

                "organ_id":
                    clinical_review.organ_id,

                "recipient_id":
                    clinical_review.recipient_id,

                "hospital_id":
                    clinical_review.hospital_id,

                "rank":
                    clinical_review.rank,

                "status":
                    clinical_review.status,

                "reviewed_by":
                    clinical_review.reviewed_by,

                "review_date":
                    clinical_review.review_date,

                "decision":
                    clinical_review.decision,

                "remarks":
                    clinical_review.remarks

            },

            "allocation": allocation

        }


    # ------------------------------------------------------
    # 6. NOT APPROVED
    # ------------------------------------------------------

    next_candidate = find_next_ranked_candidate(

        db,

        clinical_review.organ_id,

        clinical_review.rank

    )


    if not next_candidate:

        return {

            "success": True,

            "message": (
                "Clinical review was not approved and "
                "no further ranked candidate is available"
            ),

            "next_action":
                "No further ranked candidate",

            "clinical_review": {

                "review_id":
                    clinical_review.review_id,

                "organ_id":
                    clinical_review.organ_id,

                "recipient_id":
                    clinical_review.recipient_id,

                "hospital_id":
                    clinical_review.hospital_id,

                "rank":
                    clinical_review.rank,

                "status":
                    clinical_review.status,

                "reviewed_by":
                    clinical_review.reviewed_by,

                "review_date":
                    clinical_review.review_date,

                "decision":
                    clinical_review.decision,

                "remarks":
                    clinical_review.remarks

            },

            "next_notification": None

        }


    organ = (
        db.query(models.Organ)
        .filter(
            models.Organ.organ_id
            == clinical_review.organ_id
        )
        .first()
    )


    next_notification_result = (
        send_ranked_hospital_notification(

            db,

            organ,

            next_candidate

        )
    )


    return {

        "success": True,

        "message": (
            "Clinical review was not approved and "
            "the next ranked hospital was notified"
        ),

        "next_action":
            "Next ranked hospital notification",

        "clinical_review": {

            "review_id":
                clinical_review.review_id,

            "organ_id":
                clinical_review.organ_id,

            "recipient_id":
                clinical_review.recipient_id,

            "hospital_id":
                clinical_review.hospital_id,

            "rank":
                clinical_review.rank,

            "status":
                clinical_review.status,

            "reviewed_by":
                clinical_review.reviewed_by,

            "review_date":
                clinical_review.review_date,

            "decision":
                clinical_review.decision,

            "remarks":
                clinical_review.remarks

        },

        "next_notification":
            next_notification_result

    }
