"""
API Helper for TestSprite Tests
Provides utilities for making API requests with proper error handling and JSON responses.
"""

import requests
import json
from typing import Optional, Tuple, Any
from config import (
    SUPABASE_URL,
    ENDPOINTS,
    REQUEST_TIMEOUT,
    get_headers,
    validate_config,
)
from auth_helper import auth, ensure_authenticated


class APIResponse:
    """Standardized API response wrapper."""
    
    def __init__(
        self,
        status_code: int,
        data: Any = None,
        error: str = None,
        error_code: str = None
    ):
        self.status_code = status_code
        self.data = data
        self.error = error
        self.error_code = error_code
        self.success = 200 <= status_code < 300 and error is None
    
    def to_dict(self) -> dict:
        """Convert response to dictionary."""
        if self.success:
            return {
                'success': True,
                'status_code': self.status_code,
                'data': self.data
            }
        return {
            'success': False,
            'status_code': self.status_code,
            'error': self.error,
            'error_code': self.error_code
        }
    
    def __repr__(self):
        return f"APIResponse(status={self.status_code}, success={self.success})"


class APIHelper:
    """Helper class for making API requests to TAC Cargo Portal backend."""
    
    def __init__(self):
        self._validate_on_init()
    
    def _validate_on_init(self):
        """Validate configuration on initialization."""
        try:
            validate_config()
        except EnvironmentError as e:
            print(f"Warning: {e}")
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: dict = None,
        params: dict = None,
        require_auth: bool = True
    ) -> APIResponse:
        """
        Make an API request with proper error handling.
        
        Args:
            method: HTTP method
            endpoint: API endpoint (full URL or path)
            data: Request body
            params: Query parameters
            require_auth: Whether authentication is required
        
        Returns:
            APIResponse object
        """
        # Ensure full URL
        if not endpoint.startswith('http'):
            endpoint = f"{SUPABASE_URL}/rest/v1/{endpoint}"
        
        # Get headers
        if require_auth:
            if not auth.is_authenticated:
                return APIResponse(
                    status_code=401,
                    error='Not authenticated. Call auth.login() first.',
                    error_code='NOT_AUTHENTICATED'
                )
            headers = auth.get_authenticated_headers()
        else:
            headers = get_headers()
        
        try:
            response = requests.request(
                method=method,
                url=endpoint,
                headers=headers,
                json=data,
                params=params,
                timeout=REQUEST_TIMEOUT
            )
            
            # Handle empty responses (204 No Content)
            if response.status_code == 204:
                return APIResponse(status_code=204, data=None)
            
            # Parse JSON response
            try:
                response_data = response.json()
            except json.JSONDecodeError:
                # Response is not valid JSON
                if response.status_code >= 400:
                    return APIResponse(
                        status_code=response.status_code,
                        error=f'Non-JSON error response: {response.text[:200]}',
                        error_code='INVALID_JSON_RESPONSE'
                    )
                # Success response but not JSON (unusual)
                return APIResponse(
                    status_code=response.status_code,
                    data={'raw': response.text}
                )
            
            # Check for error responses
            if response.status_code >= 400:
                error_msg = response_data.get('message') or response_data.get('error') or str(response_data)
                error_code = response_data.get('code') or f'HTTP_{response.status_code}'
                return APIResponse(
                    status_code=response.status_code,
                    error=error_msg,
                    error_code=error_code
                )
            
            return APIResponse(status_code=response.status_code, data=response_data)
            
        except requests.exceptions.Timeout:
            return APIResponse(
                status_code=408,
                error='Request timed out',
                error_code='TIMEOUT'
            )
        except requests.exceptions.ConnectionError as e:
            return APIResponse(
                status_code=0,
                error=f'Connection error: {str(e)}',
                error_code='CONNECTION_ERROR'
            )
        except Exception as e:
            return APIResponse(
                status_code=500,
                error=str(e),
                error_code='UNKNOWN_ERROR'
            )
    
    # =========================================================================
    # SHIPMENTS API
    # =========================================================================
    
    def create_shipment(self, shipment_data: dict) -> APIResponse:
        """Create a new shipment."""
        return self._make_request('POST', 'shipments', data=shipment_data)
    
    def get_shipment(self, shipment_id: str) -> APIResponse:
        """Get a shipment by ID."""
        return self._make_request('GET', f'shipments?id=eq.{shipment_id}&select=*')
    
    def get_shipment_by_awb(self, awb_number: str) -> APIResponse:
        """Get a shipment by AWB number."""
        return self._make_request('GET', f'shipments?awb_number=eq.{awb_number}&select=*')
    
    def update_shipment(self, shipment_id: str, updates: dict) -> APIResponse:
        """Update a shipment."""
        return self._make_request(
            'PATCH',
            f'shipments?id=eq.{shipment_id}',
            data=updates
        )
    
    def update_shipment_status(self, shipment_id: str, status: str) -> APIResponse:
        """Update shipment status."""
        return self.update_shipment(shipment_id, {'status': status})
    
    # =========================================================================
    # MANIFESTS API
    # =========================================================================
    
    def create_manifest(self, manifest_data: dict) -> APIResponse:
        """Create a new manifest."""
        return self._make_request('POST', 'manifests', data=manifest_data)
    
    def get_manifest(self, manifest_id: str) -> APIResponse:
        """Get a manifest by ID."""
        return self._make_request('GET', f'manifests?id=eq.{manifest_id}&select=*')
    
    def update_manifest_status(self, manifest_id: str, status: str) -> APIResponse:
        """Update manifest status."""
        return self._make_request(
            'PATCH',
            f'manifests?id=eq.{manifest_id}',
            data={'status': status}
        )
    
    def close_manifest(self, manifest_id: str) -> APIResponse:
        """Close an open manifest."""
        return self.update_manifest_status(manifest_id, 'CLOSED')
    
    def add_shipment_to_manifest(self, manifest_id: str, shipment_id: str) -> APIResponse:
        """Add a shipment to a manifest."""
        return self._make_request(
            'POST',
            'manifest_items',
            data={
                'manifest_id': manifest_id,
                'shipment_id': shipment_id
            }
        )
    
    # =========================================================================
    # INVOICES API
    # =========================================================================
    
    def create_invoice(self, invoice_data: dict) -> APIResponse:
        """Create a new invoice."""
        return self._make_request('POST', 'invoices', data=invoice_data)
    
    def get_invoice(self, invoice_id: str) -> APIResponse:
        """Get an invoice by ID."""
        return self._make_request('GET', f'invoices?id=eq.{invoice_id}&select=*')
    
    def update_invoice_status(self, invoice_id: str, status: str) -> APIResponse:
        """Update invoice status."""
        return self._make_request(
            'PATCH',
            f'invoices?id=eq.{invoice_id}',
            data={'status': status}
        )
    
    # =========================================================================
    # CUSTOMERS API
    # =========================================================================
    
    def create_customer(self, customer_data: dict) -> APIResponse:
        """Create a new customer."""
        return self._make_request('POST', 'customers', data=customer_data)
    
    def get_customer(self, customer_id: str) -> APIResponse:
        """Get a customer by ID."""
        return self._make_request('GET', f'customers?id=eq.{customer_id}&select=*')
    
    # =========================================================================
    # HUBS API
    # =========================================================================
    
    def list_hubs(self) -> APIResponse:
        """List all hubs."""
        return self._make_request('GET', 'hubs?select=*')


# Singleton instance
api = APIHelper()


def test_api_connection() -> Tuple[bool, str]:
    """Test API connectivity and authentication."""
    # First test: unauthenticated request to check URL
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=get_headers(),
            timeout=10
        )
        if response.status_code == 404:
            # This is expected - the root endpoint doesn't exist
            pass
        elif response.status_code >= 500:
            return False, f"Server error: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, f"Cannot connect to {SUPABASE_URL}. Check VITE_SUPABASE_URL."
    except Exception as e:
        return False, str(e)
    
    # Second test: authentication
    success, result = auth.login()
    if not success:
        return False, f"Authentication failed: {result.get('error')}"
    
    # Third test: authenticated request
    hubs_response = api.list_hubs()
    if not hubs_response.success and hubs_response.error_code != 'NOT_AUTHENTICATED':
        return False, f"API request failed: {hubs_response.error}"
    
    return True, "API connection and authentication successful"


if __name__ == '__main__':
    print("Testing API connection...")
    success, message = test_api_connection()
    
    if success:
        print(f"✓ {message}")
    else:
        print(f"✗ {message}")
