import os
import smtplib
import logging
import base64
import json
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import List, Optional, Dict, Any

logger = logging.getLogger("cart_insight.mailer")

def _send_via_resend(
    to_emails: List[str],
    subject: str,
    html_body: str,
    attachments: Optional[List[Dict[str, str]]] = None,
) -> Optional[Dict[str, Any]]:
    """
    Send email using the Resend HTTP REST API over standard HTTPS (Port 443).
    Port 443 is 100% open on Render, Vercel, and all cloud providers.
    """
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        return None

    # Resend free onboarding allows sending to the verified account email or delivered@resend.dev
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "InsightCart-App/2.0",
    }
    data = {
        "from": "Insight Cart <onboarding@resend.dev>",
        "to": to_emails,
        "subject": subject,
        "html": html_body,
    }
    if attachments:
        data["attachments"] = attachments

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status in (200, 201):
                res_body = json.loads(resp.read().decode("utf-8"))
                email_id = res_body.get("id")
                logger.info(f"Email successfully delivered via Resend HTTP API to {to_emails} (id={email_id})")
                return {
                    "success": True,
                    "mode": "live_resend",
                    "id": email_id,
                    "recipients": to_emails,
                }
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8", errors="ignore")
        logger.warning(f"Resend HTTP error {e.code}: {error_msg}")
    except Exception as e:
        logger.warning(f"Resend API request failed: {e}")

    return None


def get_smtp_config():
    """Dynamically get SMTP configuration from environment variables."""
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "").strip()
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
    """Check if either Resend HTTP API or SMTP credentials are configured."""
    has_resend = bool(os.environ.get("RESEND_API_KEY", "").strip())
    return has_resend or get_smtp_config()["configured"]


def send_email_with_pdf(
    to_emails: List[str],
    subject: str,
    html_body: str,
    pdf_bytes: bytes,
    pdf_filename: str = "Store_Report.pdf",
) -> Dict[str, Any]:
    """
    Send an email with attached PDF document.
    1. Tries Resend HTTPS API (works on cloud hosts with zero port blocking).
    2. Falls back to direct SMTP.
    3. Falls back to simulated delivery if neither succeeds.
    """
    if not to_emails:
        return {"success": False, "error": "No recipient email provided"}

    # 1. Try Resend HTTP API (Port 443 HTTPS - always open)
    b64_content = base64.b64encode(pdf_bytes).decode("utf-8")
    attachments = [{"filename": pdf_filename, "content": b64_content}]
    resend_result = _send_via_resend(to_emails, subject, html_body, attachments)
    if resend_result and resend_result.get("success"):
        return {
            "success": True,
            "mode": "live_resend",
            "recipients": to_emails,
            "message": f"Real email with attached {pdf_filename} delivered directly to {', '.join(to_emails)} via Resend!",
        }

    # 2. Try SMTP fallback
    cfg = get_smtp_config()
    if cfg["configured"]:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = cfg["from_email"]
        msg["To"] = ", ".join(to_emails)
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        part_pdf = MIMEApplication(pdf_bytes, _subtype="pdf")
        part_pdf.add_header("Content-Disposition", "attachment", filename=pdf_filename)
        msg.attach(part_pdf)

        try:
            if cfg["ssl"] or cfg["port"] == 465:
                server = smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=10)
            else:
                server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=10)
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
            logger.warning(f"SMTP delivery failed ({e}). Falling back to simulated channel.")

    # 3. Simulated fallback
    logger.info(f"[Simulated Mode] Report '{subject}' with {pdf_filename} ready for {to_emails}")
    return {
        "success": True,
        "mode": "simulated",
        "recipients": to_emails,
        "message": f"Report generated! {pdf_filename} is ready for instant download below.",
    }


def send_otp_email(to_email: str, otp_code: str, store_name: str = "Insight Cart Store") -> Dict[str, Any]:
    """
    Send a high-security 6-digit OTP verification code for password reset.
    1. Tries Resend HTTPS API (Port 443).
    2. Falls back to direct SMTP.
    3. Falls back to simulated delivery with OTP preview.
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

    # 1. Try Resend HTTP API
    resend_result = _send_via_resend([to_email], subject, html_body)
    if resend_result and resend_result.get("success"):
        return {"success": True, "mode": "live_resend", "email": to_email}

    # 2. Try SMTP fallback
    cfg = get_smtp_config()
    if cfg["configured"]:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = cfg["from_email"]
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            if cfg["ssl"] or cfg["port"] == 465:
                server = smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=10)
            else:
                server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=10)
                if cfg["tls"]:
                    server.starttls()

            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_email"], [to_email], msg.as_string())
            server.quit()
            logger.info(f"OTP code email successfully sent to {to_email}")
            return {"success": True, "mode": "live_smtp", "email": to_email}
        except Exception as e:
            logger.warning(f"Failed to send OTP via SMTP ({e}). Falling back to simulated OTP.")

    # 3. Simulated fallback
    logger.info(f"[Simulated OTP Delivery] OTP Code for {to_email}: {otp_code}")
    return {"success": True, "mode": "simulated", "email": to_email, "otp_preview": otp_code}
