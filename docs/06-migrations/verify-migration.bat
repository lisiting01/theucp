@echo off
REM UCP Migration Verification Script (Windows)
REM Run this to verify the migration was successful

echo ================================================
echo    UCP Migration Verification
echo ================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root
    exit /b 1
)

echo [OK] Running from project root
echo.

REM 1. Check directory structure
echo Checking directory structure...
if exist "apps\web\src\app\discuss" (
    echo   [OK] /discuss directory exists
) else (
    echo   [ERROR] /discuss directory missing
)

if exist "apps\web\src\app\decide" (
    echo   [OK] /decide directory exists
) else (
    echo   [ERROR] /decide directory missing
)

if exist "apps\web\src\app\constitution" (
    echo   [OK] /constitution directory exists
) else (
    echo   [ERROR] /constitution directory missing
)

REM Check old directories
if exist "apps\web\src\app\discussions" (
    echo   [WARNING] Old /discussions directory still exists
)

if exist "apps\web\src\app\resolutions" (
    echo   [WARNING] Old /resolutions directory still exists
)

if exist "apps\web\src\app\charter" (
    echo   [WARNING] Old /charter directory still exists
)

echo.

REM 2. Run ESLint
echo Running ESLint...
call pnpm --filter web lint > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] ESLint passed with no errors
) else (
    echo   [WARNING] ESLint found issues - run manually for details
)

echo.

REM 3. Check key files
echo Checking key component files...
for %%f in (
    "apps\web\src\components\main-shell.tsx"
    "apps\web\src\components\discussion-board.tsx"
    "apps\web\src\components\resolution-center.tsx"
    "apps\web\src\components\charter-editor.tsx"
    "apps\web\src\app\page.tsx"
    "apps\web\src\app\globals.css"
) do (
    if exist "%%~f" (
        echo   [OK] %%~f
    ) else (
        echo   [ERROR] %%~f missing
    )
)

echo.

REM Summary
echo ================================================
echo    Summary
echo ================================================
echo [OK] Migration verification complete!
echo.
echo Next steps:
echo   1. Run: pnpm install (if not already done)
echo   2. Run: pnpm --filter web dev
echo   3. Visit: http://localhost:3000
echo   4. Test all routes:
echo      - http://localhost:3000/
echo      - http://localhost:3000/discuss
echo      - http://localhost:3000/decide
echo      - http://localhost:3000/constitution
echo.
echo Documentation:
echo   - See MIGRATION_SUMMARY.md for full details
echo   - See ROUTE_CHANGES.md for route mapping
echo.

pause
