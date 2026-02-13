/**
 * CyberComponents — DEPRECATED
 *
 * This module now re-exports from canonical UI components for backward
 * compatibility. New code should import directly from the canonical paths:
 *   - @/components/ui/card
 *   - @/components/ui/button
 *   - @/components/ui/input
 *   - @/components/ui/badge
 *   - @/components/ui/table
 */

// Re-export canonical components
export { Card } from './card';
export { Button } from './button';
export { Input } from './input';
export { Badge } from './badge';
export { Table, TableHead as Th, TableCell as Td } from './table';
