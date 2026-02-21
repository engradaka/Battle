// app/layout.tsx
"use client"
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { LanguageProvider } from "@/lib/language-context";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {/* <Sidebar /> */}
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}

// Create a separate client component wrapper
function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // MAINTENANCE MODE - Block all routes except home page
  const isMaintenanceMode = false; // Set to false to disable maintenance
  
  if (isMaintenanceMode && pathname !== '/') {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">System Under Maintenance</h1>
            <div className="text-gray-600 space-y-3 mb-6">
              <p>🔧 We're currently performing system updates</p>
              <p>⚡ Enhancing performance</p>
              <p>🚀 Adding new features</p>
            </div>
            <div className="text-blue-600 font-medium mb-2">Expected completion: Soon</div>
            <div className="text-gray-500">Thank you for your patience</div>
          </div>
        </div>
      </LanguageProvider>
    );
  }
  
  return (
    <LanguageProvider>
      <Sidebar />
      {children}
      <Toaster />
    </LanguageProvider>
  )
}