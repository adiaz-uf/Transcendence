# Generated by Django 5.1.6 on 2025-03-07 10:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_userprofile_groups_and_more'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='given_name',
            field=models.CharField(blank=True, max_length=35, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='surname',
            field=models.CharField(blank=True, max_length=35, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='name',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='email',
            field=models.EmailField(blank=True, max_length=254, verbose_name='email address'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='groups',
            field=models.ManyToManyField(blank=True, related_name='user_profiles', to='auth.group'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, related_name='user_profiles', to='auth.permission'),
        ),
    ]
