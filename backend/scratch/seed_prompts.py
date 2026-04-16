import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'echoes_backend.settings')
django.setup()

from apps.echoes.models import DailyPrompt

prompts = [
    "What are you afraid to say out loud?",
    "What do you wish someone would ask you about?",
    "What feeling have you been carrying alone?",
    "What would you do if no one was watching?",
    "What's the thought you keep pushing away?",
    "What do you miss that you've never had?",
    "What would your younger self be surprised to know?",
]

def seed():
    today = timezone.now().date()
    for i, text in enumerate(prompts):
        date = today + timedelta(days=i)
        obj, created = DailyPrompt.objects.get_or_create(text=text, date=date)
        if created:
            print(f"Created prompt for {date}: {text}")
        else:
            print(f"Prompt already exists for {date}")

if __name__ == "__main__":
    seed()
