# Sentry MCP Verification Results

## MCP Server Status

✅ **MCP Configuration**: Valid (`.mcp.json` correctly formatted)  
✅ **MCP Server URL**: Accessible at `https://mcp.sentry.dev/mcp`  
⚠️ **Authentication**: Requires OAuth (expected behavior)

## Test Results

### 1. MCP Server Endpoint Check

```bash
curl -I https://mcp.sentry.dev/mcp
```

**Response**: `401 Unauthorized`

```
WWW-Authenticate: Bearer realm="OAuth", error="invalid_token", 
error_description="Missing or invalid access token"
```

**Status**: ✅ **This is correct!** The MCP server is running and requires OAuth authentication.

### 2. Configuration Validation

**File**: `.mcp.json`

```json
{
  "mcpServers": {
    "sentry": {
      "url": "https://mcp.sentry.dev/mcp",
      "description": "Sentry MCP Server - Access Sentry issues, errors, projects, and AI-powered issue fixes",
      "oauth": {
        "authorizationUrl": "https://sentry.io/oauth/authorize/",
        "tokenUrl": "https://sentry.io/oauth/token/",
        "scopes": [
          "project:read",
          "project:write",
          "event:read",
          "org:read"
        ]
      }
    }
  }
}
```

**Status**: ✅ Valid configuration

## How to Use Sentry MCP in Cursor

### Step 1: Restart Cursor

The `.mcp.json` file needs to be detected by Cursor:

1. Close Cursor completely
2. Reopen Cursor
3. Open this project

### Step 2: Verify MCP Server is Loaded

1. Open Cursor Settings (Ctrl+,)
2. Navigate to **Features** → **MCP Servers**
3. You should see "sentry" listed

### Step 3: Authenticate (First Use Only)

When you first use an `@sentry` command, Cursor will:

1. Open your browser to Sentry OAuth page
2. Ask you to authorize the MCP server
3. Grant the requested permissions
4. Store the OAuth token securely

### Step 4: Test MCP Commands

Try these commands in your Cursor chat:

```
@sentry list issues in project javascript-react
```

```
@sentry show me the latest errors
```

```
@sentry what are the top 3 issues today?
```

## Available MCP Tools

Once authenticated, you can use:

| Command | Description |
|---------|-------------|
| `@sentry list issues` | Get all issues in your project |
| `@sentry show issue <ID>` | Get detailed information about a specific issue |
| `@sentry get project info` | View project configuration and DSN |
| `@sentry suggest fix for <ID>` | AI-powered fix suggestions using Sentry Seer |
| `@sentry show organization` | View organization details |

## Troubleshooting

### MCP Server Not Showing in Cursor

**Solution**: 
- Ensure `.mcp.json` is in the project root
- Restart Cursor completely
- Check Cursor version supports MCP (requires recent version)

### Authentication Fails

**Solution**:
- Clear Cursor's OAuth cache
- Try authentication again
- Verify you have access to organization `tac-pf`

### No Data Returned

**Solution**:
- Check project name is correct: `javascript-react`
- Verify organization name: `tac-pf`
- Ensure you have the required permissions

## Your Sentry Details

- **Organization**: tac-pf
- **Project**: javascript-react
- **DSN**: Configured in `.env.local`
- **Dashboard**: https://sentry.io/organizations/tac-pf/

## Alternative: Use Sentry API Directly

If MCP doesn't work, you can query Sentry directly using the API token:

```bash
# List issues
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://sentry.io/api/0/projects/tac-pf/javascript-react/issues/

# Get issue details
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://sentry.io/api/0/issues/ISSUE_ID/
```

Your API token is in `.env.local` as `VITE_SENTRY_ORG_TOKEN`.

## Verification Checklist

- [x] MCP server URL is accessible
- [x] `.mcp.json` configuration is valid
- [x] OAuth endpoints are correct
- [x] Required scopes are defined
- [ ] Cursor has detected the MCP server (requires restart)
- [ ] OAuth authentication completed (first use)
- [ ] MCP commands return data

## Next Steps

1. **Restart Cursor** to detect the MCP configuration
2. **Try an @sentry command** to trigger OAuth flow
3. **Authenticate** when prompted
4. **Start querying** your Sentry data via AI!

---

**Verification Date**: January 19, 2026  
**Status**: ✅ MCP Server configured correctly, awaiting IDE authentication
