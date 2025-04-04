from django.contrib.auth import authenticate, login
from rest_framework import generics, status
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

import logging
logger = logging.getLogger(__name__)

from api.models import UserProfile
from api.serializer.user.serializer import (UserSerializer, UserProfileUpdateSerializer)


#CLASS BASED VIEWS: (Remember List)
# CreateAPIView (POST only)
# ListAPIView (GET only)
# RetrieveAPIView (GET single object)
# UpdateAPIView (PUT/PATCH only)
# DestroyAPIView (DELETE only)
# ListCreateAPIView (GET + POST)
# RetrieveUpdateAPIView (GET + PUT/PATCH)
# RetrieveDestroyAPIView (GET + DELETE)
# RetrieveUpdateDestroyAPIView (GET + PUT/PATCH + DELETE)
# ViewSets (for automatic URL routing): ViewSet, ModelViewSet, ReadOnlyModelViewSet

#Main diff between this confusing 3 requests.
# Method | Purpose	                  Updates Existing?	 Creates New?	Replaces Entire Object?	Partial Update?
# POST	 | Create a new resource	        ❌ No	    ✅ Yes	        ❌ No	            ❌ No
# PUT	 | Fully update/replace a resource	✅ Yes	    ✅ Yes (if ID not required)✅ Yes	    ❌ No
# PATCH	 | Partially update a resource 	    ✅ Yes	    ❌ No	        ❌ No	            ✅ Yes

#    For more info about Objects in Django, i recomnend
# python3 manage.py shell
# from rest_framework import generics, serializers, permissions, authentication, views

# print(dir(generics))  # Lists all generic views
# print(dir(serializers))  # Lists all serializer classes
# print(dir(permissions))  # Lists all permission classes
# print(dir(authentication))  # Lists authentication classes
# print(dir(views))  # Lists APIView and related base classes

#------------------------------ USER VIEWS (with output serializers from model) --------------------------

# REGISTER VIEW: for registering process
#   model: UserProfile 
#   serializer: Userserializer
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# UPDATE Profile VIEW:  for modifying account
#   model: UserProfile 
#   serializer: UserProfileUpdateSerializer
# Todo: make a RetrieveUpdateAPIView
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Retrieve the user profile object."""
        try:
            return UserProfile.objects.get(pk=self.request.user.id)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        user = self.get_object()  # Retrieve user object
        serializer = UserSerializer(user)  # Serialize user object
        return Response(serializer.data)  # Get serialized user object

    def patch(self, request):
        user = self.get_object()
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#class CheckUserExistsView(generics.RetrieveAPIView):
#    serializer_class = UserSerializer
#    permission_classes = [IsAuthenticated]
#    lookup_field = "username"
#    def get_queryset(self):
#        """Filter UserProfile by username from URL parameter."""
#        username = self.kwargs.get("username", None)
#        return UserProfile.objects.filter(username=username) if username else UserProfile.objects.none()
#    
#    def retrieve(self, request, *args, **kwargs):
#        """Return user existence status."""
#        user = self.get_queryset().first()
#        return Response({"exists": bool(user), "user":user}, status=status.HTTP_200_OK)

class CheckUserExistsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username, format=None):
        try:
            # Verifica si el usuario existe en la base de datos
            user = UserProfile.objects.get(username=username)

            # Devuelve la información del usuario junto con "exists: True"
            return Response({
                "exists": True,
                "userProfile": {
                    "id": str(user.id),
                    "username": user.username,
                    "given_name": user.given_name,
                    "surname": user.surname,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)
        
        except UserProfile.DoesNotExist:
            return Response({"exists": False}, status=status.HTTP_404_NOT_FOUND)


# LOGIN VIEW: for logging into the account
#   model: UserProfile 
#   serializer: Userserializer
class LoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_2fa_enabled:
                code = request.data.get('code')
                if code:
                    device = TOTPDevice.objects.filter(user=user, name='default').first()
                    if device and device.verify_token(code):
                        refresh = RefreshToken.for_user(user)
                        login(request, user)
                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                            'id': str(id),
                        })
                    return Response({'error': 'Invalide 2FA code'}, status=400)
                return Response({'message': '2FA code is required'}, status=206)
            else:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'id': user.id
                })
        return Response({'error': 'Invalid identifiers'}, status=401)
