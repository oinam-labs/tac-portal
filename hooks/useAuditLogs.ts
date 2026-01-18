import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Type helper for Supabase client
const db = supabase as any;

export interface AuditLog {
  id: string;
  org_id: string;
  actor_staff_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before: any;
  after: any;
  request_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  staff?: { full_name: string; email: string };
}

export function useAuditLogs(options?: { limit?: number; entityType?: string }) {
  return useQuery({
    queryKey: ['audit-logs', options],
    queryFn: async () => {
      let query = db
        .from('audit_logs')
        .select(`
          *,
          staff:staff(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (options?.entityType) {
        query = query.eq('entity_type', options.entityType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}
