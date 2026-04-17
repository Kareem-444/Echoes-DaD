from .models import Notification


def build_notification_message(payload):
    notification_type = payload['type']

    if notification_type == Notification.TYPE_CHAT_MESSAGE:
        sender_name = payload.get('sender_anonymous_name', 'Someone')
        content = payload.get('content', '').strip()
        return f'{sender_name} sent a message: {content}' if content else f'{sender_name} sent a message.'

    if notification_type == Notification.TYPE_NEW_MATCH:
        anonymous_name = payload.get('anonymous_name', 'Someone')
        harmony_score = payload.get('harmony_score')
        if harmony_score is None:
            return f'You matched with {anonymous_name}.'
        return f'You matched with {anonymous_name} at {harmony_score}% harmony.'

    if notification_type == Notification.TYPE_RESONANCE_MILESTONE:
        milestone = payload.get('milestone')
        echo_preview = payload.get('echo_preview', '').strip()
        if echo_preview:
            return f'Your echo reached {milestone} resonances: {echo_preview}'
        return f'Your echo reached {milestone} resonances.'

    return payload.get('message', 'You have a new notification.')


def create_notification_for_user(user_id, payload):
    return Notification.objects.create(
        user_id=user_id,
        type=payload['type'],
        message=build_notification_message(payload),
    )
