from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='complaints/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('complaint/new/', views.complaint_form, name='complaint_form'),
    path('complaint/success/', views.complaint_success, name='complaint_success'),
    path('complaint/<int:pk>/', views.complaint_detail, name='complaint_detail'),
]
