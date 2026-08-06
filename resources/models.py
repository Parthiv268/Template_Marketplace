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

    @property
    def tokens_minted(self):
        return self.nft_tokens.count()

    @property
    def tokens_remaining(self):
        return max(0, self.max_supply - self.tokens_minted)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} → {self.resource.title} ({self.rating}★)"
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} → {self.resource.title}"
class Acquisition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='acquisitions')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='acquisitions')
    acquired_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} acquired {self.resource.title}"


# ─── NFT Models ────────────────────────────────────────────────────────────────

class NFTToken(models.Model):
    """
    One row per minted token. Created when a buyer successfully purchases
    a resource for the first time (primary sale).

    token_number is sequential per resource:
      Token #1 of 50, #2 of 50, etc.
    """
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='nft_tokens'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='nft_tokens_owned'
    )
    token_number = models.PositiveIntegerField()   # 1-based, unique per resource
    minted_at = models.DateTimeField(auto_now_add=True)
    # Simulated IPFS-style content hash: sha256 of (resource_id + token_number + minted_at)
    metadata_hash = models.CharField(max_length=64, unique=True)
    is_listed_for_resale = models.BooleanField(default=False)
    resale_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ('resource', 'token_number')
        ordering = ['token_number']

    def __str__(self):
        return f"Token #{self.token_number} of {self.resource.title} — owned by {self.owner.username}"


class NFTSale(models.Model):
    """
    Immutable audit log of every sale event.

    PRIMARY sale  → first mint; creator earns 100%, royalty_amount = 0.
    SECONDARY sale → token resale; original creator earns royalty_percent of
                     the resale price automatically.
    """
    SALE_TYPE_CHOICES = [
        ('primary', 'Primary Sale'),
        ('secondary', 'Secondary Sale / Resale'),
    ]

    token = models.ForeignKey(
        NFTToken,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    # The person who bought this token
    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='nft_purchases'
    )
    # The person who sold this token (creator on primary; previous owner on secondary)
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='nft_sold'
    )
    # The original creator (stays fixed even across many resales)
    original_creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='nft_royalties_earned'
    )
    sale_type = models.CharField(max_length=10, choices=SALE_TYPE_CHOICES, default='primary')
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    # Royalty = 0 on primary sale; sale_price * royalty_percent/100 on secondary
    royalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # What the seller (reseller) keeps after paying royalty
    seller_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # What the original creator earns: full price on primary, royalty on secondary
    creator_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sold_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sold_at']

    def __str__(self):
        return (
            f"[{self.sale_type}] Token #{self.token.token_number} of "
            f"'{self.token.resource.title}' — ₹{self.sale_price} on {self.sold_at:%Y-%m-%d}"
        )
    

class ResourceImage(models.Model):
    """
    Extra images for a resource's detail-page carousel.
    Resource.thumbnail stays untouched — that's still what shows on the
    marketplace grid card. These are additional images shown only on
    the detail page carousel.
    """
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='resource_images/')
    order = models.PositiveIntegerField(default=0)  # controls slide sequence

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image #{self.order} for {self.resource.title}"


# ── Update Acquisition: add these two lines inside the existing class ──
# (find your current Acquisition class and add these two fields + choices)

class Acquisition(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='acquisitions')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='acquisitions')
    acquired_at = models.DateTimeField(auto_now_add=True)
    paid_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='completed')

    class Meta:
        unique_together = ('user', 'resource')

    def __str__(self):
        return f"{self.user.username} acquired {self.resource.title}"


# ── Brand new models — add at the very end of the file ──

class Payout(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='requested')
    requested_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.creator.username} - {self.amount} ({self.status})"


class Report(models.Model):
    TARGET_CHOICES = [('resource', 'Resource'), ('user', 'User')]
    STATUS_CHOICES = [('open', 'Open'), ('reviewed', 'Reviewed'), ('dismissed', 'Dismissed')]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    target_type = models.CharField(max_length=10, choices=TARGET_CHOICES)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reports_against')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.username} ({self.target_type}, {self.status})"