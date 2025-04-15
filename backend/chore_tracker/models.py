from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=40)
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=162)
    email = models.EmailField(max_length=60)
    photo_url = models.CharField(max_length=60, default="None")

    def __str__(self):
        return self.username
    
    objects = UserManager() 
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    status = models.CharField(max_length=30)
    expiration = models.DateTimeField(null=True, blank=True)
    timezone = models.CharField(max_length=30)

    # Relationships
    creator = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="owned_groups")
    members = models.ManyToManyField(get_user_model(), related_name="joined_groups")

    def __str__(self):
        return self.name


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    first_date = models.DateField()
    # first_time = models.TimeField()
    repeat_every = models.CharField(max_length=40, null=True, blank=True)
    #repeat_every = models.IntegerField(null=True)

    # Relationships
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="events")
    members = models.ManyToManyField(User, related_name="events")
    is_complete = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class EventOccurrence(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField(default=None)
    time = models.TimeField(default=None)

    # Relationships
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="occurrences",default=None)

    def __str__(self):
        return self.event.name


class Cost(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    category = models.CharField(max_length=40, null=True, blank=True)
    amount = models.FloatField()
    date_added = models.DateField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)

    # Relationships
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="costs")
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="costs")
    # Changed from single borrower to multiple borrowers
    borrowers = models.ManyToManyField(User, related_name="borrowed_costs", through='CostShare')

    def __str__(self):
        return self.name


class CostShare(models.Model):
    id = models.AutoField(primary_key=True)
    cost = models.ForeignKey(Cost, on_delete=models.CASCADE, related_name="shares")
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cost_shares")
    amount = models.FloatField()  # Share amount for this specific user
    is_paid = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.borrower.username}'s share of {self.cost.name}"
