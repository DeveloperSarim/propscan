import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter
from pydantic import BaseModel

from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class ContactRequest(BaseModel):
    purpose: str = "Buy"
    property_type: str = ""
    city: str = ""
    district: str = ""
    budget_min: str = ""
    budget_max: str = ""
    area_min: str = ""
    area_max: str = ""
    bedrooms: str = ""
    notes: str = ""
    name: str
    whatsapp: str


def _build_email(req: ContactRequest) -> tuple[str, str, str]:
    purpose_label = "For Sale" if req.purpose == "Buy" else "For Rent"
    prop_type     = req.property_type or "Property"
    budget        = f"SAR {req.budget_min}" + (f" – SAR {req.budget_max}" if req.budget_max else "") if req.budget_min else "—"
    area          = f"{req.area_min} – {req.area_max} m²" if req.area_min and req.area_max else (f"{req.area_min} m²" if req.area_min else "—")
    location      = f"{req.district}, {req.city}" if req.district else req.city

    subject = f"New Lead: {prop_type} {purpose_label} in {req.city} — {req.name}"

    plain = f"""\
New Property Lead — PropScan
==============================
Client     : {req.name}
WhatsApp   : +966 {req.whatsapp}
Purpose    : {purpose_label}
Type       : {prop_type}
Location   : {location}
Budget     : {budget}
Area       : {area}
Bedrooms   : {req.bedrooms or '—'}
Notes      : {req.notes or '—'}
==============================
https://wa.me/966{req.whatsapp}
"""

    rows = [
        ("Client",    req.name),
        ("WhatsApp",  f"+966 {req.whatsapp}"),
        ("Purpose",   purpose_label),
        ("Type",      prop_type),
        ("Location",  location),
        ("Budget",    budget),
        ("Area",      area),
        ("Bedrooms",  req.bedrooms or "—"),
        ("Notes",     req.notes or "—"),
    ]
    rows_html = "".join(_row(k, v, i == len(rows) - 1) for i, (k, v) in enumerate(rows))

    wa_url = f"https://wa.me/966{req.whatsapp}?text=Hi%20{req.name.split()[0]}%2C%20I%27m%20reaching%20out%20regarding%20your%20property%20requirement%20on%20PropScan."

    html = f"""\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Lead — PropScan</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#F4F4F5;padding:40px 16px;">
    <tr><td align="center">

      <table width="560" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;width:100%;">

        <!-- ── LOGO ROW ── -->
        <tr>
          <td style="padding-bottom:24px;" align="left">
            <span style="font-size:17px;font-weight:700;color:#18181B;letter-spacing:-0.02em;">propscan</span>
            <span style="font-size:13px;color:#A1A1AA;margin-left:6px;">/ New Lead</span>
          </td>
        </tr>

        <!-- ── MAIN CARD ── -->
        <tr>
          <td style="background:#ffffff;border-radius:12px;
                     border:1px solid #E4E4E7;overflow:hidden;">

            <!-- Green top accent bar -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#16A34A;height:4px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Card header -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:28px 32px 24px;border-bottom:1px solid #F4F4F5;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:top;">
                        <div style="font-size:11px;font-weight:600;color:#16A34A;
                                    text-transform:uppercase;letter-spacing:.08em;
                                    margin-bottom:6px;">New Requirement</div>
                        <div style="font-size:22px;font-weight:700;color:#09090B;
                                    letter-spacing:-0.02em;line-height:1.25;">
                          {prop_type}
                          <span style="color:#A1A1AA;font-weight:400;"> in </span>{req.city}
                        </div>
                        <div style="margin-top:6px;font-size:13px;color:#71717A;">{location}</div>
                      </td>
                      <td style="vertical-align:top;" align="right">
                        <span style="display:inline-block;font-size:11px;font-weight:600;
                                     color:#16A34A;background:#F0FDF4;border:1px solid #BBF7D0;
                                     border-radius:999px;padding:4px 12px;
                                     letter-spacing:.04em;text-transform:uppercase;
                                     white-space:nowrap;">{purpose_label}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Client row -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:20px 32px;border-bottom:1px solid #F4F4F5;
                            background:#FAFAFA;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <!-- Avatar circle -->
                      <td style="vertical-align:middle;">
                        <div style="width:40px;height:40px;border-radius:50%;
                                    background:#18181B;text-align:center;
                                    line-height:40px;font-size:15px;font-weight:700;
                                    color:#fff;display:inline-block;">
                          {req.name[0].upper()}
                        </div>
                      </td>
                      <td style="vertical-align:middle;padding-left:12px;">
                        <div style="font-size:15px;font-weight:600;color:#09090B;">
                          {req.name}
                        </div>
                        <div style="font-size:13px;color:#71717A;margin-top:1px;">
                          +966 {req.whatsapp}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:8px 32px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    {rows_html}
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:0 32px 32px;" align="center">
                  <a href="{wa_url}"
                     style="display:inline-block;background:#16A34A;color:#ffffff;
                            text-decoration:none;border-radius:8px;
                            padding:14px 36px;font-size:14px;font-weight:600;
                            letter-spacing:.01em;">
                    Reply on WhatsApp
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:20px 4px 0;" align="center">
            <span style="font-size:12px;color:#A1A1AA;">
              Sent by PropScan &nbsp;&middot;&nbsp; Saudi Real Estate Platform
            </span>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>

</body>
</html>
"""
    return subject, plain, html


def _row(label: str, value: str, last: bool = False) -> str:
    border = "" if last else "border-bottom:1px solid #F4F4F5;"
    return (
        f'<tr>'
        f'<td style="padding:12px 0;font-size:13px;color:#71717A;'
        f'font-weight:500;width:110px;{border}">{label}</td>'
        f'<td style="padding:12px 0;font-size:13px;color:#09090B;'
        f'font-weight:500;{border}">{value}</td>'
        f'</tr>'
    )


@router.post("", summary="Submit a property requirement (sends email to admin)")
async def submit_contact(req: ContactRequest):
    if not settings.smtp_user or not settings.admin_email:
        logger.warning(
            "[contact] SMTP not configured (SMTP_USER / ADMIN_EMAIL empty) — "
            "form saved but no email sent. Set them in .env to enable notifications."
        )
        return {"status": "received", "email_sent": False}

    subject, plain, html = _build_email(req)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"PropScan <{settings.smtp_user}>"
    msg["To"] = settings.admin_email
    msg["Reply-To"] = settings.smtp_user
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(settings.smtp_user, settings.smtp_pass)
            smtp.sendmail(settings.smtp_user, settings.admin_email, msg.as_string())
        logger.info(
            "[contact] Email sent to %s — %s (%s)",
            settings.admin_email, req.name, req.city,
        )
        return {"status": "received", "email_sent": True}
    except Exception as exc:
        logger.error("[contact] SMTP error: %s", exc)
        return {"status": "received", "email_sent": False, "error": str(exc)}
