# Generated by Django 5.1.6 on 2025-03-06 14:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_userprofile_name_match_left_score_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='surname',
        ),
    ]
