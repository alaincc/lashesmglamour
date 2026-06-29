import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from datetime import datetime

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Base Premium HTML Email Template wrapper
HTML_LAYOUT = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #FAF6F6;
      color: #2D2D2D;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      background-color: #FAF6F6;
      padding: 40px 0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #F1E2E2;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(229, 124, 130, 0.05);
    }}
    .header {{
      background-color: #1C1C1C;
      padding: 30px;
      text-align: center;
      border-bottom: 2px solid #D4AF37;
    }}
    .header img {{
      height: 60px;
      width: auto;
    }}
    .content {{
      padding: 40px 30px;
    }}
    h1 {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      color: #1C1C1C;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 700;
    }}
    p {{
      font-size: 15px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 20px;
    }}
    .details-box {{
      background-color: #FFF9F9;
      border-left: 4px solid #E57C82;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
    }}
    .details-row {{
      display: flex;
      margin-bottom: 12px;
      font-size: 14px;
    }}
    .details-row:last-child {{
      margin-bottom: 0;
    }}
    .details-label {{
      font-weight: bold;
      color: #1C1C1C;
      width: 110px;
      flex-shrink: 0;
    }}
    .details-value {{
      color: #555555;
    }}
    .btn {{
      display: inline-block;
      background-color: #E57C82;
      color: #FFFFFF !important;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 1px;
      text-decoration: none;
      padding: 15px 35px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
      transition: background-color 0.2s ease;
    }}
    .btn:hover {{
      background-color: #D3666C;
    }}
    .footer {{
      background-color: #FAF6F6;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #F1E2E2;
      font-size: 12px;
      color: #888888;
      line-height: 1.6;
    }}
    .footer a {{
      color: #E57C82;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <!-- White inverted logo for contrast on dark banner -->
        <span style="font-family: Georgia, serif; font-size: 22px; color: #D4AF37; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">Lashes &amp; MGlamour</span>
      </div>
      <div class="content">
        {body_content}
      </div>
      <div class="footer">
        <p style="font-size: 12px; margin: 0 0 10px 0; color: #888888;">Lashes &amp; MGlamour Salon</p>
        <p style="font-size: 12px; margin: 0 0 10px 0; color: #888888;">📍 4095 SW 137th Ave #3, Miami, FL 33175</p>
        <p style="font-size: 12px; margin: 0 0 20px 0; color: #888888;">📞 <a href="tel:+17864606580">786-460-6580</a> | <a href="tel:+13058330302">305-833-0302</a></p>
        <p style="font-size: 11px; color: #aaaaaa; margin: 0;">&copy; {current_year} Lashes &amp; MGlamour. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
"""

# HTML Content Templates for different languages
CONFIRMATION_TEMPLATES = {
    "en": """
      <h1>Your Appointment is Confirmed!</h1>
      <p>Hello {customer_name},</p>
      <p>Thank you for choosing <strong>Lashes &amp; MGlamour</strong>. Your reservation has been successfully confirmed. We look forward to pampering you soon!</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Service:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Date &amp; Time:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Specialist:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Booking ID:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>If you need to make changes or have any questions, you can directly chat with us on WhatsApp or call our front desk.</p>
      <div style="text-align: center;">
        <a href="{whatsapp_link}" class="btn" target="_blank">Chat on WhatsApp</a>
      </div>
    """,
    "es": """
      <h1>¡Tu Cita está Confirmada!</h1>
      <p>Hola {customer_name},</p>
      <p>Gracias por elegir <strong>Lashes &amp; MGlamour</strong>. Tu reserva ha sido confirmada con éxito. ¡Estamos ansiosas por consentirte!</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Servicio:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Fecha y Hora:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Especialista:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">ID Reserva:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>Si necesitas reprogramar, cancelar o tienes dudas, puedes escribirnos directamente por WhatsApp o llamar a nuestro salón.</p>
      <div style="text-align: center;">
        <a href="{whatsapp_link}" class="btn" target="_blank">Escríbenos por WhatsApp</a>
      </div>
    """
}

CANCELLATION_TEMPLATES = {
    "en": """
      <h1>Appointment Cancelled</h1>
      <p>Hello {customer_name},</p>
      <p>Your appointment with <strong>Lashes &amp; MGlamour</strong> has been successfully cancelled. If this was an accident or you'd like to book a new appointment, you can book online at any time.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Service:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Cancelled Date:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Specialist:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Booking ID:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>We hope to see you another time soon!</p>
      <div style="text-align: center;">
        <a href="https://lashesmglamour.com/book" class="btn">Book New Appointment</a>
      </div>
    """,
    "es": """
      <h1>Cita Cancelada</h1>
      <p>Hola {customer_name},</p>
      <p>Tu cita con <strong>Lashes &amp; MGlamour</strong> ha sido cancelada con éxito. Si esto fue un error o deseas programar una nueva reserva, puedes hacerlo en línea en cualquier momento.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Servicio:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Fecha original:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Especialista:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">ID Reserva:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>¡Esperamos verte en otra ocasión muy pronto!</p>
      <div style="text-align: center;">
        <a href="https://lashesmglamour.com/es/book" class="btn">Programar Nueva Cita</a>
      </div>
    """
}

REPROGRAMMED_TEMPLATES = {
    "en": """
      <h1>Your Appointment was Rescheduled</h1>
      <p>Hello {customer_name},</p>
      <p>Your appointment at <strong>Lashes &amp; MGlamour</strong> has been rescheduled. Please review your new date and time details below.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Service:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">New Date/Time:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Specialist:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Booking ID:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>If you have any questions about this rescheduled slot, feel free to contact us.</p>
      <div style="text-align: center;">
        <a href="{whatsapp_link}" class="btn" target="_blank">Chat on WhatsApp</a>
      </div>
    """,
    "es": """
      <h1>Tu Cita fue Reprogramada</h1>
      <p>Hola {customer_name},</p>
      <p>Tu cita en <strong>Lashes &amp; MGlamour</strong> ha sido reprogramada. Por favor, revisa los detalles de tu nueva fecha y hora a continuación.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Servicio:</div>
          <div class="details-value">{service_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Nueva Fecha/Hora:</div>
          <div class="details-value">{start_time}</div>
        </div>
        <div class="details-row">
          <div class="details-label">Especialista:</div>
          <div class="details-value">{staff_name}</div>
        </div>
        <div class="details-row">
          <div class="details-label">ID Reserva:</div>
          <div class="details-value">{booking_id}</div>
        </div>
      </div>
      
      <p>Si tienes alguna consulta sobre este cambio de horario, no dudes en escribirnos.</p>
      <div style="text-align: center;">
        <a href="{whatsapp_link}" class="btn" target="_blank">Escríbenos por WhatsApp</a>
      </div>
    """
}

def format_start_time(dt: datetime, lang: str) -> str:
    """Helper to convert start_time to a beautiful string based on language."""
    # Days and Months translation dictionaries
    days_es = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    months_es = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    
    if lang == "es":
        # Formato: "Sábado, 27 de Junio a las 5:30 PM"
        weekday = days_es[dt.weekday()]
        day = dt.day
        month = months_es[dt.month - 1]
        time_str = dt.strftime("%I:%M %p").lstrip('0')
        return f"{weekday}, {day} de {month} a las {time_str}"
    else:
        # Formato: "Saturday, June 27 at 5:30 PM"
        return dt.strftime("%A, %B %d at %I:%M %p").replace(" 0", " ")


def send_email_sync(
    recipient_email: str,
    subject: str,
    body_html: str
) -> bool:
    """Helper to send a synchronous email via SMTP. Logs warnings instead of crashing on failures."""
    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP_HOST not configured. Skipping sending email to %s. Subject: %s",
            recipient_email, subject
        )
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = recipient_email
        
        # Attach HTML content
        msg.attach(MIMEText(body_html, "html"))
        
        # Connect to SMTP
        smtp_class = smtplib.SMTP_SSL if settings.SMTP_PORT == 465 else smtplib.SMTP
        with smtp_class(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_PORT != 465:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, [recipient_email], msg.as_string())
            
        logger.info("Successfully sent email notification to %s with subject: %s", recipient_email, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s via SMTP server: %s", recipient_email, str(e))
        return False


def send_booking_email(
    recipient_email: str,
    event_type: str,  # 'confirmed', 'cancelled', 'rescheduled'
    customer_name: str,
    service_name: str,
    start_time: datetime,
    staff_name: str,
    booking_id: str,
    lang: str = "en"
) -> bool:
    """
    Formatea las plantillas HTML del correo de reserva e inicia el envío.
    """
    lang = lang.lower() if lang else "en"
    if lang not in ("en", "es"):
        lang = "en"
        
    formatted_time = format_start_time(start_time, lang)
    whatsapp_link = "https://wa.me/17864606580"
    
    # Map event templates
    subject_map = {
        "confirmed": {
            "en": "Lashes & MGlamour - Appointment Confirmed",
            "es": "Lashes & MGlamour - Confirmación de Cita"
        },
        "cancelled": {
            "en": "Lashes & MGlamour - Appointment Cancelled",
            "es": "Lashes & MGlamour - Cita Cancelada"
        },
        "rescheduled": {
            "en": "Lashes & MGlamour - Appointment Rescheduled",
            "es": "Lashes & MGlamour - Cita Reprogramada"
        }
    }
    
    template_map = {
        "confirmed": CONFIRMATION_TEMPLATES,
        "cancelled": CANCELLATION_TEMPLATES,
        "rescheduled": REPROGRAMMED_TEMPLATES
    }
    
    subject = subject_map.get(event_type, {}).get(lang, "Lashes & MGlamour Appointment Update")
    inner_template = template_map.get(event_type, {}).get(lang)
    
    if not inner_template:
        logger.error("Unknown event_type '%s' for email template generation", event_type)
        return False
        
    body_content = inner_template.format(
        customer_name=customer_name,
        service_name=service_name,
        start_time=formatted_time,
        staff_name=staff_name,
        booking_id=booking_id,
        whatsapp_link=whatsapp_link
    )
    
    body_html = HTML_LAYOUT.format(
        subject=subject,
        body_content=body_content,
        current_year=datetime.utcnow().year
    )
    
    return send_email_sync(recipient_email, subject, body_html)
