"use client";

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car,
  Wrench,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, adminService } from '@/services/api';

type Cita = {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_provincia?: string;
  client_canton?: string;
  client_distrito?: string;
  sucursal: string;
  servicio: string;
  fecha: string;
  hora: string;
  tipo_placa?: string;
  numero_placa?: string;
  marca?: string;
  modelo?: string;
  problema?: string;
  status: string;
  created_at?: string;
  tecnico?: string;
  observaciones?: string;
  reparaciones_list?: string;
};

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [allCitas, setAllCitas] = useState<Cita[]>([]); // Todas las citas sin filtro
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tecnico: '',
    observaciones: ''
  });

  const statusOptions = ['Todas', 'Pendiente', 'En Proceso', 'Completada', 'Cancelada'];

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      // Cargar TODAS las citas (sin filtro de fecha para admin panel)
      const data = await appointmentService.getAppointments();
      const validData = Array.isArray(data) ? data : [];
      setAllCitas(validData);
      // En el admin panel web, mostrar todas las citas inicialmente
      setCitas(validData);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar las citas');
      setAllCitas([]);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTechnicians = useCallback(async () => {
    try {
      const response = await adminService.getTechnicians();
      setTecnicos(response.data || []);
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      // Si no puede cargar técnicos, usar lista vacía
      setTecnicos([]);
    }
  }, []);

  const filterCitasByDate = (allCitas: Cita[], date: string) => {
    const filtered = allCitas.filter(cita => cita.fecha === date);
    setCitas(filtered);
  };

  useEffect(() => {
    loadAppointments();
    loadTechnicians();
  }, [loadAppointments, loadTechnicians]);

  // Filtrar citas cuando cambie la fecha seleccionada
  useEffect(() => {
    if (allCitas.length > 0) {
      // Si se selecciona una fecha específica, filtrar por esa fecha
      // Si no, mostrar todas las citas
      if (selectedDate) {
        filterCitasByDate(allCitas, selectedDate);
      } else {
        setCitas(allCitas);
      }
    }
  }, [selectedDate, allCitas]);

  const filteredCitas = Array.isArray(citas) ? citas.filter(cita => {
    const matchesSearch = cita.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cita.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cita.numero_placa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todas' || cita.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return <Badge variant="warning">{status}</Badge>;
      case 'Confirmada':
        return <Badge variant="secondary">{status}</Badge>;
      case 'En Proceso':
        return <Badge variant="default">{status}</Badge>;
      case 'Completada':
        return <Badge variant="success">{status}</Badge>;
      case 'Cancelada':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completada':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelada':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'En Proceso':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const handleViewDetails = (cita: Cita) => {
    setSelectedCita(cita);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (cita: Cita) => {
    setSelectedCita(cita);
    setUpdateData({
      status: cita.status,
      tecnico: cita.tecnico || '',
      observaciones: cita.observaciones || ''
    });
    setShowUpdateModal(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedCita) return;

    try {
      setUpdating(true);
      
      await appointmentService.updateAppointmentStatus(
        selectedCita.id,
        updateData.status,
        updateData.tecnico,
        updateData.observaciones
      );
      
      // Actualizar en ambos estados
      const updateFn = (c: Cita) => 
        c.id === selectedCita.id 
          ? { ...c, ...updateData }
          : c;
          
      setAllCitas(prev => prev.map(updateFn));
      setCitas(prev => prev.map(updateFn));
      
      setShowUpdateModal(false);
      toast.success('Cita actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      toast.error('Error al actualizar la cita');
    } finally {
      setUpdating(false);
    }
  };

  const getStats = () => {
    if (!Array.isArray(allCitas)) {
      return {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        completadas: 0
      };
    }
    
    const today = new Date().toISOString().slice(0, 10);
    const todayCitas = allCitas.filter(c => c.fecha === today);
    
    return {
      total: todayCitas.length,
      pendientes: todayCitas.filter(c => c.status === 'Pendiente').length,
      enProceso: todayCitas.filter(c => c.status === 'En Proceso').length,
      completadas: todayCitas.filter(c => c.status === 'Completada').length
    };
  };

  const stats = getStats();

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="text-gray-600 mt-1">
                Administra las citas de mantenimiento y reparación
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Hoy</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold">{stats.pendientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En Proceso</p>
                    <p className="text-2xl font-bold">{stats.enProceso}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold">{stats.completadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por cliente, email o placa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Filtrar por fecha"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Dejar vacío para ver todas
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDate('');
                    setSearchTerm('');
                    setStatusFilter('Todas');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? 
                  `Citas del ${new Date(selectedDate).toLocaleDateString()}` : 
                  'Todas las Citas'
                }
              </CardTitle>
              <CardDescription>
                {filteredCitas.length} citas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-gray-600">Cargando citas...</span>
                </div>
              ) : filteredCitas.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {selectedDate ? 
                      'No hay citas para la fecha seleccionada' : 
                      'No hay citas registradas'
                    }
                  </p>
                </div>
              ) : (
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCitas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{cita.client_name}</p>
                            <p className="text-sm text-gray-500">{cita.client_phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cita.servicio}</p>
                          <p className="text-sm text-gray-500">{cita.sucursal}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Car className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{cita.numero_placa}</p>
                            <p className="text-sm text-gray-500">
                              {cita.marca} {cita.modelo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {cita.hora}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cita.tecnico || 'Sin asignar'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cita.status)}
                          {getStatusBadge(cita.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(cita)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(cita)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>

          {/* Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles de la Cita</DialogTitle>
                <DialogDescription>
                  Información completa de la cita seleccionada
                </DialogDescription>
              </DialogHeader>
              
              {selectedCita && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Información del Cliente</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.client_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.client_email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.client_phone}</span>
                        </div>
                        {selectedCita.client_provincia && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span>
                              {selectedCita.client_provincia}, {selectedCita.client_canton}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Información del Vehículo</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.marca} {selectedCita.modelo}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Placa: </span>
                          <span className="font-medium">{selectedCita.numero_placa}</span>
                        </div>
                        {selectedCita.tipo_placa && (
                          <div>
                            <span className="text-sm text-gray-500">Tipo: </span>
                            <span>{selectedCita.tipo_placa}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Detalles del Servicio</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.servicio}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.sucursal}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{new Date(selectedCita.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCita.hora}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Estado y Técnico</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedCita.status)}
                          {getStatusBadge(selectedCita.status)}
                        </div>
                        {selectedCita.tecnico && (
                          <div>
                            <span className="text-sm text-gray-500">Técnico: </span>
                            <span className="font-medium">{selectedCita.tecnico}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedCita.problema && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Problema Reportado</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedCita.problema}
                        </p>
                      </div>
                    )}
                    
                    {selectedCita.observaciones && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedCita.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  setShowDetailsModal(false);
                  if (selectedCita) handleUpdateStatus(selectedCita);
                }}>
                  Actualizar Estado
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Status Modal */}
          <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar Cita</DialogTitle>
                <DialogDescription>
                  Modifica el estado, técnico asignado y observaciones
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="tecnico">Técnico Asignado</Label>
                  <select
                    id="tecnico"
                    value={updateData.tecnico}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, tecnico: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Sin asignar</option>
                    {tecnicos.map(tecnico => (
                      <option key={tecnico.id} value={tecnico.nombre}>
                        {tecnico.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <textarea
                    id="observaciones"
                    value={updateData.observaciones}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Notas adicionales..."
                    className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUpdate} disabled={updating}>
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}