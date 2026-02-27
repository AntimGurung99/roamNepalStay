from django.test import TestCase
from django.contrib.auth import get_user_model
from rentit.models import Listing

User = get_user_model()

class UserModelTest(TestCase):
    def setUp(self):
        """
        This method works like a setup before **every** test function.
        We create a user here that we can use in our tests.
        """
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )

    def test_user_creation(self):
        """Test that the user was created correctly with our custom fields."""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.first_name, 'Test')
        self.assertFalse(self.user.is_host)  # Default should be False

    def test_user_string_representation(self):
        """Test how the user model is printed as a string."""
        expected_str = "Test User<test@example.com>"
        self.assertEqual(str(self.user), expected_str)

    def test_duplicate_email_not_allowed(self):
        """Test that creating a user with the same email fails."""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='testuser2',
                email='test@example.com',  # Same email as setUp user
                password='password123'
            )

class ListingModelTest(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='hostuser',
            email='host@example.com',
            password='password123',
            first_name='Host',
            last_name='User',
            is_host=True
        )
        self.listing = Listing.objects.create(
            host=self.host,
            title="Beautiful Mountain View",
            description="A lovely place to stay.",
            city="Pokhara",
            price_per_night=1500.00
        )

    def test_listing_defaults(self):
        """Test default values for a listing."""
        self.assertEqual(self.listing.status, 'draft')  # Default status
        self.assertEqual(self.listing.country, 'Nepal') # Default country

    def test_listing_string_representation(self):
        expected_str = "Beautiful Mountain View (Pokhara)"
        self.assertEqual(str(self.listing), expected_str)
