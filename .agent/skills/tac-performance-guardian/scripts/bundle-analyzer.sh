#!/bin/bash
# TAC Portal Bundle Analyzer
# Analyzes build output and identifies optimization opportunities

set -e

echo "🔍 TAC Portal Bundle Analysis"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Thresholds (in KB)
MAIN_BUNDLE_LIMIT=150
VENDOR_BUNDLE_LIMIT=200
TOTAL_LIMIT=350

# Build first
echo "📦 Building production bundle..."
npm run build > /dev/null 2>&1

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed. Run 'npm run build' to see errors.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Analyze bundle sizes
echo "📊 Bundle Size Analysis"
echo "------------------------"

TOTAL_SIZE=0

for file in dist/assets/*.js; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        SIZE_KB=$((SIZE / 1024))
        TOTAL_SIZE=$((TOTAL_SIZE + SIZE_KB))
        
        FILENAME=$(basename "$file")
        
        # Determine if it's main or vendor
        if [[ "$FILENAME" == *"vendor"* ]] || [[ "$FILENAME" == *"chunk"* ]]; then
            LIMIT=$VENDOR_BUNDLE_LIMIT
            TYPE="vendor"
        else
            LIMIT=$MAIN_BUNDLE_LIMIT
            TYPE="main"
        fi
        
        # Color based on size
        if [ $SIZE_KB -gt $LIMIT ]; then
            COLOR=$RED
            STATUS="❌ OVER LIMIT"
        elif [ $SIZE_KB -gt $((LIMIT * 80 / 100)) ]; then
            COLOR=$YELLOW
            STATUS="⚠️  APPROACHING"
        else
            COLOR=$GREEN
            STATUS="✅ OK"
        fi
        
        printf "  ${COLOR}%-40s %6d KB  %s${NC}\n" "$FILENAME" "$SIZE_KB" "$STATUS"
    fi
done

echo ""
echo "------------------------"
printf "  %-40s %6d KB\n" "TOTAL" "$TOTAL_SIZE"

if [ $TOTAL_SIZE -gt $TOTAL_LIMIT ]; then
    echo -e "${RED}❌ Total bundle exceeds ${TOTAL_LIMIT}KB limit!${NC}"
else
    echo -e "${GREEN}✅ Total bundle within ${TOTAL_LIMIT}KB limit${NC}"
fi

echo ""

# Check for large dependencies
echo "🔎 Large Dependencies Check"
echo "----------------------------"

# Common large deps to check
LARGE_DEPS=("moment" "lodash" "@mui" "antd" "rxjs")

for dep in "${LARGE_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Found potentially large dep: $dep${NC}"
    fi
done

# Check for tree-shakeable imports
echo ""
echo "🌳 Tree-Shaking Check"
echo "----------------------"

# Check for barrel imports that prevent tree-shaking
if grep -r "import \* as" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5; then
    echo -e "${YELLOW}⚠️  Found 'import * as' which may prevent tree-shaking${NC}"
else
    echo -e "${GREEN}✅ No problematic wildcard imports found${NC}"
fi

# Check for full lodash import
if grep -r "from 'lodash'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Use 'lodash-es' or individual imports for tree-shaking${NC}"
fi

echo ""
echo "📝 Recommendations"
echo "-------------------"

if [ $TOTAL_SIZE -gt $TOTAL_LIMIT ]; then
    echo "1. Enable code splitting for routes:"
    echo "   const Page = lazy(() => import('./pages/Page'));"
    echo ""
    echo "2. Lazy load heavy components:"
    echo "   const PDFViewer = lazy(() => import('./components/PDFViewer'));"
    echo ""
    echo "3. Replace large dependencies:"
    echo "   - moment → date-fns (already using!)"
    echo "   - lodash → lodash-es or native methods"
    echo ""
    echo "4. Run 'npx vite-bundle-visualizer' for detailed breakdown"
fi

echo ""
echo "=============================="
echo "🏁 Analysis Complete"
