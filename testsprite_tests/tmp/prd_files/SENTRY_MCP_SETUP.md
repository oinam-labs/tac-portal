# Sentry MCP Server Setup Guide

## Overview

The Sentry MCP (Model Context Protocol) server allows AI tools like Cursor, Claude Desktop, and VS Code to access your Sentry data directly. This enables AI-powered debugging, issue analysis, and automated fixes.

## What is MCP?

MCP (Model Context Protocol) is an open standard that connects Large Language Models (LLMs) to external tools and data sources. Sentry's MCP server provides:

- **Issue Access** - Query and analyze Sentry issues
- **Error Context** - Get detailed error information and stack traces
- **Project Data** - Access project configurations and DSNs
- **AI-Powered Fixes** - Use Sentry's Seer AI to suggest issue fixes
- **Organization Info** - View organization and team data

## Configuration

### For Cursor IDE

1. **Create MCP Configuration**

   The `.mcp.json` file has been created in your project root with the Sentry MCP server configuration.

2. **Configure in Cursor Settings**

   - Open Cursor Settings
   - Navigate to **Features** → **MCP Servers**
   - Add the Sentry MCP server:
     ```json
     {
       "sentry": {
         "url": "https://mcp.sentry.dev/mcp"
       }
     }
     ```

3. **Authenticate**

   When you first use the Sentry MCP server, Cursor will prompt you to authenticate with Sentry via OAuth.

### For Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sentry": {
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

### For VS Code (Agent Mode)

Add to `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "sentry": {
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

## Available MCP Tools

Once configured, you can use these tools in your AI conversations:

### 1. **Get Issues**
```
@sentry list issues in project javascript-react
```

### 2. **Get Issue Details**
```
@sentry show details for issue ISSUE_ID
```

### 3. **Get Project Info**
```
@sentry show project javascript-react
```

### 4. **Get DSN**
```
@sentry get DSN for project javascript-react
```

### 5. **AI-Powered Fix Suggestions**
```
@sentry suggest fix for issue ISSUE_ID
```

### 6. **Organization Info**
```
@sentry show organization tac-pf
```

## Usage Examples

### Debugging with AI

```
Can you check the latest errors in Sentry and help me fix them?
```

The AI will:
1. Query Sentry MCP for recent issues
2. Analyze error patterns
3. Suggest code fixes
4. Optionally apply fixes to your codebase

### Issue Analysis

```
@sentry What are the top 3 issues in the last 24 hours?
```

### Automated Triage

```
@sentry Show me all unresolved issues assigned to me
```

## Authentication

### OAuth Flow

1. First MCP request triggers OAuth
2. Browser opens to Sentry authorization page
3. Grant permissions to the MCP server
4. Token is stored securely by your IDE

### Required Scopes

- `project:read` - Read project data
- `project:write` - Update project settings
- `event:read` - Read error events
- `org:read` - Read organization data

## Environment Variables

Your Sentry credentials should be configured in `.env.local`:

```env
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_TOKEN=your_personal_token_here
VITE_SENTRY_ORG_TOKEN=your_org_token_here
```

## Monitoring Your Own MCP Servers (Optional)

If you build custom MCP servers, you can monitor them with Sentry:

### JavaScript/Node.js

```javascript
import * as Sentry from "@sentry/node";
import { McpServer } from "@modelcontextprotocol/sdk";

Sentry.init({
  dsn: "YOUR_DSN",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

const server = Sentry.wrapMcpServerWithSentry(
  new McpServer({ name: "my-mcp-server", version: "1.0.0" })
);
```

### Python (FastMCP)

```python
import sentry_sdk
from sentry_sdk.integrations.mcp import MCPIntegration
from mcp.server.fastmcp import FastMCP

sentry_sdk.init(
    dsn="YOUR_DSN",
    traces_sample_rate=1.0,
    send_default_pii=True,
    integrations=[MCPIntegration()],
)

mcp = FastMCP("Example MCP Server")

@mcp.tool()
async def calculate_sum(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

mcp.run()
```

## Troubleshooting

### MCP Server Not Showing Up

1. Verify `.mcp.json` is in project root
2. Restart your IDE
3. Check IDE MCP settings

### Authentication Fails

1. Clear cached credentials
2. Re-authenticate via OAuth flow
3. Verify organization access

### No Data Returned

1. Check Sentry project exists
2. Verify API token has correct scopes
3. Ensure organization name is correct (`tac-pf`)

## Benefits

### For Development

- **Faster Debugging** - AI analyzes errors and suggests fixes
- **Context Awareness** - AI has access to full error context
- **Automated Triage** - AI can prioritize and assign issues

### For Team Collaboration

- **Shared Context** - Everyone can query Sentry via AI
- **Knowledge Transfer** - AI explains errors to junior developers
- **Documentation** - AI generates issue summaries

## Resources

- [Sentry MCP Documentation](https://docs.sentry.io/product/integrations/mcp/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Sentry API Reference](https://docs.sentry.io/api/)

## Your Project Details

- **Organization**: tac-pf
- **Project**: javascript-react
- **DSN**: Configured in `.env.local`
- **Dashboard**: https://sentry.io/organizations/tac-pf/projects/javascript-react/

---

**Setup Date**: January 19, 2026  
**Status**: ✅ Ready to use
