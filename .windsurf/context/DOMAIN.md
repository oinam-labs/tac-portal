# Domain Context — TAC Cargo Logistics

## Overview
TAC Cargo is an enterprise logistics operations platform handling air and ground freight shipments across multiple hubs.

## Key Entities

### Customer
Sender or receiver identity with contact and address information.
- **Table**: `customers`
- **Key fields**: `customer_code`, `name`, `phone`, `email`, `address`, `gstin`
- **Types**: SENDER, RECEIVER, BOTH

### Shipment
A cargo consignment with one or more packages traveling together.
- **Table**: `shipments`
- **Key fields**: `awb_number` (TAC########), `status`, `consignee_name`, `origin_hub_id`, `destination_hub_id`
- **Relations**: customer, origin_hub, destination_hub, invoice, manifest

### Hub
Physical location (warehouse, terminal, distribution center).
- **Table**: `hubs`
- **Key fields**: `code`, `name`, `type`, `address`
- **Hub codes**: IXA (Agartala), IMF (Imphal), GAU (Guwahati), DEL (Delhi), etc.

### Manifest
Dispatch document listing shipments loaded on a vehicle/flight.
- **Table**: `manifests`, `manifest_items`
- **Key fields**: `manifest_no` (MNF-YYYY-NNNNNN), `type` (AIR/TRUCK), `status`, `from_hub_id`, `to_hub_id`
- **Lifecycle**: OPEN → CLOSED → DEPARTED → ARRIVED

### Invoice
Financial document for billing customers.
- **Table**: `invoices`, `invoice_counters`
- **Key fields**: `invoice_no` (INV-YYYY-NNNN), `status`, `customer_id`, `total`
- **Lifecycle**: ISSUED → PAID | CANCELLED

### Tracking Event
Immutable audit record of shipment movement.
- **Table**: `tracking_events`
- **Key fields**: `shipment_id`, `awb_number`, `event_code`, `hub_id`, `event_time`, `source`
- **Insert-only**: Never update or delete

### Exception
Operational issue requiring resolution.
- **Table**: `exceptions`
- **Key fields**: `shipment_id`, `type`, `severity`, `status`, `resolution`
- **Lifecycle**: OPEN → IN_PROGRESS → RESOLVED → CLOSED

### Staff
Operators and administrators.
- **Table**: `staff`
- **Key fields**: `user_id` (Supabase Auth), `full_name`, `role`, `hub_id`
- **Roles**: ADMIN, SUPERVISOR, OPERATOR, VIEWER

### Organization
Multi-tenant org container.
- **Table**: `orgs`
- **Key fields**: `name`, `slug`
- **All data scoped by org_id**

## Guiding Principles

1. **Audit-first**: Every state change must be traceable
2. **Immutable events**: Tracking events are never modified
3. **Soft deletes**: Core entities are never hard-deleted
4. **Idempotent operations**: Duplicate actions don't corrupt data
5. **Org isolation**: All queries scoped by org_id (multi-tenancy)
