# TAC Cargo — MCP Server Recommendations

## Overview
Model Context Protocol (MCP) servers extend Windsurf's capabilities with specialized tools. These recommendations are based on TAC Cargo's tech stack and operational needs.

---

## Currently Configured (`.mcp.json`)

Your workspace has these MCP servers configured:
- `exa` - Web search and code context
- `fetch` - URL content fetching
- `github-mcp-server` - GitHub integration
- `local-shadcn-ui` - shadcn/ui component docs
- `mcp-playwright` - Browser automation and E2E testing ✅
- `puppeteer` - Browser automation
- `sequential-thinking` - Reasoning enhancement
- `shadcn-ui-docs` - shadcn documentation
- `supabase-mcp-server` - Supabase operations

**Sentry**: Already integrated via `@sentry/react` in the application ✅

---

## Configured MCP Servers

### 1. Supabase MCP ✅
**Purpose**: Direct database operations, type generation, migrations

**Useful for TAC Cargo**:
- Generate TypeScript types from schema
- Execute SQL queries for debugging
- Apply migrations
- Check database advisors (security/performance)

**Example Usage**:
```
Use mcp11_list_tables to see current schema
Use mcp11_execute_sql to debug queries
Use mcp11_generate_typescript_types after schema changes
Use mcp11_get_advisors for security/performance checks
```

### 2. shadcn/ui MCP ✅
**Purpose**: Component installation and documentation

**Useful for TAC Cargo**:
- Install new shadcn components
- Get component usage docs
- Reference proper patterns

**Example Usage**:
```
Use mcp4_get-component-docs for usage examples
Use mcp4_install-component to add new components
```

### 3. Playwright MCP ✅
**Purpose**: Browser-based E2E testing automation

**Useful for TAC Cargo**:
- Automate QA workflows from skills/workflows
- Take screenshots for visual verification
- Fill forms and click through flows
- Capture console messages and network requests

**Example Usage**:
```
Use mcp5_browser_navigate to open pages
Use mcp5_browser_snapshot to capture accessibility tree
Use mcp5_browser_fill_form to fill forms
Use mcp5_browser_click to interact with elements
Use mcp5_browser_take_screenshot for visual verification
```

### 4. Sentry Integration ✅
**Purpose**: Error monitoring and observability

**Already configured in application**:
- `@sentry/react` for error tracking
- Error boundaries and capture
- Performance monitoring

**Usage in code**:
```typescript
import * as Sentry from '@sentry/react';
Sentry.captureException(error);
```

### 5. PostgreSQL MCP (Optional)
**Purpose**: Direct Postgres operations

**Why Useful**:
- Bypass Supabase client for debugging
- Complex query analysis
- Schema exploration

**Note**: Supabase MCP already provides most functionality

---

## MCP Server Usage Patterns

### Database Operations (Supabase MCP)
```
# List tables
mcp11_list_tables(project_id, schemas: ["public"])

# Execute query
mcp11_execute_sql(project_id, query: "SELECT * FROM shipments LIMIT 5")

# Generate types
mcp11_generate_typescript_types(project_id)
```

### Component Development (shadcn MCP)
```
# Get button docs
mcp4_get-component-docs(component: "button")

# Install new component
mcp4_install-component(component: "data-table", runtime: "npm")
```

### Browser Automation (Playwright MCP)
```
# Navigate to page
mcp5_browser_navigate(url: "http://localhost:5173/shipments")

# Take accessibility snapshot (better than screenshot for actions)
mcp5_browser_snapshot()

# Fill a form
mcp5_browser_fill_form(fields: [
  { name: "AWB", type: "textbox", ref: "T1", value: "TAC12345678" }
])

# Click button
mcp5_browser_click(element: "Submit button", ref: "B1")

# Take screenshot for visual verification
mcp5_browser_take_screenshot(filename: "shipment-created.png")

# Get console messages (for debugging)
mcp5_browser_console_messages(level: "error")
```

### Web Research (Exa MCP)
```
# Search for API docs
mcp1_get_code_context_exa(query: "Supabase RLS policy examples")

# Research solutions
mcp1_web_search_exa(query: "React Query mutation error handling")
```

---

## Configuration File

Current `.mcp.json` location: `c:\tac-portal\.mcp.json`

### Adding New Servers
```json
{
  "mcpServers": {
    "existing-server": { ... },
    "new-server": {
      "command": "npx",
      "args": ["@provider/mcp-server-name"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

---

## Security Notes

1. **API Keys**: Store sensitive keys in environment variables, not in config files
2. **Supabase**: Use read-only keys for exploration, service role only when needed
3. **GitHub**: Limit token scopes to required permissions
4. **Sentry**: Use project-specific tokens, not org-wide

---

## Troubleshooting

### Server Not Starting
```bash
# Check if server is installed
npx @provider/mcp-server-name --version

# Check logs
# Servers log to Windsurf's output panel
```

### Connection Issues
- Verify environment variables are set
- Check firewall/proxy settings
- Restart Windsurf after config changes

### Tool Not Available
- Server may have started but tools failed to register
- Check server health with `list_resources`
- Restart server from Windsurf settings
