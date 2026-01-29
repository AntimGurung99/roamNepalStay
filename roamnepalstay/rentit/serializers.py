from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "password", "confirm_password")
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        first_name = (attrs.get("first_name") or "").strip()
        last_name = (attrs.get("last_name") or "").strip()
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if not first_name:
            raise serializers.ValidationError(
                {"first_name": ["First name is required."]}
            )
        if not last_name:
            raise serializers.ValidationError({"last_name": ["Last name is required."]})
        if not email:
            raise serializers.ValidationError({"email": ["Email is required."]})
        if not confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": ["Confirm password is required."]}
            )
        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": ["Passwords do not match."]}
            )

       
        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

      
        if User.objects.filter(
            first_name__iexact=first_name, last_name__iexact=last_name
        ).exists():
            raise serializers.ValidationError({"name": ["Same name already exists."]})

      
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": ["Email already exists."]})

        attrs["first_name"] = first_name
        attrs["last_name"] = last_name
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class RegisterResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password")

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        attrs["user"] = user
        return attrs
