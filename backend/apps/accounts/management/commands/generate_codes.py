import random
import string

from django.core.management.base import BaseCommand

from apps.accounts.models import ActivationCode


class Command(BaseCommand):
    help = "Generate activation codes for new member signups"

    def add_arguments(self, parser):
        parser.add_argument("count", nargs="?", type=int, default=10)

    def handle(self, *args, **options):
        count = options["count"]
        created = 0
        for _ in range(count):
            code = (
                "GRIST-"
                + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
                + "-"
                + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            )
            if not ActivationCode.objects.filter(code=code).exists():
                ActivationCode.objects.create(code=code)
                self.stdout.write(f"  Created: {code}")
                created += 1
        self.stdout.write(self.style.SUCCESS(f"\nGenerated {created} activation codes"))
