import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { initializeDatabase } from '@/lib/database-init';

// Configure Inter font with variable for CSS
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CAJPRO - Vehicle Project Management',
  description: 'Track and manage your vehicle projects with CAJPRO',
  generator: 'v0.dev',
};

// Initialize database on server startup
if (typeof window === 'undefined') {
  // Only run on server side
  initializeDatabase()
    .then((result) => {
      if (result.success) {
        console.log('✅ Database initialization completed successfully');
      } else {
        console.error('❌ Database initialization failed:', result.error);
      }
    })
    .catch((error) => {
      console.error('❌ Database initialization error:', error);
    });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}