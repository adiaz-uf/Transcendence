# Generated by Django 5.1.6 on 2025-02-27 11:02

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('P1score', models.IntegerField()),
                ('P2score', models.IntegerField()),
                ('Player1', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches_as_player1', to=settings.AUTH_USER_MODEL)),
                ('Player2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches_as_player2', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('FinalMatch', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournaments_as_finalmatch', to='api.match')),
                ('Semifinal1', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournaments_as_semifinal1', to='api.match')),
                ('Semifinal2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournaments_as_semifinal2', to='api.match')),
            ],
        ),
    ]
