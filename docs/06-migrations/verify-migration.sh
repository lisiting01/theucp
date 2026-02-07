#!/bin/bash
# UCP Migration Verification Script
# Run this to verify the migration was successful

echo "🔍 UCP Migration Verification"
echo "==============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root (C:/CodingProject/theucp)"
    exit 1
fi

echo "✓ Running from project root"
echo ""

# 1. Check directory structure
echo "📁 Checking directory structure..."
if [ -d "apps/web/src/app/discuss" ]; then
    echo "  ✓ /discuss directory exists"
else
    echo "  ❌ /discuss directory missing"
fi

if [ -d "apps/web/src/app/decide" ]; then
    echo "  ✓ /decide directory exists"
else
    echo "  ❌ /decide directory missing"
fi

if [ -d "apps/web/src/app/constitution" ]; then
    echo "  ✓ /constitution directory exists"
else
    echo "  ❌ /constitution directory missing"
fi

# Check old directories don't exist
if [ -d "apps/web/src/app/discussions" ]; then
    echo "  ⚠️  Warning: Old /discussions directory still exists"
fi

if [ -d "apps/web/src/app/resolutions" ]; then
    echo "  ⚠️  Warning: Old /resolutions directory still exists"
fi

if [ -d "apps/web/src/app/charter" ]; then
    echo "  ⚠️  Warning: Old /charter directory still exists"
fi

echo ""

# 2. Check for old route references
echo "🔗 Checking for old route references..."
OLD_ROUTES=$(grep -r "href=\"/discussions\|href=\"/resolutions\|href=\"/charter" apps/web/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)

if [ "$OLD_ROUTES" -eq 0 ]; then
    echo "  ✓ No old route references found"
else
    echo "  ⚠️  Found $OLD_ROUTES references to old routes:"
    grep -r "href=\"/discussions\|href=\"/resolutions\|href=\"/charter" apps/web/src --include="*.tsx" --include="*.ts" 2>/dev/null
fi

echo ""

# 3. Run ESLint
echo "🔍 Running ESLint..."
pnpm --filter web lint > /tmp/lint-output.txt 2>&1
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "  ✓ ESLint passed with no errors"
else
    echo "  ❌ ESLint found issues:"
    cat /tmp/lint-output.txt
fi

echo ""

# 4. Check TypeScript
echo "📘 Running TypeScript check..."
cd apps/web && npx tsc --noEmit > /tmp/tsc-output.txt 2>&1
TSC_EXIT_CODE=$?
cd ../..

if [ $TSC_EXIT_CODE -eq 0 ]; then
    echo "  ✓ TypeScript check passed"
else
    echo "  ❌ TypeScript found errors:"
    cat /tmp/tsc-output.txt
fi

echo ""

# 5. Check key files exist
echo "📄 Checking key component files..."
FILES=(
    "apps/web/src/components/main-shell.tsx"
    "apps/web/src/components/discussion-board.tsx"
    "apps/web/src/components/resolution-center.tsx"
    "apps/web/src/components/charter-editor.tsx"
    "apps/web/src/app/page.tsx"
    "apps/web/src/app/globals.css"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file missing"
    fi
done

echo ""

# 6. Summary
echo "📊 Summary"
echo "=========="
if [ $LINT_EXIT_CODE -eq 0 ] && [ $TSC_EXIT_CODE -eq 0 ] && [ "$OLD_ROUTES" -eq 0 ]; then
    echo "✅ All checks passed! Migration successful."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Run: pnpm install (if not already done)"
    echo "   2. Run: pnpm --filter web dev"
    echo "   3. Visit: http://localhost:3000"
    echo "   4. Test all routes:"
    echo "      - http://localhost:3000/"
    echo "      - http://localhost:3000/discuss"
    echo "      - http://localhost:3000/decide"
    echo "      - http://localhost:3000/constitution"
else
    echo "⚠️  Some checks failed. Please review the output above."
fi

echo ""
echo "📚 Documentation:"
echo "   - See MIGRATION_SUMMARY.md for full details"
echo "   - See ROUTE_CHANGES.md for route mapping"
echo ""
