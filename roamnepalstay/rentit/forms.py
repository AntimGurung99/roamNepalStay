from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)

    # Explicitly redeclare password fields to ensure visibility to modelform_factory
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput,
        strip=False,
    )
    password2 = forms.CharField(
        label="Password confirmation",
        widget=forms.PasswordInput,
        strip=False,
    )

    class Meta:
        model = User
        # Do NOT include password_1/2 in fields, they are non-model fields
        fields = (
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "date_of_birth",
            "city",
            "country",
            "profile_image",
            "accepted_terms",
            "is_host",
            "host_application_status",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["first_name"].required = True
        self.fields["last_name"].required = True
        self.fields["email"].required = True
        # self.fields["city"].required = True
        # self.fields["country"].required = True

    # def clean_accepted_terms(self):
    #     val = self.cleaned_data.get("accepted_terms")
    #     if val is not True:
    #         raise forms.ValidationError("You must accept terms and conditions.")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"
