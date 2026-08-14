from django.db import models

from django.db import models
# Create your models here.
from django.db import models

class Report(models.Model):
    tracking_id = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=50, blank=True, null=True)
    confidence = models.CharField(max_length=20, blank=True, null=True)
    score = models.IntegerField(default=85)
    owner = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, default="Under Review")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tracking_id} - {self.category}"