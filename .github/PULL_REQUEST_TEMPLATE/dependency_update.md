## Dependency Update Review

### Update Details

| Field | Value |
|-------|-------|
| **Package** | <!-- e.g., lodash --> |
| **Previous Version** | <!-- e.g., 4.17.21 --> |
| **New Version** | <!-- e.g., 4.17.23 --> |
| **Update Type** | <!-- patch / minor / major --> |
| **Dependency Type** | <!-- direct / transitive / dev --> |

---

### Security Assessment

#### Vulnerability Details (if security update)

| Field | Value |
|-------|-------|
| **CVE/Advisory** | <!-- e.g., CVE-2024-XXXXX or GHSA-xxxx --> |
| **Severity** | <!-- CRITICAL / HIGH / MEDIUM / LOW --> |
| **Attack Vector** | <!-- e.g., Prototype Pollution, RCE, XSS --> |
| **Exploitability** | <!-- e.g., Requires user input / Always exploitable --> |

#### Risk Classification

- [ ] **CRITICAL** - Remote code execution, auth bypass, data exfiltration
- [ ] **HIGH** - Prototype pollution, injection, sensitive data exposure
- [ ] **MEDIUM** - DoS, limited information disclosure
- [ ] **LOW** - Theoretical vulnerability, unlikely exploit conditions

#### Application Impact Assessment

Does the application use the vulnerable code path?
- [ ] Yes - Vulnerable code is directly used
- [ ] No - Vulnerable code is not in our execution path
- [ ] Unknown - Requires further investigation

---

### Verification Checklist

#### Automated Checks

- [ ] `npm install` - Dependencies installed successfully
- [ ] `npm run typecheck` - TypeScript compilation passes
- [ ] `npm run lint` - Linting passes (0 errors)
- [ ] `npm run test:unit` - Unit tests pass
- [ ] `npm run test` - E2E tests pass
- [ ] `npm audit` - No new vulnerabilities introduced

#### Manual Checks (for minor/major updates)

- [ ] Changelog reviewed for breaking changes
- [ ] Migration guide followed (if applicable)
- [ ] Affected modules manually tested
- [ ] No runtime behavior changes observed

---

### Decision

#### Auto-Merge Eligible?

- [ ] **YES** - All criteria met:
  - Security patch OR semver patch
  - Only package.json/package-lock.json changed
  - All automated checks pass
  - Not a security-critical package

- [ ] **NO** - Manual review required because:
  - [ ] Semver minor/major update
  - [ ] Security-critical package (Supabase, auth, crypto)
  - [ ] Breaking changes documented
  - [ ] Automated checks failed
  - [ ] Runtime behavior changes detected

---

### Reviewer Notes

<!-- Add any additional context, testing notes, or concerns here -->

---

### Follow-up Actions

- [ ] Update Supply Chain Risk Register (if applicable)
- [ ] Update documentation (if API changes)
- [ ] Notify team of breaking changes (if any)
- [ ] Schedule follow-up review (for exceptions)

---

**Policy Reference:** [Dependency Security Policy](../docs/DEPENDENCY_SECURITY_POLICY.md)
