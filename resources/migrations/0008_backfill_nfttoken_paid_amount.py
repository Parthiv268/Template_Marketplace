# Data migration: backfill paid_amount on NFTToken rows that were created
# before the merge (migration 0007). Those rows have paid_amount=0 because
# the column defaulted to 0 when added. We read the real price from the
# NFTSale record (primary sale) that was always stored correctly.

from django.db import migrations


def backfill_paid_amount(apps, schema_editor):
    NFTToken = apps.get_model('resources', 'NFTToken')
    NFTSale = apps.get_model('resources', 'NFTSale')

    # Find all tokens that still have the default paid_amount = 0
    stale_tokens = NFTToken.objects.filter(paid_amount=0)

    updated = 0
    for token in stale_tokens:
        # Every token has exactly one primary sale record — that's what the
        # buyer actually paid. Use sale_price as the authoritative amount.
        primary_sale = NFTSale.objects.filter(
            token=token,
            sale_type='primary'
        ).first()

        if primary_sale:
            token.paid_amount = primary_sale.sale_price
            token.save(update_fields=['paid_amount'])
            updated += 1

    print(f'  Backfilled paid_amount on {updated} NFTToken row(s).')


def reverse_backfill(apps, schema_editor):
    # Reversing sets everything back to 0 (the original default)
    NFTToken = apps.get_model('resources', 'NFTToken')
    NFTToken.objects.all().update(paid_amount=0)


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0007_nfttoken_paid_amount_delete_acquisition'),
    ]

    operations = [
        migrations.RunPython(backfill_paid_amount, reverse_backfill),
    ]
