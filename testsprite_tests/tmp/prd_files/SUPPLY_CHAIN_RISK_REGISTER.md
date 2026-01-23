# Supply Chain Risk Register

**Version:** 1.0.0  
**Last Updated:** 2026-01-22  
**Review Cycle:** Monthly  
**Owner:** DevSecOps Team

---

## Purpose

This register tracks known supply chain risks, dependency vulnerabilities that cannot be immediately remediated, and security exceptions for the TAC Cargo platform.

---

## Active Risks

### Risk Registry

| ID | Package | Current Version | Risk | Severity | Status | Mitigation | Review Date |
|----|---------|-----------------|------|----------|--------|------------|-------------|
| SCR-001 | - | - | No active risks | - | - | - | 2026-01-22 |

---

## Resolved Risks

| ID | Package | Version Fixed | Risk | Resolution Date | Notes |
|----|---------|---------------|------|-----------------|-------|
| SCR-000 | lodash | 4.17.23 | Prototype pollution on baseUnset | 2026-01-22 | Security patch applied via Dependabot PR #32 |

---

## Risk Categories

### Category Definitions

| Category | Description | Example |
|----------|-------------|---------|
| **Vulnerability** | Known CVE or security advisory | Prototype pollution in lodash |
| **Unmaintained** | Package no longer receiving updates | Deprecated library with no fork |
| **License** | License incompatibility or change | MIT → GPL conversion |
| **Typosquatting** | Potential malicious package | lodas (missing 'h') |
| **Supply Chain Attack** | Compromised package or maintainer | Event-stream incident |

### Severity Matrix

| Severity | CVSS Score | Response SLA | Examples |
|----------|------------|--------------|----------|
| CRITICAL | 9.0 - 10.0 | 4 hours | RCE, Auth bypass |
| HIGH | 7.0 - 8.9 | 24 hours | Prototype pollution, SQL injection |
| MEDIUM | 4.0 - 6.9 | 1 week | DoS, Limited XSS |
| LOW | 0.1 - 3.9 | 2 weeks | Information disclosure |

---

## Security-Critical Dependencies

These packages require elevated review for any changes:

| Package | Purpose | Risk Level | Last Audit |
|---------|---------|------------|------------|
| `@supabase/supabase-js` | Database & Auth | CRITICAL | 2026-01-22 |
| `@supabase/auth-helpers-react` | Auth integration | CRITICAL | 2026-01-22 |
| `zod` | Input validation | HIGH | 2026-01-22 |
| `pdf-lib` | Invoice/label generation | HIGH | 2026-01-22 |
| `@sentry/react` | Error tracking | MEDIUM | 2026-01-22 |

---

## Exception Process

### Requesting an Exception

1. Create GitHub issue with label `security-exception`
2. Complete the exception template below
3. Obtain approval from security lead
4. Add entry to this register
5. Set calendar reminder for review date

### Exception Template

```markdown
## Security Exception Request

**Package:** [name@version]
**CVE/Advisory:** [reference]
**Severity:** [CRITICAL/HIGH/MEDIUM/LOW]

### Reason for Exception
[Why can't this be fixed immediately?]

### Mitigation Measures
[What controls are in place to reduce risk?]

### Business Impact
[What would breaking changes cause?]

### Proposed Review Date
[Max 90 days from request]

### Approver
[Security lead name]
```

---

## Monitoring & Alerts

### Automated Monitoring

| Tool | Purpose | Frequency |
|------|---------|-----------|
| Dependabot | Security updates | Real-time |
| npm audit | Vulnerability scan | On every CI run |
| CodeQL | Static analysis | On PR |
| Socket.dev | Supply chain monitoring | Daily (optional) |

### Alert Escalation

```
Dependabot Alert
       │
       ▼
┌──────────────────┐
│ Severity Check   │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
CRITICAL/HIGH  MEDIUM/LOW
    │              │
    ▼              ▼
┌──────────┐  ┌──────────────┐
│ Immediate│  │ Weekly Batch │
│ Response │  │ Processing   │
└──────────┘  └──────────────┘
```

---

## Audit Log

| Date | Action | Package | User | Notes |
|------|--------|---------|------|-------|
| 2026-01-22 | Register Created | - | DevSecOps | Initial setup |
| 2026-01-22 | Risk Resolved | lodash | Cascade AI | PR #32 merged |

---

## Review Schedule

| Review Type | Frequency | Next Due | Owner |
|-------------|-----------|----------|-------|
| Active Risks | Weekly | 2026-01-29 | DevSecOps |
| Full Register | Monthly | 2026-02-22 | Security Lead |
| Policy Review | Quarterly | 2026-04-22 | Security Lead |

---

## References

- [Dependency Security Policy](./DEPENDENCY_SECURITY_POLICY.md)
- [GitHub Security Advisories](https://github.com/advisories)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [Snyk Vulnerability DB](https://snyk.io/vuln/)
