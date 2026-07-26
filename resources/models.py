from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Category(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)
    
    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural='Categories'
        # just to correct the djangos plural form 
    
class Resource(models.Model):
    STATUS_CHOICES = [
        ('listed', 'Listed'),
        ('removed', 'Removed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='resources'
    )
    thumbnail = models.ImageField(upload_to='thumbnails/')
    file = models.FileField(upload_to='resource_files/')
    price = models.DecimalField(max_digits=8, decimal_places=2)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resources',
        # helps to establish a clear name for reverse relation innstead of user.Resource_set.all() to user.resources.all()
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='listed'
    )
    max_supply = models.IntegerField(default=50)
    royalty_percent = models.IntegerField(default=10)
    token_id = models.IntegerField(null=True, blank=True)
    ipfs_hash = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title