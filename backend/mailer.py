import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import List, Optional, Dict, Any

logger = logging.getLogger("cart_insight.mailer")


def get_smtp_config():
    """Dynamically get SMTP configuration from environment variables."""
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "").strip()
    # Remove any internal whitespace for Google App Passwords
    password = os.environ.get("SMTP_PASSWORD", "").replace(" ", "").strip()
    from_email = os.environ.get("SMTP_FROM_EMAIL", user or "Insight Cart <notifications@cartinsight.io>").strip()
    tls = os.environ.get("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    ssl = os.environ.get("SMTP_SSL", "false").lower() in ("true", "1", "yes")
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "from_email": from_email,
        "tls": tls,
        "ssl": ssl,
        "configured": bool(host and user and password),
    }


def is_smtp_configured() -> bool:
    """Check if real SMTP credentials are present in environment variables."""
    return get_smtp_config()["configured"]


def send_email_with_pdf(
    to_emails: List[str],
    subject: str,
    html_body: str,
    pdf_bytes: bytes,
    pdf_filename: str = "Store_Report.pdf",
) -> Dict[str, Any]:
    """
    Send an email with an attached PDF document to one or more recipient inboxes.
    Uses real SMTP if configured; otherwise logs and simulates instant delivery.
    """
    if not to_emails:
        return {"success": False, "error": "No recipient email provided"}

    cfg = get_smtp_config()

    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = cfg["from_email"]
    msg["To"] = ", ".join(to_emails)

    # HTML body part
    part_html = MIMEText(html_body, "html", "utf-8")
    msg.attach(part_html)

    # PDF Attachment part
    part_pdf = MIMEApplication(pdf_bytes, _subtype="pdf")
    part_pdf.add_header("Content-Disposition", "attachment", filename=pdf_filename)
    msg.attach(part_pdf)

    if cfg["configured"]:
        try:
            logger.info(f"Connecting to SMTP server {cfg['host']}:{cfg['port']} as {cfg['user']}...")
            if cfg["ssl"] or cfg["port"] == 465:
                server = smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=20)
            else:
                server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=20)
                if cfg["tls"]:
                    server.starttls()

            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_email"], to_emails, msg.as_string())
            server.quit()
            logger.info(f"Email successfully delivered via SMTP to {to_emails}")
            return {
                "success": True,
                "mode": "live_smtp",
                "recipients": to_emails,
                "message": f"Real email with attached {pdf_filename} delivered directly to {', '.join(to_emails)}!",
            }
        except Exception as e:
            logger.error(f"SMTP delivery failed: {e}")
            return {
                "success": False,
                "mode": "smtp_error",
                "error": str(e),
                "message": f"Failed to send email via SMTP: {e}",
            }
    else:
        # Development / preview simulation mode
        logger.info(
            f"[SMTP Simulated Mode] Dispatched email '{subject}' with {pdf_filename} ({len(pdf_bytes)} bytes) to {to_emails}"
        )
        return {
            "success": True,
            "mode": "simulated",
            "recipients": to_emails,
            "message": f"{pdf_filename} dispatched to {', '.join(to_emails)} (Simulated SMTP Channel). To send live emails, configure SMTP in backend/.env",
        }


def send_otp_email(to_email: str, otp_code: str, store_name: str = "Insight Cart Store") -> Dict[str, Any]:
    """
    Send a high-security 6-digit OTP verification code for password reset.
    """
    subject = f"Your Password Reset Code: {otp_code} — Insight Cart"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d0e; color: #f2f3f5; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 520px; margin: 0 auto; background: #141719; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; }}
        .brand {{ font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #9da3ae; margin-bottom: 24px; }}
        .title {{ font-size: 26px; font-weight: 600; color: #f2f3f5; margin: 0 0 12px 0; }}
        .text {{ font-size: 14px; line-height: 1.6; color: #9da3ae; margin: 0 0 28px 0; }}
        .otp-box {{ background: #0b0d0e; border: 1px solid rgba(212,255,58,0.3); border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 0.35em; color: #d4ff3a; margin-left: 0.35em; }}
        .expiry {{ font-size: 12px; color: #6b7280; text-align: center; margin-top: 10px; }}
        .footer {{ margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #6b7280; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">Insight Cart · Security Protocol</div>
        <h1 class="title">Password Reset Verification</h1>
        <p class="text">We received a request to reset the password for your store account (<strong>{store_name}</strong>). Use the 6-digit verification code below to proceed:</p>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        <div class="expiry">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</div>
        <div class="footer">
          Insight Cart Retail Intelligence Platform · Protected by Multi-Factor Security
        </div>
      </div>
    </body>
    </html>
    """

    cfg = get_smtp_config()

    if cfg["configured"]:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = cfg["from_email"]
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            if cfg["ssl"] or cfg["port"] == 465:
                server = smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=20)
            else:
                server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=20)
                if cfg["tls"]:
                    server.starttls()

            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_email"], [to_email], msg.as_string())
            server.quit()
            logger.info(f"OTP code email successfully sent to {to_email}")
            return {"success": True, "mode": "live_smtp", "email": to_email}
        except Exception as e:
            logger.error(f"Failed to send OTP via SMTP: {e}")
            return {"success": False, "mode": "smtp_error", "error": str(e)}
    else:
        logger.info(f"[Simulated OTP Delivery] OTP Code for {to_email}: {otp_code}")
        return {"success": True, "mode": "simulated", "email": to_email, "otp_preview": otp_code}
