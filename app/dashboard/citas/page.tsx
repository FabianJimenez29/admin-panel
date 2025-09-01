"use client";

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/api';
import toast from 'react-hot-toast';

// Definimos el tipo para las citas basado en la estructura de la base de datos
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

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [filtro, setFiltro] = useState('Todas');
  
  // Estado para el modal de actualización
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Estado para el modal de detalles
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    tecnico: '',
    observaciones: ''
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Efecto para cargar citas desde el backend
  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      try {
        const { quotes } = await appointmentService.getAppointmentsByDate(selectedDate);
        setCitas(quotes || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar citas:', err);
        setError('Error al cargar las citas. Inténtalo de nuevo más tarde.');
        toast.error('No se pudieron cargar las citas');
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [selectedDate]);

  // Mapear estados de la base de datos a términos más amigables
  const mapStatus = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'confirmada':
      case 'confirmed':
        return 'Confirmada';
      case 'pendiente': 
      case 'pending':
        return 'Pendiente';
      case 'cancelada':
      case 'cancelled':
      case 'canceled':
        return 'Cancelada';
      case 'completada':
      case 'completed':
        return 'Completada';
      case 'en proceso':
      case 'in progress':
        return 'En Proceso';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pendiente';
    }
  };

  // Filtrar citas según el estado seleccionado
  const citasFiltradas = filtro === 'Todas' 
    ? citas 
    : citas.filter(cita => mapStatus(cita.status) === filtro);

  // Obtener color para el estado
  const getEstadoColor = (status: string): string => {
    const mappedStatus = mapStatus(status);
    switch(mappedStatus) {
      case 'Confirmada': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'Completada': return 'bg-blue-100 text-blue-800';
      case 'En Proceso': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Citas</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                // Recargar las citas
                const fetchCitas = async () => {
                  setLoading(true);
                  try {
                    const { quotes } = await appointmentService.getAppointmentsByDate(selectedDate);
                    setCitas(quotes || []);
                    toast.success('Citas actualizadas');
                  } catch (err) {
                    console.error('Error al recargar citas:', err);
                    toast.error('Error al recargar las citas');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchCitas();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              + Nueva Cita
            </button>
          </div>
        </div>

        {/* Filtros y selección de fecha */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {['Todas', 'Confirmada', 'Pendiente', 'Cancelada', 'Completada', 'En Proceso'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filtro === estado 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
          <div className="md:flex-1 md:max-w-xs">
            <input
              type="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tabla de citas */}
        {!loading && !error && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio y Sucursal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {citasFiltradas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cita.client_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cita.client_email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cita.client_phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(cita.marca || cita.modelo || cita.tipo_placa || cita.numero_placa) ? (
                          <div>
                            {cita.marca && cita.modelo && (
                              <div className="text-sm text-gray-900">{cita.marca} {cita.modelo}</div>
                            )}
                            {cita.tipo_placa && cita.numero_placa && (
                              <div className="text-sm text-gray-500">
                                {cita.tipo_placa}: {cita.numero_placa}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No especificado</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(cita.fecha).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{cita.hora}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cita.servicio}</div>
                        <div className="text-sm text-gray-500">{cita.sucursal}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(cita.status)}`}>
                          {mapStatus(cita.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => {
                            setSelectedCita(cita);
                            setShowDetailsModal(true);
                          }}
                        >
                          Ver detalles
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => {
                            setSelectedCita(cita);
                            setUpdateData({
                              status: cita.status || '',
                              tecnico: cita.tecnico || '',
                              observaciones: cita.observaciones || ''
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && citasFiltradas.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No hay citas con el filtro seleccionado</p>
          </div>
        )}
        
        {/* Modal de actualización */}
        {showUpdateModal && selectedCita && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowUpdateModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actualizar Cita #{selectedCita.id}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setUpdatingStatus(true);
                try {
                  await appointmentService.updateAppointmentStatus(
                    selectedCita.id, 
                    updateData.status,
                    updateData.tecnico,
                    updateData.observaciones
                  );
                  
                  // Actualizar la lista de citas
                  const { quotes } = await appointmentService.getAppointmentsByDate(selectedDate);
                  setCitas(quotes || []);
                  
                  toast.success('Cita actualizada correctamente');
                  setShowUpdateModal(false);
                } catch (err) {
                  console.error('Error al actualizar cita:', err);
                  toast.error('Error al actualizar la cita');
                } finally {
                  setUpdatingStatus(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      id="status"
                      value={updateData.status}
                      onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="en proceso">En Proceso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700">Técnico asignado</label>
                    <input
                      type="text"
                      id="tecnico"
                      value={updateData.tecnico}
                      onChange={(e) => setUpdateData({...updateData, tecnico: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder="Nombre del técnico"
                    />
                  </div>
                  <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
                    <textarea
                      id="observaciones"
                      rows={3}
                      value={updateData.observaciones}
                      onChange={(e) => setUpdateData({...updateData, observaciones: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder="Observaciones sobre la cita"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={updatingStatus}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Actualizando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal de detalles */}
        {showDetailsModal && selectedCita && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-medium text-gray-900">Detalles de la Cita #{selectedCita.id}</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sección de información del cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Información del Cliente</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Nombre completo</span>
                      <span className="text-base text-gray-900">{selectedCita.client_name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Email</span>
                      <span className="text-base text-gray-900">{selectedCita.client_email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Teléfono</span>
                      <span className="text-base text-gray-900">{selectedCita.client_phone}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Ubicación</span>
                      <span className="text-base text-gray-900">
                        {selectedCita.client_provincia && selectedCita.client_canton && selectedCita.client_distrito ? 
                          `${selectedCita.client_provincia}, ${selectedCita.client_canton}, ${selectedCita.client_distrito}` : 
                          'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Sección de información del vehículo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Información del Vehículo</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Marca y Modelo</span>
                      <span className="text-base text-gray-900">
                        {selectedCita.marca && selectedCita.modelo ? 
                          `${selectedCita.marca} ${selectedCita.modelo}` : 
                          'No especificado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Placa</span>
                      <span className="text-base text-gray-900">
                        {selectedCita.tipo_placa && selectedCita.numero_placa ?
                          `${selectedCita.tipo_placa}: ${selectedCita.numero_placa}` :
                          'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Sección de información de la cita */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Detalles de la Cita</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Sucursal</span>
                      <span className="text-base text-gray-900">{selectedCita.sucursal}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Servicio</span>
                      <span className="text-base text-gray-900">{selectedCita.servicio}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Fecha y Hora</span>
                      <span className="text-base text-gray-900">
                        {new Date(selectedCita.fecha).toLocaleDateString()} a las {selectedCita.hora}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Estado</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(selectedCita.status)}`}>
                        {mapStatus(selectedCita.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Sección de problema y notas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Problema y Notas</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Descripción del problema</span>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedCita.problema || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Técnico asignado</span>
                      <p className="text-base text-gray-900">
                        {selectedCita.tecnico || 'No asignado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Observaciones</span>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedCita.observaciones || 'Sin observaciones'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Reparaciones</span>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedCita.reparaciones_list || 'Sin reparaciones registradas'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Sección de metadatos */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Información Adicional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">ID de Cita</span>
                      <span className="text-base text-gray-900">#{selectedCita.id}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Creada el</span>
                      <span className="text-base text-gray-900">
                        {selectedCita.created_at ? new Date(selectedCita.created_at).toLocaleString() : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setUpdateData({
                      status: selectedCita.status || '',
                      tecnico: selectedCita.tecnico || '',
                      observaciones: selectedCita.observaciones || ''
                    });
                    setShowUpdateModal(true);
                  }}
                >
                  Actualizar Cita
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
