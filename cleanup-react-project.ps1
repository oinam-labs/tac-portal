<#
.SYNOPSIS
    Safely cleans React/Next/Vite project generated files & caches without touching source code.

.DESCRIPTION
    Removes build outputs, tooling caches, logs, and temp folders from the current project directory.
    Includes DryRun mode to preview what would be deleted.

.USAGE
    Preview only:
    powershell -ExecutionPolicy Bypass -File .\cleanup-react-project.ps1 -DryRun

    Clean now:
    powershell -ExecutionPolicy Bypass -File .\cleanup-react-project.ps1

    Clean including node_modules (optional):
    powershell -ExecutionPolicy Bypass -File .\cleanup-react-project.ps1 -IncludeNodeModules
#>

param(
    [switch]$DryRun,
    [switch]$IncludeNodeModules,
    [switch]$Aggressive
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

function SafeRemovePath {
    param(
        [Parameter(Mandatory=$true)][string]$Path
    )

    if (-not (Test-Path $Path)) { return }

    if ($DryRun) {
        Write-Info "Would remove: $Path"
        return
    }

    try {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
        Write-Ok "Removed: $Path"
    }
    catch {
        Write-Warn "Failed to remove: $Path"
        Write-Warn $_.Exception.Message
    }
}

function SafeRemoveFilesByPattern {
    param(
        [Parameter(Mandatory=$true)][string]$Root,
        [Parameter(Mandatory=$true)][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        Get-ChildItem -Path $Root -Recurse -Force -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -like $pattern } | 
            ForEach-Object {
                if ($DryRun) {
                    Write-Info "Would remove file: $($_.FullName)"
                } else {
                    try {
                        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop
                        Write-Ok "Removed file: $($_.FullName)"
                    } catch {
                        Write-Warn "Failed to remove file: $($_.FullName)"
                    }
                }
            }
    }
}

function EnsureSafeProjectRoot {
    param([string]$Root)
    
    $mustHave = @("package.json")
    
    foreach ($f in $mustHave) {
        if (-not (Test-Path (Join-Path $Root $f))) {
            Write-Err "Safety check failed: '$f' not found in $Root"
            Write-Err "Run this script from your React project root."
            exit 1
        }
    }
    Write-Ok "Project root verified: $Root"
}

# ----------------------
# MAIN
# ----------------------
$ProjectRoot = (Get-Location).Path
EnsureSafeProjectRoot -Root $ProjectRoot

Write-Info "Cleanup started in: $ProjectRoot"

if ($DryRun) {
    Write-Warn "DryRun enabled. Nothing will actually be deleted."
}

# Core safe cache/build folders
$foldersToRemove = @(
    ".next",
    "out",
    "dist",
    "build",
    "coverage",
    
    # Common caches
    ".turbo",
    ".vite",
    ".parcel-cache",
    ".cache",
    ".rpt2_cache",
    ".rts2_cache_cjs",
    ".rts2_cache_es",
    ".nyc_output",

    # Temp folders
    "tmp",
    ".tmp",
    ".temp",
    "temp",

    # Tool-specific
    ".storybook-cache",
    ".vercel"
)

# Safe internal caches under node_modules
$nodeModulesCaches = @(
    "node_modules\.cache",
    "node_modules\.vite",
    "node_modules\.turbo"
)

# Optional aggressive caches (still safe, but broader)
if ($Aggressive) {
    $foldersToRemove += @(
        ".eslintcache.d",
        ".tscache",
        ".swc",
        ".astro"
    )
}

# Remove folders
foreach ($f in $foldersToRemove) {
    SafeRemovePath -Path (Join-Path $ProjectRoot $f)
}

# Remove node_modules caches only (NOT node_modules itself)
foreach ($nc in $nodeModulesCaches) {
    SafeRemovePath -Path (Join-Path $ProjectRoot $nc)
}

# Log and cache files (safe)
$filePatterns = @(
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",
    "lerna-debug.log*",
    ".eslintcache",
    "*.tsbuildinfo",
    ".DS_Store",
    "Thumbs.db"
)

SafeRemoveFilesByPattern -Root $ProjectRoot -Patterns $filePatterns

# Optional: delete node_modules (only if explicitly asked)
if ($IncludeNodeModules) {
    Write-Warn "IncludeNodeModules enabled: node_modules will be removed."
    SafeRemovePath -Path (Join-Path $ProjectRoot "node_modules")
}

# Optional: clear pnpm store inside project (rare)
SafeRemovePath -Path (Join-Path $ProjectRoot ".pnpm-store")


Write-Ok "Cleanup complete."
Write-Host ""
Write-Info "Next steps:"
Write-Host " - reinstall deps: npm install / pnpm install / yarn"
Write-Host " - rebuild: npm run build"
Write-Host " - dev: npm run dev"
