// Generated types for Supabase schema - tac-cargo project
// Auto-generated via Supabase MCP on 2026-01-17

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      hubs: {
        Row: {
          id: string;
          code: 'IMPHAL' | 'NEW_DELHI';
          name: string;
          address: Json;
          timezone: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          code: 'IMPHAL' | 'NEW_DELHI';
          name: string;
          address: Json;
          timezone?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          code?: 'IMPHAL' | 'NEW_DELHI';
          name?: string;
          address?: Json;
          timezone?: string;
          is_active?: boolean;
        };
      };
      staff: {
        Row: {
          id: string;
          org_id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string;
          role:
            | 'ADMIN'
            | 'MANAGER'
            | 'WAREHOUSE_IMPHAL'
            | 'WAREHOUSE_DELHI'
            | 'OPS'
            | 'INVOICE'
            | 'SUPPORT';
          hub_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          auth_user_id?: string | null;
          email: string;
          full_name: string;
          role:
            | 'ADMIN'
            | 'MANAGER'
            | 'WAREHOUSE_IMPHAL'
            | 'WAREHOUSE_DELHI'
            | 'OPS'
            | 'INVOICE'
            | 'SUPPORT';
          hub_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          auth_user_id?: string | null;
          email?: string;
          full_name?: string;
          role?:
            | 'ADMIN'
            | 'MANAGER'
            | 'WAREHOUSE_IMPHAL'
            | 'WAREHOUSE_DELHI'
            | 'OPS'
            | 'INVOICE'
            | 'SUPPORT';
          hub_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          org_id: string;
          customer_code: string;
          name: string;
          phone: string;
          email: string | null;
          gstin: string | null;
          type: 'individual' | 'business';
          address: Json;
          billing_address: Json | null;
          credit_limit: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          customer_code: string;
          name: string;
          phone: string;
          email?: string | null;
          gstin?: string | null;
          type?: 'individual' | 'business';
          address: Json;
          billing_address?: Json | null;
          credit_limit?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          customer_code?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          gstin?: string | null;
          type?: 'individual' | 'business';
          address?: Json;
          billing_address?: Json | null;
          credit_limit?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      shipments: {
        Row: {
          id: string;
          org_id: string;
          awb_number: string;
          customer_id: string;
          origin_hub_id: string;
          destination_hub_id: string;
          mode: 'AIR' | 'TRUCK';
          service_level: 'STANDARD' | 'EXPRESS';
          status:
            | 'CREATED'
            | 'RECEIVED'
            | 'LOADED_FOR_LINEHAUL'
            | 'IN_TRANSIT'
            | 'RECEIVED_AT_DEST'
            | 'OUT_FOR_DELIVERY'
            | 'DELIVERED'
            | 'EXCEPTION'
            | 'CANCELLED';
          package_count: number;
          total_weight: number;
          declared_value: number | null;
          invoice_id: string | null;
          manifest_id: string | null;
          consignee_name: string;
          consignee_phone: string;
          consignee_address: Json;
          special_instructions: string | null;
          totals: Json;
          version: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          awb_number: string;
          customer_id: string;
          origin_hub_id: string;
          destination_hub_id: string;
          mode: 'AIR' | 'TRUCK';
          service_level: 'STANDARD' | 'EXPRESS';
          status?:
            | 'CREATED'
            | 'RECEIVED'
            | 'LOADED_FOR_LINEHAUL'
            | 'IN_TRANSIT'
            | 'RECEIVED_AT_DEST'
            | 'OUT_FOR_DELIVERY'
            | 'DELIVERED'
            | 'EXCEPTION'
            | 'CANCELLED';
          package_count?: number;
          total_weight: number;
          declared_value?: number | null;
          invoice_id?: string | null;
          manifest_id?: string | null;
          consignee_name: string;
          consignee_phone: string;
          consignee_address: Json;
          special_instructions?: string | null;
          totals?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          awb_number?: string;
          customer_id?: string;
          origin_hub_id?: string;
          destination_hub_id?: string;
          mode?: 'AIR' | 'TRUCK';
          service_level?: 'STANDARD' | 'EXPRESS';
          status?:
            | 'CREATED'
            | 'RECEIVED'
            | 'LOADED_FOR_LINEHAUL'
            | 'IN_TRANSIT'
            | 'RECEIVED_AT_DEST'
            | 'OUT_FOR_DELIVERY'
            | 'DELIVERED'
            | 'EXCEPTION'
            | 'CANCELLED';
          package_count?: number;
          total_weight?: number;
          declared_value?: number | null;
          invoice_id?: string | null;
          manifest_id?: string | null;
          consignee_name?: string;
          consignee_phone?: string;
          consignee_address?: Json;
          special_instructions?: string | null;
          totals?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      packages: {
        Row: {
          id: string;
          org_id: string;
          shipment_id: string;
          package_no: number;
          package_id: string;
          weight: number;
          dimensions: Json | null;
          status: string;
          current_hub_id: string | null;
          bin_location: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          shipment_id: string;
          package_no: number;
          package_id: string;
          weight: number;
          dimensions?: Json | null;
          status?: string;
          current_hub_id?: string | null;
          bin_location?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          shipment_id?: string;
          package_no?: number;
          package_id?: string;
          weight?: number;
          dimensions?: Json | null;
          status?: string;
          current_hub_id?: string | null;
          bin_location?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      manifests: {
        Row: {
          id: string;
          org_id: string;
          manifest_no: string;
          type: 'AIR' | 'TRUCK';
          from_hub_id: string;
          to_hub_id: string;
          status: 'OPEN' | 'CLOSED' | 'DEPARTED' | 'ARRIVED';
          vehicle_meta: Json | null;
          total_shipments: number;
          total_packages: number;
          total_weight: number;
          created_by_staff_id: string;
          closed_at: string | null;
          departed_at: string | null;
          arrived_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          manifest_no: string;
          type: 'AIR' | 'TRUCK';
          from_hub_id: string;
          to_hub_id: string;
          status?: 'OPEN' | 'CLOSED' | 'DEPARTED' | 'ARRIVED';
          vehicle_meta?: Json | null;
          total_shipments?: number;
          total_packages?: number;
          total_weight?: number;
          created_by_staff_id: string;
          closed_at?: string | null;
          departed_at?: string | null;
          arrived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          manifest_no?: string;
          type?: 'AIR' | 'TRUCK';
          from_hub_id?: string;
          to_hub_id?: string;
          status?: 'OPEN' | 'CLOSED' | 'DEPARTED' | 'ARRIVED';
          vehicle_meta?: Json | null;
          total_shipments?: number;
          total_packages?: number;
          total_weight?: number;
          created_by_staff_id?: string;
          closed_at?: string | null;
          departed_at?: string | null;
          arrived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      manifest_items: {
        Row: {
          id: string;
          org_id: string;
          manifest_id: string;
          shipment_id: string;
          scanned_by_staff_id: string | null;
          scanned_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          manifest_id: string;
          shipment_id: string;
          scanned_by_staff_id?: string | null;
          scanned_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          manifest_id?: string;
          shipment_id?: string;
          scanned_by_staff_id?: string | null;
          scanned_at?: string | null;
        };
      };
      tracking_events: {
        Row: {
          id: string;
          org_id: string;
          shipment_id: string;
          awb_number: string;
          event_code: string;
          event_time: string;
          hub_id: string | null;
          actor_staff_id: string | null;
          source: 'SCAN' | 'MANUAL' | 'SYSTEM' | 'API';
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          shipment_id: string;
          awb_number: string;
          event_code: string;
          event_time?: string;
          hub_id?: string | null;
          actor_staff_id?: string | null;
          source: 'SCAN' | 'MANUAL' | 'SYSTEM' | 'API';
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          shipment_id?: string;
          awb_number?: string;
          event_code?: string;
          event_time?: string;
          hub_id?: string | null;
          actor_staff_id?: string | null;
          source?: 'SCAN' | 'MANUAL' | 'SYSTEM' | 'API';
          meta?: Json;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          org_id: string;
          invoice_no: string;
          customer_id: string;
          shipment_id: string | null;
          status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
          issue_date: string | null;
          due_date: string | null;
          line_items: Json;
          subtotal: number;
          tax: Json | null;
          total: number;
          payment_terms: string | null;
          notes: string | null;
          pdf_file_path: string | null;
          label_file_path: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          invoice_no: string;
          customer_id: string;
          shipment_id?: string | null;
          status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
          issue_date?: string | null;
          due_date?: string | null;
          line_items: Json;
          subtotal: number;
          tax?: Json | null;
          total: number;
          payment_terms?: string | null;
          notes?: string | null;
          pdf_file_path?: string | null;
          label_file_path?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          invoice_no?: string;
          customer_id?: string;
          shipment_id?: string | null;
          status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
          issue_date?: string | null;
          due_date?: string | null;
          line_items?: Json;
          subtotal?: number;
          tax?: Json | null;
          total?: number;
          payment_terms?: string | null;
          notes?: string | null;
          pdf_file_path?: string | null;
          label_file_path?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      exceptions: {
        Row: {
          id: string;
          org_id: string;
          shipment_id: string;
          type:
            | 'DAMAGED'
            | 'LOST'
            | 'DELAYED'
            | 'MISMATCH'
            | 'PAYMENT_HOLD'
            | 'MISROUTE'
            | 'ADDRESS_ISSUE';
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
          description: string;
          resolution: string | null;
          assigned_to_staff_id: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          shipment_id: string;
          type:
            | 'DAMAGED'
            | 'LOST'
            | 'DELAYED'
            | 'MISMATCH'
            | 'PAYMENT_HOLD'
            | 'MISROUTE'
            | 'ADDRESS_ISSUE';
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
          description: string;
          resolution?: string | null;
          assigned_to_staff_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          shipment_id?: string;
          type?:
            | 'DAMAGED'
            | 'LOST'
            | 'DELAYED'
            | 'MISMATCH'
            | 'PAYMENT_HOLD'
            | 'MISROUTE'
            | 'ADDRESS_ISSUE';
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
          description?: string;
          resolution?: string | null;
          assigned_to_staff_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string;
          actor_staff_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          before: Json | null;
          after: Json | null;
          request_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_staff_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          before?: Json | null;
          after?: Json | null;
          request_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          actor_staff_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          before?: Json | null;
          after?: Json | null;
          request_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_awb_number: {
        Args: { p_org_id: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
