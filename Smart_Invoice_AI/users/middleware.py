class JWTAuthCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get('access_token')
        if access_token:
            print("injecting access token")
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        else:
            print("access token not found in cookies")
        response = self.get_response(request)
        return response