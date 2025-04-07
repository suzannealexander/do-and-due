# Generated by Django 4.2.20 on 2025-04-06 21:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=40)),
                ("username", models.CharField(max_length=40, unique=True)),
                ("password", models.CharField(max_length=162)),
                ("email", models.EmailField(max_length=60)),
                ("photo_url", models.CharField(default="None", max_length=60)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=60)),
                ("first_date", models.DateField()),
                ("first_time", models.TimeField()),
                (
                    "repeat_every",
                    models.CharField(blank=True, max_length=40, null=True),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Group",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=60)),
                ("status", models.CharField(max_length=30)),
                ("expiration", models.DateTimeField(blank=True, null=True)),
                ("timezone", models.CharField(max_length=30)),
                (
                    "creator",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="owned_groups",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "members",
                    models.ManyToManyField(
                        related_name="joined_groups", to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="EventOccurrence",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("date", models.DateField()),
                ("time", models.TimeField()),
                (
                    "event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="occurrences",
                        to="chore_tracker.event",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="event",
            name="group",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="events",
                to="chore_tracker.group",
            ),
        ),
        migrations.AddField(
            model_name="event",
            name="members",
            field=models.ManyToManyField(
                related_name="events", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.CreateModel(
            name="Cost",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=60)),
                ("category", models.CharField(blank=True, max_length=40, null=True)),
                ("amount", models.FloatField()),
                (
                    "borrower",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="borrower",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "group",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="costs",
                        to="chore_tracker.group",
                    ),
                ),
                (
                    "payer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="costs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
