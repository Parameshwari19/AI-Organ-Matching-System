import os
import smtplib

from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv


# ----------------------------------------------------------
# LOAD THE BACKEND .ENV FILE EXPLICITLY
# ----------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)


# ----------------------------------------------------------
# SMTP CONFIGURATION
# ----------------------------------------------------------

SMTP_SERVER = os.getenv(
    "SMTP_SERVER",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)

SMTP_USERNAME = os.getenv(
    "SMTP_USERNAME"
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD"
)


# ----------------------------------------------------------
# SEND EMAIL
# ----------------------------------------------------------

def send_email(
    recipient_email: str,
    subject: str,
    body: str
):

    if not SMTP_USERNAME:
        return {
            "success": False,
            "message": "SMTP_USERNAME is missing from backend/.env"
        }

    if not SMTP_PASSWORD:
        return {
            "success": False,
            "message": "SMTP_PASSWORD is missing from backend/.env"
        }

    message = EmailMessage()

    message["From"] = SMTP_USERNAME
    message["To"] = recipient_email
    message["Subject"] = subject

    message.set_content(body)

    try:

        server = smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT,
            timeout=20
        )

        server.ehlo()

        server.starttls()

        server.ehlo()

        server.login(
            SMTP_USERNAME,
            SMTP_PASSWORD
        )

        server.send_message(
            message
        )

        try:
            server.quit()
        except Exception:
            pass

        return {
            "success": True,
            "message": "Email sent successfully"
        }

    except Exception as error:

        return {
            "success": False,
            "message": str(error)
        }