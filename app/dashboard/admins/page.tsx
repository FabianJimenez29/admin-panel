"use client";

import Navbar from '@/components/Navbar';
import { useState } from 'react';

export default function Admins() {
  const [admins] = useState([
    {
      id: 1,
      nombre: 'Carlos Rodríguez',
      email: 'carlos@gymapp.com',
      rol: 'Super Admin',
      estado: 'Activo',
      ultimoAcceso: '2023-08-14 09:15',
    },
    {
      id: 2,
      nombre: 'Ana Martínez',
      email: 'ana@gymapp.com',
      rol: 'Admin',
      estado: 'Activo',
      ultimoAcceso: '2023-08-14 08:30',
    },
    {
      id: 3,
      nombre: 'Miguel López',
      email: 'miguel@gymapp.com',
      rol: 'Editor',
      estado: 'Inactivo',
      ultimoAcceso: '2023-08-10 14:45',
    },
    {
      id: 4,
      nombre: 'Laura Sánchez',
      email: 'laura@gymapp.com',
      rol: 'Editor',
      estado: 'Activo',
      ultimoAcceso: '2023-08-13 16:20',
    },
    {
      id: 5,
      nombre: 'Roberto Gómez',
      email: 'roberto@gymapp.com',
      rol: 'Admin',
      estado: 'Activo',
      ultimoAcceso: '2023-08-12 11:05',
    },
  ]);

  const [filtroRol, setFiltroRol] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Extraer roles y estados únicos para los filtros
  const roles = ['Todos', ...new Set(admins.map(admin => admin.rol))];
  const estados = ['Todos', ...new Set(admins.map(admin => admin.estado))];

  // Filtrar administradores
  const adminsFiltrados = admins.filter(admin => {
    const coincideRol = filtroRol === 'Todos' || admin.rol === filtroRol;
    const coincideEstado = filtroEstado === 'Todos' || admin.estado === filtroEstado;
    const coincideBusqueda = admin.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                           admin.email.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideEstado && coincideBusqueda;
  });

  // Obtener color según el estado
  const getColorEstado = (estado: string): string => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color según el rol
  const getColorRol = (rol: string): string => {
    switch (rol) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Admin':
        return 'bg-blue-100 text-blue-800';
      case 'Editor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Administradores</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            + Nuevo Administrador
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <select
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              {roles.map(rol => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
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
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorRol(admin.rol)}`}>
                      {admin.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorEstado(admin.estado)}`}>
                      {admin.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.ultimoAcceso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button className="text-red-600 hover:text-red-900">Eliminar</button>
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
      </div>
    </div>
  );
}
