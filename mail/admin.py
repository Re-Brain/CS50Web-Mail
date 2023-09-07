from django.contrib import admin
from .models import *

# Register your models here.
class emailInterface(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'read', 'archived')

admin.site.register(User)
admin.site.register(Email, emailInterface)

