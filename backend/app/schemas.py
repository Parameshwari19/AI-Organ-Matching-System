
from pydantic import BaseModel
from typing import Optional


class DonorCreate(BaseModel):
    donor_id: str
    donor_type: str
    age: int
    sex: str
    height_cm: float
    weight_kg: float
    blood_group: str
    cause_of_death_category: str
    medical_history_category: str
    consent_status: str
    verification_status: str
    hospital_id: str
    donor_status: str


class RecipientCreate(BaseModel):
    recipient_id: str
    hospital_id: str
    required_organ: str
    age: int
    sex: str
    blood_group: str
    registration_date: str
    waiting_days: int
    urgency_category: str
    medical_risk_level: str
    medical_history_category: str
    active_status: str
    consent_status: str


class OrganCreate(BaseModel):
    organ_id: str
    donor_id: str
    organ_type: str
    retrieval_datetime: str
    preservation_method: str
    organ_condition_category: str
    status: str
    current_hospital_id: str