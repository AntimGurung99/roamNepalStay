import random
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings

def generate_otp():
   return str(random.randint(100000,999999))

def send_otp_email(user):
   otp = generate_otp()
   user.email_otp = otp
   user.otp_created_at = timezone.now()
   user.save(update_fields =["email_otp","otp_created_at"])

   send_mail(
      subject = "RoamNepalStay - Verify your email",
      message = f"Your OTP code is: {otp}\n This code expires in 10 minutes.",
      from_email = settings.DEFAULT_FROM_EMAIL,
      recipient_list=[user.email],
      fail_silently = False,
   )

