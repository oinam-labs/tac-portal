# TAC Theme Audit Script - Vite + Tailwind v4
# PowerShell version for Windows

Write-Host "======================================"
Write-Host "TAC THEME AUDIT - Vite + Tailwind v4"
Write-Host "======================================"
Write-Host ""

# 0) Environment
Write-Host "[0] Environment" -ForegroundColor Yellow
node -v
npm -v
Write-Host ""

# 1) Tailwind v4 import check
Write-Host "[1] Checking Tailwind v4 import..." -ForegroundColor Yellow
$twImport = Select-String -Path ".\globals.css" -Pattern '@import "tailwindcss";' -ErrorAction SilentlyContinue
if ($twImport) {
    Write-Host "[OK] Found @import tailwindcss;" -ForegroundColor Green
}
else {
    Write-Host "[FAIL] Missing @import tailwindcss;" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2) :root and .dark scan
Write-Host "[2] Scanning for :root and .dark..." -ForegroundColor Yellow
$roots = Select-String -Path ".\globals.css" -Pattern ":root" -AllMatches -ErrorAction SilentlyContinue
$darks = Select-String -Path ".\globals.css" -Pattern "\.dark" -AllMatches -ErrorAction SilentlyContinue
Write-Host "Found :root occurrences: $($roots.Count)"
Write-Host "Found .dark occurrences:  $($darks.Count)"
Write-Host ""

# 3) Duplicate token definitions
Write-Host "[3] Checking duplicate token definitions..." -ForegroundColor Yellow
$bgDefs = Select-String -Path ".\globals.css" -Pattern "--background:" -AllMatches -ErrorAction SilentlyContinue
$primaryDefs = Select-String -Path ".\globals.css" -Pattern "--primary:" -AllMatches -ErrorAction SilentlyContinue
Write-Host "--background definitions: $($bgDefs.Count)"
Write-Host "--primary definitions:    $($primaryDefs.Count)"
if ($bgDefs.Count -gt 2 -or $primaryDefs.Count -gt 2) {
    Write-Host "[WARN] Multiple globals/themes likely overriding each other." -ForegroundColor Magenta
}
Write-Host ""

# 4) Hardcoded slate/gray bypass scan
Write-Host "[4] Scanning for hardcoded slate/gray Tailwind classes..." -ForegroundColor Yellow
$pattern = "(text|bg|border|ring)-(slate|gray)-"
$tsxFiles = Get-ChildItem -Path ".\components", ".\pages" -Recurse -Include "*.tsx", "*.ts" -ErrorAction SilentlyContinue
$matches = $tsxFiles | Select-String -Pattern $pattern -AllMatches -ErrorAction SilentlyContinue
if ($matches) {
    Write-Host "[FAIL] Found hardcoded slate/gray classes (bypasses tokens):" -ForegroundColor Red
    $matches | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber)  $($_.Line.Trim())" }
    exit 2
}
else {
    Write-Host "[OK] No hardcoded slate/gray classes found." -ForegroundColor Green
}
Write-Host ""

# 5) Vite cache check
Write-Host "[5] Vite cache directory check..." -ForegroundColor Yellow
if (Test-Path ".\node_modules\.vite") {
    Write-Host "Found node_modules/.vite" -ForegroundColor Yellow
}
else {
    Write-Host "node_modules/.vite not found (ok)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "======================================"
Write-Host "[OK] THEME AUDIT COMPLETED"
Write-Host "======================================"
