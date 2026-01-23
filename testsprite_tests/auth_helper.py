"""
Authentication Helper for TestSprite API Tests
Provides utilities for authenticating with Supabase and managing JWT tokens.
"""

import requests
import json
from typing import Optional, Tuple
from config import (
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
    REQUEST_TIMEOUT,
    AUTH_TIMEOUT,
    get_headers,
    validate_config,
)


class AuthHelper:
    """Helper class for managing authentication in API tests."""
    
    def __init__(self):
        self._access_token: Optional[str] = None
        self._refresh_token: Optional[str] = None
        self._user_id: Optional[str] = None
    
    @property
    def access_token(self) -> Optional[str]:
        return self._access_token
    
    @property
    def user_id(self) -> Optional[str]:
        return self._user_id
    
    @property
    def is_authenticated(self) -> bool:
        return self._access_token is not None
    
    def login(self, email: str = None, password: str = None) -> Tuple[bool, dict]:
        """
        Authenticate with Supabase and obtain JWT token.
        
        Args:
            email: User email (defaults to TEST_USER_EMAIL)
            password: User password (defaults to TEST_USER_PASSWORD)
        
        Returns:
            Tuple of (success: bool, response_data: dict)
        """
        # Validate configuration first
        try:
            validate_config()
        except EnvironmentError as e:
            return False, {'error': str(e), 'code': 'CONFIG_ERROR'}
        
        email = email or TEST_USER_EMAIL
        password = password or TEST_USER_PASSWORD
        
        if not email or not password:
            return False, {
                'error': 'Test credentials not configured. Set TEST_USER_EMAIL and TEST_USER_PASSWORD.',
                'code': 'MISSING_CREDENTIALS'
            }
        
        url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        }
        
        payload = {
            'email': email,
            'password': password,
        }
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=AUTH_TIMEOUT
            )
            
            # Ensure we can parse JSON
            try:
                data = response.json()
            except json.JSONDecodeError:
                return False, {
                    'error': 'Invalid JSON response from auth server',
                    'code': 'INVALID_RESPONSE',
                    'raw': response.text[:200]
                }
            
            if response.status_code == 200:
                self._access_token = data.get('access_token')
                self._refresh_token = data.get('refresh_token')
                self._user_id = data.get('user', {}).get('id')
                return True, data
            else:
                return False, {
                    'error': data.get('error_description', data.get('message', 'Authentication failed')),
                    'code': data.get('error', 'AUTH_FAILED'),
                    'status_code': response.status_code
                }
                
        except requests.exceptions.Timeout:
            return False, {'error': 'Authentication request timed out', 'code': 'TIMEOUT'}
        except requests.exceptions.ConnectionError as e:
            return False, {
                'error': f'Connection error: {str(e)}',
                'code': 'CONNECTION_ERROR',
                'hint': 'Check that SUPABASE_URL is correct and accessible'
            }
        except Exception as e:
            return False, {'error': str(e), 'code': 'UNKNOWN_ERROR'}
    
    def logout(self) -> Tuple[bool, dict]:
        """Log out and clear tokens."""
        if not self._access_token:
            return True, {'message': 'Already logged out'}
        
        url = f"{SUPABASE_URL}/auth/v1/logout"
        
        try:
            response = requests.post(
                url,
                headers=get_headers(self._access_token),
                timeout=AUTH_TIMEOUT
            )
            
            # Clear tokens regardless of response
            self._access_token = None
            self._refresh_token = None
            self._user_id = None
            
            if response.status_code in [200, 204]:
                return True, {'message': 'Logged out successfully'}
            else:
                return True, {'message': 'Tokens cleared locally'}
                
        except Exception as e:
            # Clear tokens even on error
            self._access_token = None
            self._refresh_token = None
            self._user_id = None
            return True, {'message': f'Tokens cleared (logout request failed: {e})'}
    
    def refresh_session(self) -> Tuple[bool, dict]:
        """Refresh the access token using the refresh token."""
        if not self._refresh_token:
            return False, {'error': 'No refresh token available', 'code': 'NO_REFRESH_TOKEN'}
        
        url = f"{SUPABASE_URL}/auth/v1/token?grant_type=refresh_token"
        
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        }
        
        payload = {
            'refresh_token': self._refresh_token
        }
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=AUTH_TIMEOUT
            )
            
            data = response.json()
            
            if response.status_code == 200:
                self._access_token = data.get('access_token')
                self._refresh_token = data.get('refresh_token')
                return True, data
            else:
                return False, {
                    'error': data.get('error_description', 'Token refresh failed'),
                    'code': data.get('error', 'REFRESH_FAILED')
                }
                
        except Exception as e:
            return False, {'error': str(e), 'code': 'UNKNOWN_ERROR'}
    
    def get_authenticated_headers(self) -> dict:
        """Get headers with authentication token for API requests."""
        if not self._access_token:
            raise RuntimeError("Not authenticated. Call login() first.")
        return get_headers(self._access_token)
    
    def make_authenticated_request(
        self,
        method: str,
        url: str,
        data: dict = None,
        params: dict = None
    ) -> Tuple[int, dict]:
        """
        Make an authenticated API request.
        
        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            url: Full URL to request
            data: Request body (for POST/PATCH)
            params: Query parameters
        
        Returns:
            Tuple of (status_code, response_data)
        """
        if not self._access_token:
            return 401, {'error': 'Not authenticated', 'code': 'NOT_AUTHENTICATED'}
        
        headers = self.get_authenticated_headers()
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params,
                timeout=REQUEST_TIMEOUT
            )
            
            # Handle empty responses
            if response.status_code == 204:
                return 204, {}
            
            # Try to parse JSON
            try:
                return response.status_code, response.json()
            except json.JSONDecodeError:
                return response.status_code, {
                    'error': 'Invalid JSON response',
                    'raw': response.text[:500]
                }
                
        except requests.exceptions.Timeout:
            return 408, {'error': 'Request timed out', 'code': 'TIMEOUT'}
        except requests.exceptions.ConnectionError:
            return 0, {'error': 'Connection failed', 'code': 'CONNECTION_ERROR'}
        except Exception as e:
            return 500, {'error': str(e), 'code': 'REQUEST_ERROR'}


# Singleton instance for convenience
auth = AuthHelper()


def ensure_authenticated():
    """Decorator/helper to ensure authentication before API tests."""
    if not auth.is_authenticated:
        success, result = auth.login()
        if not success:
            raise RuntimeError(f"Authentication failed: {result.get('error')}")
    return auth


if __name__ == '__main__':
    # Test authentication when run directly
    print("Testing authentication...")
    
    try:
        validate_config()
    except EnvironmentError as e:
        print(f"✗ {e}")
        exit(1)
    
    success, result = auth.login()
    
    if success:
        print("✓ Authentication successful")
        print(f"  User ID: {auth.user_id}")
        print(f"  Token: {auth.access_token[:20]}...")
        
        # Test logout
        auth.logout()
        print("✓ Logout successful")
    else:
        print(f"✗ Authentication failed: {result.get('error')}")
        print(f"  Code: {result.get('code')}")
        if 'hint' in result:
            print(f"  Hint: {result.get('hint')}")
