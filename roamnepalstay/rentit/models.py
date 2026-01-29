from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.db.models import Q


class User(AbstractUser):

    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)

    email = models.EmailField(unique=True)

    is_host = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=~Q(first_name="") & ~Q(last_name=""),
                name="first_last_not_empty",
            ),
            UniqueConstraint(
                Lower("first_name"),
                Lower("last_name"),
                name="uniq_first_last_case_insensitive",
            ),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}.strip()<{self.email}>"
