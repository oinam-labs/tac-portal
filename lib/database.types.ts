// Generated types for Supabase schema - tac-cargo project
// Auto-generated via Supabase MCP on 2026-01-21

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_staff_id: string | null;
          after: Json | null;
          before: Json | null;
          created_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          ip_address: string | null;
          org_id: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_staff_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          org_id: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_staff_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          org_id?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_staff_id_fkey';
            columns: ['actor_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_logs_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          address: Json | null;
          billing_address: Json | null;
          created_at: string | null;
          credit_limit: number | null;
          current_balance: number | null;
          customer_code: string;
          deleted_at: string | null;
          email: string | null;
          gstin: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          org_id: string;
          phone: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          address?: Json | null;
          billing_address?: Json | null;
          created_at?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          customer_code: string;
          deleted_at?: string | null;
          email?: string | null;
          gstin?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          org_id: string;
          phone: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          address?: Json | null;
          billing_address?: Json | null;
          created_at?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          customer_code?: string;
          deleted_at?: string | null;
          email?: string | null;
          gstin?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          org_id?: string;
          phone?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      exceptions: {
        Row: {
          assigned_to_staff_id: string | null;
          created_at: string | null;
          description: string;
          id: string;
          images: Json | null;
          org_id: string;
          reported_by_staff_id: string | null;
          resolution: string | null;
          resolved_at: string | null;
          severity: string;
          shipment_id: string;
          status: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_to_staff_id?: string | null;
          created_at?: string | null;
          description: string;
          id?: string;
          images?: Json | null;
          org_id: string;
          reported_by_staff_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          severity?: string;
          shipment_id: string;
          status?: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_to_staff_id?: string | null;
          created_at?: string | null;
          description?: string;
          id?: string;
          images?: Json | null;
          org_id?: string;
          reported_by_staff_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          severity?: string;
          shipment_id?: string;
          status?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'exceptions_assigned_to_staff_id_fkey';
            columns: ['assigned_to_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exceptions_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exceptions_reported_by_staff_id_fkey';
            columns: ['reported_by_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exceptions_shipment_id_fkey';
            columns: ['shipment_id'];
            isOneToOne: false;
            referencedRelation: 'shipments';
            referencedColumns: ['id'];
          },
        ];
      };
      hubs: {
        Row: {
          address: Json | null;
          code: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          org_id: string | null;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          address?: Json | null;
          code: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          org_id?: string | null;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          address?: Json | null;
          code?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          org_id?: string | null;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'hubs_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      invoices: {
        Row: {
          created_at: string | null;
          customer_id: string;
          deleted_at: string | null;
          discount: number | null;
          due_date: string | null;
          id: string;
          invoice_no: string;
          issue_date: string | null;
          line_items: Json | null;
          notes: string | null;
          org_id: string;
          paid_at: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          shipment_id: string | null;
          status: string;
          subtotal: number;
          tax_amount: number | null;
          total: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id: string;
          deleted_at?: string | null;
          discount?: number | null;
          due_date?: string | null;
          id?: string;
          invoice_no?: string;
          issue_date?: string | null;
          line_items?: Json | null;
          notes?: string | null;
          org_id: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          shipment_id?: string | null;
          status?: string;
          subtotal?: number;
          tax_amount?: number | null;
          total?: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string;
          deleted_at?: string | null;
          discount?: number | null;
          due_date?: string | null;
          id?: string;
          invoice_no?: string;
          issue_date?: string | null;
          line_items?: Json | null;
          notes?: string | null;
          org_id?: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          shipment_id?: string | null;
          status?: string;
          subtotal?: number;
          tax_amount?: number | null;
          total?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_shipment_id_fkey';
            columns: ['shipment_id'];
            isOneToOne: false;
            referencedRelation: 'shipments';
            referencedColumns: ['id'];
          },
        ];
      };
      manifest_items: {
        Row: {
          id: string;
          manifest_id: string;
          org_id: string;
          scanned_at: string | null;
          scanned_by_staff_id: string | null;
          shipment_id: string;
        };
        Insert: {
          id?: string;
          manifest_id: string;
          org_id: string;
          scanned_at?: string | null;
          scanned_by_staff_id?: string | null;
          shipment_id: string;
        };
        Update: {
          id?: string;
          manifest_id?: string;
          org_id?: string;
          scanned_at?: string | null;
          scanned_by_staff_id?: string | null;
          shipment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'manifest_items_manifest_id_fkey';
            columns: ['manifest_id'];
            isOneToOne: false;
            referencedRelation: 'manifests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifest_items_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifest_items_scanned_by_staff_id_fkey';
            columns: ['scanned_by_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifest_items_shipment_id_fkey';
            columns: ['shipment_id'];
            isOneToOne: false;
            referencedRelation: 'shipments';
            referencedColumns: ['id'];
          },
        ];
      };
      manifests: {
        Row: {
          arrived_at: string | null;
          closed_at: string | null;
          closed_by_staff_id: string | null;
          created_at: string | null;
          created_by_staff_id: string | null;
          deleted_at: string | null;
          departed_at: string | null;
          driver_name: string | null;
          driver_phone: string | null;
          from_hub_id: string;
          id: string;
          manifest_no: string;
          org_id: string;
          status: string;
          to_hub_id: string;
          total_packages: number | null;
          total_shipments: number | null;
          total_weight: number | null;
          type: string;
          updated_at: string | null;
          vehicle_meta: Json | null;
          vehicle_number: string | null;
        };
        Insert: {
          arrived_at?: string | null;
          closed_at?: string | null;
          closed_by_staff_id?: string | null;
          created_at?: string | null;
          created_by_staff_id?: string | null;
          deleted_at?: string | null;
          departed_at?: string | null;
          driver_name?: string | null;
          driver_phone?: string | null;
          from_hub_id: string;
          id?: string;
          manifest_no: string;
          org_id: string;
          status?: string;
          to_hub_id: string;
          total_packages?: number | null;
          total_shipments?: number | null;
          total_weight?: number | null;
          type: string;
          updated_at?: string | null;
          vehicle_meta?: Json | null;
          vehicle_number?: string | null;
        };
        Update: {
          arrived_at?: string | null;
          closed_at?: string | null;
          closed_by_staff_id?: string | null;
          created_at?: string | null;
          created_by_staff_id?: string | null;
          deleted_at?: string | null;
          departed_at?: string | null;
          driver_name?: string | null;
          driver_phone?: string | null;
          from_hub_id?: string;
          id?: string;
          manifest_no?: string;
          org_id?: string;
          status?: string;
          to_hub_id?: string;
          total_packages?: number | null;
          total_shipments?: number | null;
          total_weight?: number | null;
          type?: string;
          updated_at?: string | null;
          vehicle_meta?: Json | null;
          vehicle_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'manifests_closed_by_staff_id_fkey';
            columns: ['closed_by_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifests_created_by_staff_id_fkey';
            columns: ['created_by_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifests_from_hub_id_fkey';
            columns: ['from_hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifests_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'manifests_to_hub_id_fkey';
            columns: ['to_hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
        ];
      };
      orgs: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          settings: Json | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          settings?: Json | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          settings?: Json | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      packages: {
        Row: {
          created_at: string | null;
          description: string | null;
          dimensions: Json | null;
          id: string;
          org_id: string;
          package_number: number;
          shipment_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          dimensions?: Json | null;
          id?: string;
          org_id: string;
          package_number: number;
          shipment_id: string;
          weight: number;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          dimensions?: Json | null;
          id?: string;
          org_id?: string;
          package_number?: number;
          shipment_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'packages_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'packages_shipment_id_fkey';
            columns: ['shipment_id'];
            isOneToOne: false;
            referencedRelation: 'shipments';
            referencedColumns: ['id'];
          },
        ];
      };
      shipments: {
        Row: {
          awb_number: string;
          cod_amount: number | null;
          contents: string | null;
          created_at: string | null;
          current_hub_id: string | null;
          customer_id: string;
          declared_value: number | null;
          deleted_at: string | null;
          destination_hub_id: string;
          id: string;
          manifest_id: string | null;
          org_id: string;
          origin_hub_id: string;
          payment_mode: string;
          receiver_address: Json;
          receiver_name: string;
          receiver_phone: string;
          sender_address: Json;
          sender_name: string;
          sender_phone: string;
          service_type: string;
          special_instructions: string | null;
          status: string;
          total_packages: number;
          total_weight: number;
          updated_at: string | null;
        };
        Insert: {
          awb_number: string;
          cod_amount?: number | null;
          contents?: string | null;
          created_at?: string | null;
          current_hub_id?: string | null;
          customer_id: string;
          declared_value?: number | null;
          deleted_at?: string | null;
          destination_hub_id: string;
          id?: string;
          manifest_id?: string | null;
          org_id: string;
          origin_hub_id: string;
          payment_mode?: string;
          receiver_address: Json;
          receiver_name: string;
          receiver_phone: string;
          sender_address: Json;
          sender_name: string;
          sender_phone: string;
          service_type?: string;
          special_instructions?: string | null;
          status?: string;
          total_packages?: number;
          total_weight: number;
          updated_at?: string | null;
        };
        Update: {
          awb_number?: string;
          cod_amount?: number | null;
          contents?: string | null;
          created_at?: string | null;
          current_hub_id?: string | null;
          customer_id?: string;
          declared_value?: number | null;
          deleted_at?: string | null;
          destination_hub_id?: string;
          id?: string;
          manifest_id?: string | null;
          org_id?: string;
          origin_hub_id?: string;
          payment_mode?: string;
          receiver_address?: Json;
          receiver_name?: string;
          receiver_phone?: string;
          sender_address?: Json;
          sender_name?: string;
          sender_phone?: string;
          service_type?: string;
          special_instructions?: string | null;
          status?: string;
          total_packages?: number;
          total_weight?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'shipments_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'shipments_destination_hub_id_fkey';
            columns: ['destination_hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'shipments_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'shipments_origin_hub_id_fkey';
            columns: ['origin_hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
        ];
      };
      staff: {
        Row: {
          auth_user_id: string | null;
          created_at: string | null;
          email: string;
          full_name: string;
          hub_id: string | null;
          id: string;
          is_active: boolean | null;
          org_id: string;
          phone: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          auth_user_id?: string | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          hub_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          org_id: string;
          phone?: string | null;
          role: string;
          updated_at?: string | null;
        };
        Update: {
          auth_user_id?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          hub_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          org_id?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'staff_hub_id_fkey';
            columns: ['hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'staff_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      tracking_events: {
        Row: {
          actor_staff_id: string | null;
          awb_number: string;
          created_at: string | null;
          event_code: string;
          event_time: string | null;
          hub_id: string | null;
          id: string;
          location: string | null;
          meta: Json | null;
          notes: string | null;
          org_id: string;
          shipment_id: string;
          source: string;
        };
        Insert: {
          actor_staff_id?: string | null;
          awb_number: string;
          created_at?: string | null;
          event_code: string;
          event_time?: string | null;
          hub_id?: string | null;
          id?: string;
          location?: string | null;
          meta?: Json | null;
          notes?: string | null;
          org_id: string;
          shipment_id: string;
          source?: string;
        };
        Update: {
          actor_staff_id?: string | null;
          awb_number?: string;
          created_at?: string | null;
          event_code?: string;
          event_time?: string | null;
          hub_id?: string | null;
          id?: string;
          location?: string | null;
          meta?: Json | null;
          notes?: string | null;
          org_id?: string;
          shipment_id?: string;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tracking_events_actor_staff_id_fkey';
            columns: ['actor_staff_id'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tracking_events_hub_id_fkey';
            columns: ['hub_id'];
            isOneToOne: false;
            referencedRelation: 'hubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tracking_events_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tracking_events_shipment_id_fkey';
            columns: ['shipment_id'];
            isOneToOne: false;
            referencedRelation: 'shipments';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_hub: { Args: { hub_id: string }; Returns: boolean };
      generate_awb_number:
        | { Args: Record<string, never>; Returns: string }
        | { Args: { p_org_id: string }; Returns: string };
      get_current_org_id: { Args: Record<string, never>; Returns: string };
      get_user_hub_id: { Args: Record<string, never>; Returns: string };
      get_user_org_id: { Args: Record<string, never>; Returns: string };
      has_role: { Args: { required_roles: string[] }; Returns: boolean };
      is_warehouse_role: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type Org = Tables<'orgs'>;
export type Hub = Tables<'hubs'>;
export type Staff = Tables<'staff'>;
export type Customer = Tables<'customers'>;
export type Shipment = Tables<'shipments'>;
export type Package = Tables<'packages'>;
export type Invoice = Tables<'invoices'>;
export type AuditLog = Tables<'audit_logs'>;
export type Exception = Tables<'exceptions'>;
export type Manifest = Tables<'manifests'>;
export type ManifestItem = Tables<'manifest_items'>;
export type TrackingEvent = Tables<'tracking_events'>;
