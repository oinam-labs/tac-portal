"""
TestSprite Configuration for TAC Cargo Portal
This file contains environment configuration for API testing.

IMPORTANT: Copy .env.test.example to .env.test and fill in actual values before running tests.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env.test file
env_path = Path(__file__).parent.parent / '.env.test'
if env_path.exists():
    load_dotenv(env_path)
else:
    # Fallback to .env.local
    env_local = Path(__file__).parent.parent / '.env.local'
    if env_local.exists():
        load_dotenv(env_local)

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================

# CRITICAL: Replace placeholder URLs with actual Supabase project URL
# The URL format should be: https://<project-id>.supabase.co
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://xkkhxhgkyavxcfgeojww.supabase.co')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_KI1Xm0_j_Vz-tiQtdoWgyA__1_IPPwq')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# Validate configuration
def validate_config():
    """Validate that Supabase configuration is properly set."""
    errors = []
    
    if not SUPABASE_URL or 'your-project' in SUPABASE_URL:
        errors.append(
            "SUPABASE_URL is not configured. "
            "Please set VITE_SUPABASE_URL in .env.test or .env.local"
        )
    
    if not SUPABASE_ANON_KEY or SUPABASE_ANON_KEY == 'your-anon-key-here':
        errors.append(
            "SUPABASE_ANON_KEY is not configured. "
            "Please set VITE_SUPABASE_ANON_KEY in .env.test or .env.local"
        )
    
    if errors:
        raise EnvironmentError(
            "TestSprite configuration errors:\n" + "\n".join(f"  - {e}" for e in errors)
        )
    
    return True

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')

# =============================================================================
# TEST USER CREDENTIALS
# =============================================================================

TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'tapancargo@gmail.com')
TEST_USER_PASSWORD = os.getenv('TEST_USER_PASSWORD', 'Test@1498')

# =============================================================================
# API ENDPOINTS
# =============================================================================

class Endpoints:
    """Supabase API endpoints for TAC Cargo Portal."""
    
    @property
    def auth_login(self):
        return f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    @property
    def auth_signup(self):
        return f"{SUPABASE_URL}/auth/v1/signup"
    
    @property
    def auth_logout(self):
        return f"{SUPABASE_URL}/auth/v1/logout"
    
    @property
    def rest_base(self):
        return f"{SUPABASE_URL}/rest/v1"
    
    def table(self, table_name: str):
        return f"{self.rest_base}/{table_name}"
    
    def rpc(self, function_name: str):
        return f"{self.rest_base}/rpc/{function_name}"

ENDPOINTS = Endpoints()

# =============================================================================
# REQUEST HEADERS
# =============================================================================

def get_headers(access_token: str = None) -> dict:
    """Get request headers for Supabase API calls."""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    }
    
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    else:
        headers['Authorization'] = f'Bearer {SUPABASE_ANON_KEY}'
    
    return headers

def get_service_headers() -> dict:
    """Get headers with service role key for admin operations."""
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise EnvironmentError("SUPABASE_SERVICE_ROLE_KEY not configured")
    
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    }

# =============================================================================
# TIMEOUT CONFIGURATION
# =============================================================================

REQUEST_TIMEOUT = 30  # seconds
AUTH_TIMEOUT = 10  # seconds

# =============================================================================
# TEST DATA
# =============================================================================

# Sample test data for various modules
TEST_DATA = {
    'shipment': {
        'receiver_name': 'Test Receiver',
        'receiver_phone': '+91 9876543210',
        'receiver_address': {
            'line1': '123 Test Street',
            'city': 'New Delhi',
            'state': 'Delhi',
            'pincode': '110001'
        },
        'sender_name': 'Test Sender',
        'sender_phone': '+91 9876543211',
        'total_weight': 5.0,
        'package_count': 1,
        'service_level': 'STANDARD',
        'payment_mode': 'PREPAID',
    },
    'manifest': {
        'type': 'AIR',
        'status': 'DRAFT',
    },
    'invoice': {
        'status': 'DRAFT',
        'subtotal': 1000.00,
        'tax_rate': 18.0,
    }
}


if __name__ == '__main__':
    # Validate configuration when run directly
    try:
        validate_config()
        print("✓ TestSprite configuration is valid")
        print(f"  Supabase URL: {SUPABASE_URL}")
        print(f"  Base URL: {BASE_URL}")
    except EnvironmentError as e:
        print(f"✗ Configuration error:\n{e}")
