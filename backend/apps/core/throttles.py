from rest_framework.throttling import SimpleRateThrottle, UserRateThrottle


class PostOnlyThrottleMixin:
    def allow_request(self, request, view):
        if request.method != 'POST':
            return True
        return super().allow_request(request, view)


class IpPostRateThrottle(PostOnlyThrottleMixin, SimpleRateThrottle):
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class UserPostRateThrottle(PostOnlyThrottleMixin, UserRateThrottle):
    pass


class AuthRateThrottle(IpPostRateThrottle):
    scope = 'auth_minute'


class ResonateRateThrottle(UserPostRateThrottle):
    scope = 'resonate_minute'


class ReportRateThrottle(UserPostRateThrottle):
    scope = 'report_minute'


class MatchGenerateRateThrottle(UserPostRateThrottle):
    scope = 'match_generate_minute'


class DailyTokenRateThrottle(UserPostRateThrottle):
    scope = 'daily_token_minute'


class ChatMessageRateThrottle(UserPostRateThrottle):
    scope = 'chat_message_minute'
