@echo off
echo 🔧 Starting comprehensive fix for Caj-pro authentication and UI issues...

REM Step 1: Clean node modules and lock files
echo 📦 Cleaning dependencies...
if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del pnpm-lock.yaml
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

REM Step 2: Clear Next.js cache
echo 🗑️ Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist .swc rmdir /s /q .swc

REM Step 3: Clear any potential browser storage
echo 🧹 Clearing potential cache files...
if exist .eslintcache del .eslintcache
if exist .tsbuildinfo del .tsbuildinfo

REM Step 4: Reinstall dependencies
echo 📥 Reinstalling dependencies...
npm install

REM Step 5: Update critical UI dependencies
echo 🎨 Updating UI dependencies...
npm install @radix-ui/react-switch@latest
npm install @radix-ui/react-tabs@latest
npm install lucide-react@latest
npm install class-variance-authority@latest
npm install tailwind-merge@latest

REM Step 6: Verify TypeScript setup
echo 📝 Checking TypeScript...
npx tsc --noEmit --skipLibCheck

REM Step 7: Build the application to check for errors
echo 🏗️ Testing build...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful! Starting development server...
    npm run dev
) else (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

echo 🎉 Fix complete! The application should now work properly.
echo 🔍 Check the browser console for any remaining issues.
pause
