#!/bin/bash

echo "🎯 Targeted Fix for Specific Build Errors"
echo "========================================"

echo "🔧 Step 1: Applying Next.js 15 compatible configuration..."
cp next.config.fixed.mjs next.config.mjs
echo "   ✅ Updated next.config.mjs for Next.js 15"

echo ""
echo "🔧 Step 2: Removing problematic files causing build errors..."

# Remove the specific file causing @/components/ui errors
if [ -f "app/fix-auth-system/page.tsx" ]; then
    echo "   Removing app/fix-auth-system/page.tsx..."
    rm app/fix-auth-system/page.tsx
    
    # Remove directory if empty
    if [ -d "app/fix-auth-system" ] && [ ! "$(ls -A app/fix-auth-system)" ]; then
        rmdir app/fix-auth-system
        echo "   Removed empty fix-auth-system directory"
    fi
fi

echo ""
echo "🔧 Step 3: Installing exact compatible versions..."

# Remove problematic packages first
echo "   Removing problematic packages..."
npm uninstall gantt-task-react 2>/dev/null || true

# Install exact versions for compatibility
echo "   Installing React 18.3.1 (exact version)..."
npm install react@18.3.1 react-dom@18.3.1 --save-exact

echo "   Installing missing packages..."
npm install @heroicons/react clsx tailwind-merge

echo ""
echo "🔧 Step 4: Creating minimal UI components..."
mkdir -p components/ui

# Create a very basic button component
cat > components/ui/button.tsx << 'EOF'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export function Button({ children, className = '', variant = 'default', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
EOF

# Create basic card component
cat > components/ui/card.tsx << 'EOF'
import React from 'react';

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
EOF

# Create basic alert component
cat > components/ui/alert.tsx << 'EOF'
import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export function Alert({ children, className = '', variant = 'default', ...props }: AlertProps) {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`p-4 rounded-md border ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={`font-medium mb-1 ${className}`} {...props}>
      {children}
    </h4>
  );
}

export function AlertDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
EOF

# Create basic input component
cat > components/ui/input.tsx << 'EOF'
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
}
EOF

# Create index file
cat > components/ui/index.ts << 'EOF'
export * from './button';
export * from './card';
export * from './alert';
export * from './input';
EOF

echo "   ✅ Created minimal UI components"

# Create lib/utils.ts if it doesn't exist
if [ ! -f "lib/utils.ts" ]; then
    mkdir -p lib
    cat > lib/utils.ts << 'EOF'
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
EOF
    echo "   ✅ Created lib/utils.ts"
fi

echo ""
echo "🔧 Step 5: Testing the build..."
if npm run build; then
    echo ""
    echo "🎉 SUCCESS! All build errors have been resolved!"
    echo ""
    echo "✅ What was fixed:"
    echo "   • Updated next.config.mjs for Next.js 15 compatibility"
    echo "   • Removed problematic fix-auth-system page"
    echo "   • Downgraded React to 18.3.1 for compatibility"
    echo "   • Installed @heroicons/react"
    echo "   • Created minimal UI components"
    echo "   • Fixed cloudflare:sockets webpack issue"
    echo ""
    echo "🚀 Your CAJ-Pro application is now ready!"
    echo ""
    echo "   Start development: npm run dev"
    echo "   Build production:  npm run build"
    echo ""
else
    echo ""
    echo "❌ Build still has issues. Checking for additional problems..."
    
    # List any remaining build errors
    echo ""
    echo "🔍 Remaining issues to check:"
    echo "   • Any other files importing @/components/ui incorrectly"
    echo "   • Missing dependencies"
    echo "   • TypeScript errors"
    echo ""
    echo "💡 Try running: npm install --legacy-peer-deps"
fi

echo ""
echo "📋 Note: If you need gantt chart functionality, consider these alternatives:"
echo "   • react-gantt-timeline"
echo "   • @dhtmlx/trial-react-gantt"
echo "   • react-calendar-timeline"
echo ""
