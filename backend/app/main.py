from fastapi import FastAPI, Depends, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from .database import get_db

from . import models, schemas

from .ml_routes import (
    router as ml_router,
    rank_recipients
)

from .match_generator import (
    generate_match_runs_for_organ
)


app = FastAPI(
    title="AI Organ Matching API",
    description="Backend API for the AI-assisted organ matching prototype",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ml_router)


@app.get("/")
def root():
    return {
        "message": "AI Organ Matching API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ==========================================================
# DONORS
# ==========================================================

@app.get("/api/donors")
def get_donors(
    db: Session = Depends(get_db)
):
    return db.query(models.Donor).all()


@app.get("/api/donors/{donor_id}")
def get_donor(
    donor_id: str,
    db: Session = Depends(get_db)
):

    donor = (
        db.query(models.Donor)
        .filter(
            models.Donor.donor_id == donor_id
        )
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    return donor


@app.post("/api/donors")
def create_donor(
    donor: schemas.DonorCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(models.Donor)
        .filter(
            models.Donor.donor_id
            == donor.donor_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Donor ID already exists"
        )

    new_donor = models.Donor(
        **donor.model_dump()
    )

    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)

    return new_donor


# ==========================================================
# RECIPIENTS
# ==========================================================

@app.get("/api/recipients")
def get_recipients(
    db: Session = Depends(get_db)
):
    return db.query(models.Recipient).all()


@app.get("/api/recipients/{recipient_id}")
def get_recipient(
    recipient_id: str,
    db: Session = Depends(get_db)
):

    recipient = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.recipient_id
            == recipient_id
        )
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Recipient not found"
        )

    return recipient


@app.post("/api/recipients")
def create_recipient(
    recipient: schemas.RecipientCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.recipient_id
            == recipient.recipient_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Recipient ID already exists"
        )

    new_recipient = models.Recipient(
        **recipient.model_dump()
    )

    db.add(new_recipient)
    db.commit()
    db.refresh(new_recipient)

    return new_recipient


# ==========================================================
# ORGANS
# ==========================================================

@app.get("/api/organs")
def get_organs(
    db: Session = Depends(get_db)
):
    return db.query(models.Organ).all()


@app.get("/api/organs/{organ_id}")
def get_organ(
    organ_id: str,
    db: Session = Depends(get_db)
):

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

    return organ


@app.post("/api/organs")
def create_organ(
    organ: schemas.OrganCreate,
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # 1. Check whether organ already exists
    # ------------------------------------------------------

    existing = (
        db.query(models.Organ)
        .filter(
            models.Organ.organ_id
            == organ.organ_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Organ ID already exists"
        )

    # ------------------------------------------------------
    # 2. Check whether donor exists
    # ------------------------------------------------------

    donor = (
        db.query(models.Donor)
        .filter(
            models.Donor.donor_id
            == organ.donor_id
        )
        .first()
    )

    if not donor:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Donor '{organ.donor_id}' "
                "not found. Please register the donor "
                "before registering the organ."
            )
        )

    # ------------------------------------------------------
    # 3. Create organ
    # ------------------------------------------------------

    new_organ = models.Organ(
        **organ.model_dump()
    )

    db.add(new_organ)
    db.commit()
    db.refresh(new_organ)

    # ------------------------------------------------------
    # 4. Generate match runs
    # ------------------------------------------------------

    match_run_result = (
        generate_match_runs_for_organ(
            db,
            new_organ
        )
    )

    # ------------------------------------------------------
    # 5. Automatically rank recipients
    # ------------------------------------------------------

    ranking_result = rank_recipients(
        new_organ.organ_id,
        db
    )

    # ------------------------------------------------------
    # 6. Return complete processing result
    # ------------------------------------------------------

    return {
        "organ": new_organ,
        "match_run_generation": match_run_result,
        "ranking": ranking_result
    }

@app.put("/api/organs/{organ_id}/hospital")
def update_organ_hospital(
    organ_id: str,
    hospital_id: str,
    db: Session = Depends(get_db)
):
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
            detail=f"Organ '{organ_id}' not found"
        )

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
            detail=f"Hospital '{hospital_id}' not found"
        )

    organ.current_hospital_id = hospital_id

    db.commit()
    db.refresh(organ)

    return {
        "success": True,
        "message": "Organ hospital updated successfully",
        "organ_id": organ.organ_id,
        "current_hospital_id": organ.current_hospital_id
    }

# ==========================================================
# HOSPITALS
# ==========================================================

@app.get("/api/hospitals")
def get_hospitals(
    db: Session = Depends(get_db)
):
    return db.query(models.Hospital).all()


# ==========================================================
# STAFF
# ==========================================================

@app.get("/api/staff")
def get_staff(
    db: Session = Depends(get_db)
):
    return db.query(models.Staff).all()


# ==========================================================
# COMPATIBILITY
# ==========================================================

@app.get("/api/compatibility")
def get_compatibility(
    db: Session = Depends(get_db)
):
    return db.query(
        models.Compatibility
    ).all()


# ==========================================================
# ORGAN RULES
# ==========================================================

@app.get("/api/organ-rules")
def get_organ_rules(
    db: Session = Depends(get_db)
):
    return db.query(
        models.OrganRule
    ).all()


# ==========================================================
# MATCH RUNS
# ==========================================================

@app.get("/api/match-runs")
def get_match_runs(
    db: Session = Depends(get_db)
):
    return db.query(
        models.MatchRun
    ).all()


# ==========================================================
# REGENERATE MATCH RUNS
# ==========================================================

@app.post("/api/match-runs/generate/{organ_id}")
def regenerate_match_runs(
    organ_id: str,
    db: Session = Depends(get_db)
):

    """
    Regenerate match runs for an existing organ.

    This endpoint is useful when an existing organ has
    no match-run records or when the matching logic has
    been updated.

    It does not create a new organ.
    """

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

    result = generate_match_runs_for_organ(
        db,
        organ
    )

    return {
        "organ_id": organ.organ_id,
        "organ_type": organ.organ_type,
        "match_run_generation": result
    }