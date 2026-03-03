from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Skip CSRF enforcement for server-to-server calls from the React Router Node process."""

    def enforce_csrf(self, request):
        return
