# Status Model — TAC Cargo

## Shipment Statuses

```
CREATED → RECEIVED → LOADED_FOR_LINEHAUL → IN_TRANSIT → RECEIVED_AT_DEST → OUT_FOR_DELIVERY → DELIVERED
                                                                                              ↓
                                                                                           RETURNED
Any state → EXCEPTION (when issue detected)
EXCEPTION → (previous state, typically RECEIVED, when resolved)
```

### Status Definitions

| Status | Description | Typical Location |
|--------|-------------|------------------|
| `CREATED` | Shipment record created | Origin hub |
| `RECEIVED` | Package physically received | Origin hub |
| `LOADED_FOR_LINEHAUL` | Added to manifest | Origin hub |
| `IN_TRANSIT` | Manifest departed | In transit |
| `RECEIVED_AT_DEST` | Arrived at destination | Destination hub |
| `OUT_FOR_DELIVERY` | On delivery vehicle | Last mile |
| `DELIVERED` | Delivered to consignee | Consignee location |
| `RETURNED` | Returned to sender | Variable |
| `EXCEPTION` | Issue detected | Variable |

### Valid Transitions
- `CREATED` → `RECEIVED`
- `RECEIVED` → `LOADED_FOR_LINEHAUL`
- `LOADED_FOR_LINEHAUL` → `IN_TRANSIT`
- `IN_TRANSIT` → `RECEIVED_AT_DEST`
- `RECEIVED_AT_DEST` → `OUT_FOR_DELIVERY`
- `OUT_FOR_DELIVERY` → `DELIVERED` | `RETURNED`
- Any → `EXCEPTION` (when issue occurs)
- `EXCEPTION` → `RECEIVED` (when resolved)

---

## Manifest Statuses

```
OPEN → CLOSED → DEPARTED → ARRIVED
```

### Status Definitions

| Status | Description | Allowed Operations |
|--------|-------------|-------------------|
| `OPEN` | Being prepared | Add/remove shipments |
| `CLOSED` | Finalized, ready for dispatch | Mark departed only |
| `DEPARTED` | Vehicle has left origin | Mark arrived only |
| `ARRIVED` | Reached destination | None (terminal) |

### Valid Transitions
- `OPEN` → `CLOSED`
- `CLOSED` → `DEPARTED`
- `DEPARTED` → `ARRIVED`

**Note**: Cannot go backwards. A manifest cannot be re-opened after closing.

---

## Invoice Statuses

```
ISSUED → PAID
       → CANCELLED
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `ISSUED` | Created, awaiting payment |
| `PAID` | Payment received (terminal) |
| `CANCELLED` | Voided (terminal) |

### Valid Transitions
- `ISSUED` → `PAID`
- `ISSUED` → `CANCELLED`

---

## Exception Statuses

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `OPEN` | New exception reported |
| `IN_PROGRESS` | Being investigated/handled |
| `RESOLVED` | Issue fixed |
| `CLOSED` | Archived |

### Valid Transitions
- `OPEN` → `IN_PROGRESS`
- `IN_PROGRESS` → `RESOLVED`
- `RESOLVED` → `CLOSED`

---

## Rules

1. **No skipping states** without explicit override and audit log
2. **Overrides must log**: operator ID, reason, timestamp
3. **Terminal states are final**: DELIVERED, PAID, CANCELLED, CLOSED
4. **Exception handling**: Any state can transition to EXCEPTION; resolution reverts to appropriate state
