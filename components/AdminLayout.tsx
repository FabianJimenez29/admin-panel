"use client";

import ModernNavbar from '@/components/ModernNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="px-4 py-2 sm:px-6 lg:px-8 lg:py-4">
          {children}
        </div>
      </main>
    </div>
  );
}