import csv
import os

from app.database import engine, Base, SessionLocal
from app import models


DATA_DIR = os.path.join(
    os.path.dirname(__file__),
    "data",
    "organ_transplant"
)


def to_bool(value):
    if value is None:
        return None

    value = str(value).strip().lower()

    if value in ["true", "1", "yes"]:
        return True

    if value in ["false", "0", "no"]:
        return False

    return None


def load_csv(filename, model):
    path = os.path.join(DATA_DIR, filename)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing file: {path}")

    with open(path, "r", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        rows = list(reader)

    objects = []

    for row in rows:

        # Convert boolean fields
        for key in row:
            if key in [
                "blood_group_compatible",
                "crossmatch_compatible",
                "size_compatible",
                "recipient_active",
                "recipient_consent_verified",
                "hospital_authorized",
                "hospital_ready",
                "medical_eligible",
                "blood_group_check",
                "crossmatch_check",
                "size_check",
                "urgency_factor",
                "waiting_time_factor",
                "distance_factor",
                "hospital_readiness_factor",
                "icu_available",
                "operating_theatre_available",
                "transplant_team_available",
            ]:
                row[key] = to_bool(row[key])

        # Convert numeric fields
        integer_fields = [
            "age",
            "waiting_days",
            "experience_years",
        ]

        float_fields = [
            "height_cm",
            "weight_kg",
            "latitude",
            "longitude",
            "urgency_score",
            "waiting_time_score",
            "distance_km",
            "estimated_travel_minutes",
            "hospital_readiness_score",
            "priority_score",
        ]

        for key in integer_fields:
            if key in row and row[key] != "":
                row[key] = int(float(row[key]))

        for key in float_fields:
            if key in row and row[key] != "":
                row[key] = float(row[key])

        # Empty values become None
        for key in row:
            if row[key] == "":
                row[key] = None

        objects.append(model(**row))

    return objects


def main():

    print("Creating database...")

    # Recreate tables from our actual dataset structure
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        datasets = [
            ("hospitals.csv", models.Hospital),
            ("staff.csv", models.Staff),
            ("donors.csv", models.Donor),
            ("recipients.csv", models.Recipient),
            ("organs.csv", models.Organ),
            ("organ_rules.csv", models.OrganRule),
            ("compatibility.csv", models.Compatibility),
            ("match_runs.csv", models.MatchRun),
        ]

        for filename, model in datasets:

            print(f"Loading {filename}...")

            objects = load_csv(filename, model)

            db.add_all(objects)
            db.commit()

            print(f"  Loaded {len(objects)} records")

        print("\nDatabase successfully seeded!")

    except Exception as e:
        db.rollback()
        print("\nERROR:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()