# TAC Cargo — Logistics Semantic Status Tokens
**Generated:** 2026-01-20

This file defines the CSS semantic status token layer used for shipment/manifest/invoice badges, alerts, and dashboards.

Why: to eliminate inconsistent hardcoded colors, and ensure perfect light/dark behavior.

---

## Token Families
- Created
- Manifested
- In Transit
- Arrived
- Delivered
- Exception
- Cancelled
- Returned

Each family includes:
- `--status-*-background`
- `--status-*-foreground`
- `--status-*-border`
- `--status-*-solid`
- `--status-*-solid-foreground`

---

## Implementation Rule
Place status tokens inside:
- `:root Ellipsis`
- `.dark Ellipsis`
