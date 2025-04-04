from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

import logging
logger = logging.getLogger(__name__)

from api.models import Tournament, Match, UserProfile
from api.serializer.tournament.serializer import TournamentSerializer


class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [AllowAny]
    queryset = Tournament.objects.all()

