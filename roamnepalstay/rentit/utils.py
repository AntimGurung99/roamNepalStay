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


def send_booking_confirmation_emails(booking):
   try:
      from django.core.mail import send_mail
      from django.conf import settings
      
      listing = booking.listing
      host = listing.host
      guest = booking.guest
      
      pm = str(booking.payment_method or "Not Specified").replace('_', ' ').title()

      # Send Email to Host
      send_mail(
         subject=f"RoamNepalStay - New Booking for {listing.title}",
         message=(
            f"Hi {host.first_name},\n\n"
            f"You have a new confirmed booking for your property: {listing.title}.\n"
            f"- Guest: {guest.first_name} {guest.last_name}\n"
            f"- Dates: {booking.check_in} to {booking.check_out}\n"
            f"- Payment Method: {pm}\n"
            f"- Total Amount: Rs. {booking.total_amount}\n\n"
            f"Regards,\nRoamNepalStay"
         ),
         from_email=settings.DEFAULT_FROM_EMAIL,
         recipient_list=[host.email],
         fail_silently=True,
      )

      # Send Email to Guest
      send_mail(
         subject=f"RoamNepalStay - Booking Confirmed for {listing.title}",
         message=(
            f"Hi {guest.first_name},\n\n"
            f"Your booking for {listing.title} has been confirmed successfully.\n"
            f"- Dates: {booking.check_in} to {booking.check_out}\n"
            f"- Payment Method: {pm}\n"
            f"- Total Amount: Rs. {booking.total_amount}\n\n"
            f"Thank you for choosing RoamNepalStay!\n\n"
            f"Regards,\nRoamNepalStay"
         ),
         from_email=settings.DEFAULT_FROM_EMAIL,
         recipient_list=[guest.email],
         fail_silently=True,
      )
   except Exception as e:
      print(f"Error sending booking confirmation emails: {e}")


