from django.contrib import admin
from .models import Complaint, ComplaintUpdate

class ComplaintUpdateInline(admin.TabularInline):
    model = ComplaintUpdate
    extra = 0

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('subject', 'description', 'user__username')
    inlines = [ComplaintUpdateInline]

@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'updated_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('complaint__subject', 'comment', 'updated_by__username')
