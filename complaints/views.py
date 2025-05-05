from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.db.models import Q
from .forms import UserRegistrationForm, ComplaintForm, ComplaintUpdateForm, ComplaintStatusForm
from .models import Complaint, ComplaintUpdate
from django.contrib.auth.models import User, Group

def home(request):
    return render(request, 'complaints/login.html')

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Add user to the regular users group
            user_group, created = Group.objects.get_or_create(name='Users')
            user.groups.add(user_group)
            
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserRegistrationForm()
    return render(request, 'complaints/register.html', {'form': form})

@login_required
def dashboard(request):
    user = request.user
    
    # Check if user is admin (belongs to Admin group or is superuser)
    is_admin = user.is_superuser or user.groups.filter(name='Admins').exists()
    
    if is_admin:
        # Admin dashboard
        status_filter = request.GET.get('status', '')
        search_query = request.GET.get('search', '')
        
        complaints = Complaint.objects.all()
        
        if status_filter:
            complaints = complaints.filter(status=status_filter)
        
        if search_query:
            complaints = complaints.filter(
                Q(subject__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(user__username__icontains=search_query)
            )
        
        return render(request, 'complaints/admin_dashboard.html', {
            'complaints': complaints,
            'status_filter': status_filter,
            'search_query': search_query,
        })
    else:
        # User dashboard - redirect to complaint form
        return redirect('complaint_form')

@login_required
def complaint_form(request):
    user = request.user
    
    # Check if user is admin
    is_admin = user.is_superuser or user.groups.filter(name='Admins').exists()
    
    if is_admin:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = ComplaintForm(request.POST, request.FILES)
        if form.is_valid():
            complaint = form.save(commit=False)
            complaint.user = request.user
            complaint.save()
            messages.success(request, 'Your complaint has been submitted successfully!')
            return redirect('complaint_success')
    else:
        form = ComplaintForm()
    
    # Get user's previous complaints
    user_complaints = Complaint.objects.filter(user=request.user)
    
    return render(request, 'complaints/complaint_form.html', {
        'form': form,
        'user_complaints': user_complaints
    })

@login_required
def complaint_success(request):
    return render(request, 'complaints/complaint_success.html')

@login_required
def complaint_detail(request, pk):
    complaint = get_object_or_404(Complaint, pk=pk)
    updates = complaint.updates.all()
    
    # Check if user is admin
    user = request.user
    is_admin = user.is_superuser or user.groups.filter(name='Admins').exists()
    
    # Only allow access to the complaint owner or admins
    if not is_admin and complaint.user != user:
        messages.error(request, "You don't have permission to view this complaint.")
        return redirect('dashboard')
    
    update_form = None
    status_form = None
    
    if is_admin:
        if request.method == 'POST':
            if 'update_submit' in request.POST:
                update_form = ComplaintUpdateForm(request.POST)
                if update_form.is_valid():
                    update = update_form.save(commit=False)
                    update.complaint = complaint
                    update.updated_by = request.user
                    update.save()
                    messages.success(request, 'Update added successfully!')
                    return redirect('complaint_detail', pk=pk)
            
            elif 'status_submit' in request.POST:
                status_form = ComplaintStatusForm(request.POST, instance=complaint)
                if status_form.is_valid():
                    status_form.save()
                    messages.success(request, 'Status updated successfully!')
                    return redirect('complaint_detail', pk=pk)
        
        update_form = update_form or ComplaintUpdateForm()
        status_form = status_form or ComplaintStatusForm(instance=complaint)
    
    return render(request, 'complaints/complaint_detail.html', {
        'complaint': complaint,
        'updates': updates,
        'update_form': update_form,
        'status_form': status_form,
        'is_admin': is_admin,
    })
