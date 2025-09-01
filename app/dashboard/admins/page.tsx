"use client";

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { Admin } from '@/types';

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    provincia: '',
    canton: '',
    distrito: ''
  });

  // Cargar administradores al montar el componente
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins();
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (error) {
      console.error('Error cargando administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extraer estados únicos para los filtros
  const estados = ['Todos', 'Activo', 'Inactivo'];

  // Filtrar administradores
  const adminsFiltrados = admins.filter(admin => {
    const coincideEstado = filtroEstado === 'Todos' || 
      (filtroEstado === 'Activo' && admin.activo) || 
      (filtroEstado === 'Inactivo' && !admin.activo);
    const coincideBusqueda = admin.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                           admin.email.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  // Obtener color según el estado
  const getColorEstado = (activo: boolean): string => {
    return activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      provincia: '',
      canton: '',
      distrito: ''
    });
    setEditingAdmin(null);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    clearForm();
    setShowModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      email: admin.email,
      password: '', // No mostrar contraseña actual
      telefono: admin.telefono || '',
      provincia: admin.provincia || '',
      canton: admin.canton || '',
      distrito: admin.distrito || ''
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    clearForm();
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        // Actualizar administrador
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          provincia: formData.provincia,
          canton: formData.canton,
          distrito: formData.distrito
        };
        
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await adminService.updateAdmin(editingAdmin.id, updateData);
        alert('Administrador actualizado exitosamente');
      } else {
        // Crear nuevo administrador
        if (!formData.password.trim()) {
          alert('La contraseña es requerida para crear un nuevo administrador');
          return;
        }
        
        await adminService.createAdmin(formData);
        alert('Administrador creado exitosamente');
      }
      
      closeModal();
      loadAdmins(); // Recargar la lista
    } catch (error: any) {
      console.error('Error guardando administrador:', error);
      alert(error.response?.data?.error || 'Error guardando administrador');
    }
  };

  // Eliminar administrador
  const handleDelete = async (admin: Admin) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al administrador ${admin.nombre}?`)) {
      try {
        await adminService.deleteAdmin(admin.id);
        alert('Administrador eliminado exitosamente');
        loadAdmins(); // Recargar la lista
      } catch (error: any) {
        console.error('Error eliminando administrador:', error);
        alert(error.response?.data?.error || 'Error eliminando administrador');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Cargando administradores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Administradores</h1>
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            + Nuevo Administrador
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <select
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de administradores */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre / Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminsFiltrados.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500">{admin.nombre.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.nombre}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.telefono || 'No especificado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{admin.provincia || ''}</div>
                      <div className="text-xs text-gray-400">
                        {admin.canton && admin.distrito && `${admin.canton}, ${admin.distrito}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorEstado(admin.activo)}`}>
                      {admin.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.fechaCreacion ? new Date(admin.fechaCreacion).toLocaleDateString() : 'No disponible'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(admin)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(admin)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {adminsFiltrados.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No se encontraron administradores</p>
            </div>
          )}
        </div>

        {/* Modal para crear/editar administrador */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contraseña {editingAdmin && '(dejar vacío para mantener actual)'}
                    </label>
                    <input
                      type="password"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provincia</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.provincia}
                      onChange={(e) => setFormData({...formData, provincia: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cantón</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.canton}
                      onChange={(e) => setFormData({...formData, canton: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distrito</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      value={formData.distrito}
                      onChange={(e) => setFormData({...formData, distrito: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                      {editingAdmin ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
