'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { productService, appointmentService, adminService, statisticsService } from '@/services/api';

// Importar los componentes de gráficos
import { ProductsPieChart } from '@/components/charts/ProductsPieChart';
import { ServicesByMonthChart } from '@/components/charts/ServicesByMonthChart';
import { AppointmentStatusChart } from '@/components/charts/AppointmentStatusChart';
import { MonthlyRevenueChart } from '@/components/charts/MonthlyRevenueChart';

interface AppointmentData {
  id: number;
  fecha: string;
  status: string;
  client_name?: string;
  client_email?: string;
  servicio?: string;
  hora?: string;
}

interface AdminData {
  id: number;
  active: boolean;
  activo?: boolean;
  nombre?: string;
  email?: string;
  created_at?: string;
}

interface ChartData {
  productsByCategory: Array<{
    name: string;
    total_products: number;
    total_stock: number;
  }>;
  servicesByMonth: Array<{
    month: string;
    monthName: string;
    [serviceName: string]: string | number;
  }>;
  appointmentStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    monthName: string;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalAdmins: 0,
    activeAdmins: 0
  });

  // Estados para los datos de gráficos
  const [chartsData, setChartsData] = useState<ChartData>({
    productsByCategory: [],
    servicesByMonth: [],
    appointmentStatus: [],
    monthlyRevenue: []
  });

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
    loadChartsData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [products, appointments, admins] = await Promise.all([
        productService.getProducts().catch(() => []),
        appointmentService.getAppointments().catch(() => []),
        adminService.getAdmins().catch(() => [])
      ]);

      // Asegurar que todos los datos sean arrays
      const validProducts = Array.isArray(products) ? products : [];
      const validAppointments = Array.isArray(appointments) ? appointments : [];
      const validAdmins = Array.isArray(admins) ? admins : [];

      // Calcular estadísticas
      const today = new Date().toISOString().slice(0, 10);
      const todayAppointments = validAppointments.filter((app: AppointmentData) => app.fecha === today);
      const activeAdmins = validAdmins.filter((admin: AdminData) => admin.active || admin.activo);

      setStats({
        totalProducts: validProducts.length,
        totalAppointments: validAppointments.length,
        todayAppointments: todayAppointments.length,
        totalAdmins: validAdmins.length,
        activeAdmins: activeAdmins.length
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartsData = async () => {
    try {
      setChartsLoading(true);
      
      // Cargar datos de gráficos en paralelo
      const [products, services, appointments, revenue] = await Promise.all([
        statisticsService.getProductsByCategory().catch(err => {
          console.error('Error cargando productos por categoría:', err);
          return [];
        }),
        statisticsService.getServicesByMonth().catch(err => {
          console.error('Error cargando servicios por mes:', err);
          return [];
        }),
        statisticsService.getAppointmentStatus().catch(err => {
          console.error('Error cargando estado de citas:', err);
          return [];
        }),
        statisticsService.getMonthlyRevenue().catch(err => {
          console.error('Error cargando ingresos mensuales:', err);
          return [];
        })
      ]);

      setChartsData({
        productsByCategory: products as ChartData['productsByCategory'],
        servicesByMonth: services as ChartData['servicesByMonth'],
        appointmentStatus: appointments as ChartData['appointmentStatus'],
        monthlyRevenue: revenue as ChartData['monthlyRevenue']
      });
    } catch (error) {
      console.error('Error al cargar datos de gráficos:', error);
    } finally {
      setChartsLoading(false);
    }
  };

  if (!mounted) return null;

  const getStatsCards = () => [
    {
      title: "Total Productos",
      value: loading ? "..." : stats.totalProducts.toString(),
      description: "Productos en catálogo",
      icon: Package,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Citas Programadas",
      value: loading ? "..." : stats.totalAppointments.toString(),
      description: `${stats.todayAppointments} para hoy`,
      icon: Calendar,
      trend: "+8%",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Administradores",
      value: loading ? "..." : stats.totalAdmins.toString(),
      description: `${stats.activeAdmins} activos`,
      icon: Users,
      trend: "+2",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Sistema",
      value: "Activo",
      description: "Estado del sistema",
      icon: TrendingUp,
      trend: "99.9%",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "product",
      message: "Nuevo producto agregado al inventario",
      time: "Hace 2 horas",
      status: "success"
    },
    {
      id: 2,
      type: "appointment",
      message: "Cita confirmada para mañana 10:00 AM",
      time: "Hace 3 horas",
      status: "info"
    },
    {
      id: 3,
      type: "user",
      message: "Nuevo administrador registrado",
      time: "Hace 5 horas",
      status: "success"
    },
    {
      id: 4,
      type: "alert",
      message: "Actualización de estadísticas completada",
      time: "Hace 6 horas",
      status: "warning"
    },
  ];

  const quickActions = [
    {
      title: "Agregar Producto",
      description: "Crear nuevo producto en el catálogo",
      href: "/dashboard/productos",
      icon: Package,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Nueva Cita",
      description: "Programar nueva cita de servicio",
      href: "/dashboard/citas",
      icon: Calendar,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar usuarios del sistema",
      href: "/dashboard/admins",
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600"
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido de vuelta, {user?.email}
              </p>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              Sistema Activo
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStatsCards().map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Estadísticas y Gráficos
              </h2>
            </div>

            {/* First row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductsPieChart 
                data={chartsData.productsByCategory} 
                loading={chartsLoading}
              />
              <AppointmentStatusChart 
                data={chartsData.appointmentStatus} 
                loading={chartsLoading}
              />
            </div>

            {/* Second row of charts */}
            <div className="grid grid-cols-1 gap-6">
              <ServicesByMonthChart 
                data={chartsData.servicesByMonth} 
                loading={chartsLoading}
              />
            </div>

            {/* Third row of charts */}
            <div className="grid grid-cols-1 gap-6">
              <MonthlyRevenueChart 
                data={chartsData.monthlyRevenue} 
                loading={chartsLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Accesos directos a funciones principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                      >
                        <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas actividades del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        {activity.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {activity.status === 'warning' && (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        {activity.status === 'info' && (
                          <Activity className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Información general del sistema y rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <p className="text-sm text-gray-600 mt-1">Uptime del Sistema</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">1.2s</p>
                  <p className="text-sm text-gray-600 mt-1">Tiempo de Respuesta</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">156MB</p>
                  <p className="text-sm text-gray-600 mt-1">Uso de Memoria</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}