# AI-Assisted Organ Matching and Recipient Ranking System

An academic full-stack prototype for AI-assisted organ matching and recipient ranking.

> **Disclaimer:** This is a student academic prototype inspired by organ-allocation workflows. It is not official NOTTO software and must not be used for real clinical or transplant decisions.

---

## Project Overview

The system combines:

- Rule-based organ-recipient eligibility
- XGBoost-based recipient ranking
- SHAP-based explainability
- Hospital notification
- Hospital ACCEPT / REJECT workflow
- Rank-based fallback
- Clinical review
- Final allocation

The system is designed as a decision-support prototype with human review.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- SQLite

### Machine Learning

- XGBoost
- SHAP
- scikit-learn
- NumPy
- Pandas

### Communication

- Gmail SMTP

---

## Project Structure

```text
organ_match_new/
│
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── email_service.py
│   │   ├── main.py
│   │   ├── match_generator.py
│   │   ├── ml_model.py
│   │   ├── ml_routes.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── data/
│   │   └── organ_transplant/
│   │       ├── compatibility.csv
│   │       ├── donors.csv
│   │       ├── hospitals.csv
│   │       ├── match_runs.csv
│   │       ├── organ_rules.csv
│   │       ├── organs.csv
│   │       ├── recipients.csv
│   │       └── staff.csv
│   │
│   ├── organ_priority_xgboost.pkl
│   ├── requirements.txt
│   ├── seed_database.py
│   └── .env.example
│
├── public/
├── src/
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.ts
└── README.md
```
