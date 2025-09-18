"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';

export default function ModernNavbar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Panel principal'
    },
    { 
      name: 'Productos', 
      href: '/dashboard/productos', 
      icon: Package,
      description: 'Gestión de productos'
    },
    { 
      name: 'Citas', 
      href: '/dashboard/citas', 
      icon: Calendar,
      description: 'Gestión de citas'
    },
    { 
      name: 'Administradores', 
      href: '/dashboard/admins', 
      icon: Users,
      description: 'Gestión de usuarios'
    },
  ];

  const isActive = (path: string): boolean => pathname === path;

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Admin Panel
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group
                    ${isActive(item.href)
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`
                    w-5 h-5 mr-3 transition-colors
                    ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className={`
                      text-xs mt-0.5
                      ${isActive(item.href) ? 'text-blue-100' : 'text-gray-500'}
                    `}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.email}
                        </p>
                        <Badge variant="success" className="mt-1 text-xs">
                          Super Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="lg:pl-64">
        {/* Content will be rendered here by the page components */}
      </div>
    </>
  );
}