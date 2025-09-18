"use client";

import { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
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
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Settings,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

type Admin = {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  activo: boolean;
  created_at?: string;
  ultimo_acceso?: string;
  rol?: string;
};

// Sample data
const sampleAdmins: Admin[] = [
  {
    id: 1,
    nombre: 'Super Admin',
    email: 'admin@gymapp.com',
    telefono: '88888888',
    provincia: 'San José',
    canton: 'Central',
    distrito: 'Carmen',
    activo: true,
    created_at: '2024-01-01',
    ultimo_acceso: '2024-01-15',
    rol: 'Super Admin'
  },
  {
    id: 2,
    nombre: 'Carlos Administrador',
    email: 'carlos@gymapp.com',
    telefono: '77777777',
    activo: true,
    created_at: '2024-01-05',
    ultimo_acceso: '2024-01-14',
    rol: 'Admin'
  },
  {
    id: 3,
    nombre: 'María Supervisora',
    email: 'maria@gymapp.com',
    telefono: '66666666',
    activo: false,
    created_at: '2024-01-10',
    ultimo_acceso: '2024-01-12',
    rol: 'Moderador'
  }
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>(sampleAdmins);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    provincia: '',
    canton: '',
    distrito: '',
    rol: 'Admin'
  });

  const statusOptions = ['Todos', 'Activo', 'Inactivo'];
  const roleOptions = ['Todos', 'Super Admin', 'Admin', 'Moderador'];
  const roles = ['Super Admin', 'Admin', 'Moderador'];
  const provincias = ['San José', 'Cartago', 'Alajuela', 'Heredia', 'Puntarenas', 'Guanacaste', 'Limón'];

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || 
                         (statusFilter === 'Activo' && admin.activo) ||
                         (statusFilter === 'Inactivo' && !admin.activo);
    const matchesRole = roleFilter === 'Todos' || admin.rol === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      provincia: '',
      canton: '',
      distrito: '',
      rol: 'Admin'
    });
    setShowCreateModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      email: admin.email,
      password: '',
      telefono: admin.telefono || '',
      provincia: admin.provincia || '',
      canton: admin.canton || '',
      distrito: admin.distrito || '',
      rol: admin.rol || 'Admin'
    });
    setShowCreateModal(true);
  };

  const handleSaveAdmin = async () => {
    if (!formData.nombre || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    if (!editingAdmin && !formData.password) {
      toast.error('La contraseña es requerida para nuevos administradores');
      return;
    }

    try {
      // Mock save - replace with real API call
      const newAdmin: Admin = {
        id: editingAdmin?.id || Date.now(),
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        provincia: formData.provincia,
        canton: formData.canton,
        distrito: formData.distrito,
        activo: true,
        created_at: editingAdmin?.created_at || new Date().toISOString().slice(0, 10),
        rol: formData.rol
      };

      if (editingAdmin) {
        setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? newAdmin : a));
        toast.success('Administrador actualizado exitosamente');
      } else {
        setAdmins(prev => [...prev, newAdmin]);
        toast.success('Administrador creado exitosamente');
      }

      setShowCreateModal(false);
    } catch (error) {
      toast.error('Error al guardar el administrador');
    }
  };

  const handleToggleStatus = async (adminId: number) => {
    try {
      setAdmins(prev => prev.map(a => 
        a.id === adminId ? { ...a, activo: !a.activo } : a
      ));
      toast.success('Estado del administrador actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este administrador?')) {
      return;
    }

    try {
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      toast.success('Administrador eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el administrador');
    }
  };

  const handleViewDetails = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (activo: boolean) => {
    return activo ? 
      <Badge variant="success">Activo</Badge> : 
      <Badge variant="destructive">Inactivo</Badge>;
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'Super Admin':
        return <Badge variant="default" className="bg-purple-600"><Crown className="w-3 h-3 mr-1" />{rol}</Badge>;
      case 'Admin':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />{rol}</Badge>;
      case 'Moderador':
        return <Badge variant="outline"><UserCheck className="w-3 h-3 mr-1" />{rol}</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
    }
  };

  const getStats = () => {
    return {
      total: admins.length,
      activos: admins.filter(a => a.activo).length,
      inactivos: admins.filter(a => !a.activo).length,
      superAdmins: admins.filter(a => a.rol === 'Super Admin').length
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Administradores</h1>
              <p className="text-gray-600 mt-1">
                Administra los usuarios con acceso al panel de control
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleCreateAdmin}>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Admin
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold">{stats.activos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserX className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Inactivos</p>
                    <p className="text-2xl font-bold">{stats.inactivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Super Admins</p>
                    <p className="text-2xl font-bold">{stats.superAdmins}</p>
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
                      placeholder="Buscar administradores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-40">
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
                <div className="sm:w-40">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admins Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Administradores</CardTitle>
              <CardDescription>
                {filteredAdmins.length} administradores encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{admin.nombre}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="truncate max-w-32">{admin.email}</span>
                          </div>
                          {admin.telefono && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400 mr-1" />
                              <span>{admin.telefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {admin.provincia ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                            <span>{admin.provincia}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No especificada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(admin.rol || 'Admin')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(admin.activo)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {admin.ultimo_acceso ? 
                          new Date(admin.ultimo_acceso).toLocaleDateString() : 
                          'Nunca'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(admin)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(admin.id)}
                            className={admin.activo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                          >
                            {admin.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Create/Edit Admin Modal */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAdmin ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
                </DialogTitle>
                <DialogDescription>
                  {editingAdmin ? 'Modifica la información del administrador' : 'Completa la información del nuevo administrador'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@gymapp.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">
                      {editingAdmin ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingAdmin ? "Dejar vacío para mantener actual" : "Contraseña segura"}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="88888888"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <select
                      id="rol"
                      value={formData.rol}
                      onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {roles.map(rol => (
                        <option key={rol} value={rol}>
                          {rol}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="provincia">Provincia</Label>
                    <select
                      id="provincia"
                      value={formData.provincia}
                      onChange={(e) => setFormData(prev => ({ ...prev, provincia: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar provincia</option>
                      {provincias.map(provincia => (
                        <option key={provincia} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="canton">Cantón</Label>
                    <Input
                      id="canton"
                      value={formData.canton}
                      onChange={(e) => setFormData(prev => ({ ...prev, canton: e.target.value }))}
                      placeholder="Ej: Central"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="distrito">Distrito</Label>
                    <Input
                      id="distrito"
                      value={formData.distrito}
                      onChange={(e) => setFormData(prev => ({ ...prev, distrito: e.target.value }))}
                      placeholder="Ej: Carmen"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveAdmin} disabled={loading}>
                  {loading ? 'Guardando...' : editingAdmin ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Detalles del Administrador</DialogTitle>
                <DialogDescription>
                  Información completa del administrador
                </DialogDescription>
              </DialogHeader>
              
              {selectedAdmin && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{selectedAdmin.nombre}</h3>
                    <div className="flex justify-center gap-2 mt-2">
                      {getRoleBadge(selectedAdmin.rol || 'Admin')}
                      {getStatusBadge(selectedAdmin.activo)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-sm">{selectedAdmin.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Teléfono</p>
                        <p className="text-sm">{selectedAdmin.telefono || 'No especificado'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ubicación</p>
                      <p className="text-sm">
                        {selectedAdmin.provincia ? 
                          `${selectedAdmin.provincia}, ${selectedAdmin.canton || ''} ${selectedAdmin.distrito || ''}`.trim() : 
                          'No especificada'
                        }
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
                        <p className="text-sm">
                          {selectedAdmin.created_at ? 
                            new Date(selectedAdmin.created_at).toLocaleDateString() : 
                            'No disponible'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Último Acceso</p>
                        <p className="text-sm">
                          {selectedAdmin.ultimo_acceso ? 
                            new Date(selectedAdmin.ultimo_acceso).toLocaleDateString() : 
                            'Nunca'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  setShowDetailsModal(false);
                  if (selectedAdmin) handleEditAdmin(selectedAdmin);
                }}>
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}