"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  User,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Eye,
  UserPlus
} from "lucide-react";
import { getClients, deleteClient, Client } from "@/lib/clients";
import { getUserInfo, hasAnyRole } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

function ClientesContent() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; clientId: number | null; clientName: string }>({
    isOpen: false,
    clientId: null,
    clientName: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    clientId: number | null;
    clientName: string;
    promotorId: string;
    loading: boolean;
    promotores: Array<{ id: number; name: string; email?: string }>;
  }>({
    isOpen: false,
    clientId: null,
    clientName: "",
    promotorId: "",
    loading: false,
    promotores: []
  });

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar clientes");
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aplicar filtros
    let resultado = [...clients];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.contactPerson?.toLowerCase().includes(term) ||
        client.address?.toLowerCase().includes(term)
      );
    }
    
    setFilteredClients(resultado);
  }, [searchTerm, clients]);

  const handleDelete = async () => {
    if (!deleteModal.clientId) return;
    
    try {
      await deleteClient(deleteModal.clientId);
      setClients(clients.filter(client => client.id !== deleteModal.clientId));
      setDeleteModal({ isOpen: false, clientId: null, clientName: "" });
    } catch (err: any) {
      setError(err.message || "Error al eliminar cliente");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const canEdit = () => {
    if (!userInfo) return false;
    // ADMIN y SUPERVISOR pueden editar, PROMOTOR solo puede ver sus clientes
    return hasAnyRole(['ADMIN', 'SUPERVISOR']);
  };

  const canDelete = () => {
    if (!userInfo) return false;
    // Solo ADMIN puede eliminar
    return userInfo.role === 'ADMIN';
  };

  const canAssign = () => {
    if (!userInfo) return false;
    // ADMIN y SUPERVISOR pueden asignar, PROMOTER no
    return hasAnyRole(['ADMIN', 'SUPERVISOR']);
  };

  const openAssignModal = async (clientId: number, clientName: string) => {
    try {
      setAssignModal(prev => ({
        ...prev,
        isOpen: true,
        clientId,
        clientName,
        promotorId: "",
        loading: true
      }));

      // Fetch promotores
      const promotores = await apiClient.getPromotores();
      setAssignModal(prev => ({
        ...prev,
        promotores: promotores || [],
        loading: false
      }));
    } catch (err: any) {
      alert(`Error al cargar promotores: ${err.message || "Error desconocido"}`);
      setAssignModal(prev => ({
        ...prev,
        isOpen: false,
        loading: false
      }));
    }
  };

  const closeAssignModal = () => {
    setAssignModal({
      isOpen: false,
      clientId: null,
      clientName: "",
      promotorId: "",
      loading: false,
      promotores: []
    });
  };

  const handleAssignPromotor = async () => {
    if (!assignModal.clientId || !assignModal.promotorId) {
      alert("Por favor selecciona un promotor");
      return;
    }

    try {
      setAssignModal(prev => ({ ...prev, loading: true }));

      // Call PATCH /api/clients/:id/assign
      await apiClient.patch(`/api/clients/${assignModal.clientId}/assign`, {
        promotorId: parseInt(assignModal.promotorId)
      });

      // Refresh client list
      await loadClients();
      
      // Close modal
      closeAssignModal();
      
      alert("Promotor asignado exitosamente");
    } catch (err: any) {
      alert(`Error al asignar promotor: ${err.message || "Error desconocido"}`);
      setAssignModal(prev => ({ ...prev, loading: false }));
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
                <p className="text-sm text-gray-600">
                  Gestión de clientes del sistema
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Inicio
              </Link>
              {canEdit() && (
                <Link
                  href="/clientes/crear"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nuevo Cliente
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Con Contacto</p>
                <p className="text-3xl font-bold text-green-600">
                  {clients.filter(c => c.contactPerson).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Con Email</p>
                <p className="text-3xl font-bold text-purple-600">
                  {clients.filter(c => c.email).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lista de Clientes</h2>
              <p className="text-gray-600">
                {userInfo?.role === 'ADMIN' 
                  ? 'Todos los clientes del sistema' 
                  : userInfo?.role === 'SUPERVISOR'
                  ? 'Clientes de tu equipo'
                  : 'Tus clientes asignados'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={loadClients}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={18} />
                Exportar
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Mostrando {filteredClients.length} de {clients.length} clientes
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
            </p>
            
            {userInfo && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                userInfo.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                userInfo.role === 'SUPERVISOR' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {userInfo.role === 'ADMIN' && <Eye size={14} />}
                {userInfo.role === 'SUPERVISOR' && <User size={14} />}
                {userInfo.role === 'PROMOTOR' && <Building size={14} />}
                {userInfo.role}
              </div>
            )}
          </div>
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Intenta con otros criterios de búsqueda'
                  : 'Aún no hay clientes registrados'}
              </p>
              {canEdit() && (
                <Link
                  href="/clientes/crear"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Registrar Nuevo Cliente
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {client.contactPerson && (
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                <User size={14} />
                                {client.contactPerson}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                              <Calendar size={14} />
                              Creado: {formatDate(client.createdAt)}
                            </span>
                            {!client.promotorId && (
                              <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                <AlertCircle size={12} />
                                Sin asignar
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {client.email && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="text-green-600" size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{client.email}</p>
                            </div>
                          </div>
                        )}
                        
                        {client.phone && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Phone className="text-purple-600" size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Teléfono</p>
                              <p className="font-medium text-gray-900">{client.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {client.address && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="text-yellow-600" size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dirección</p>
                              <p className="font-medium text-gray-900">{client.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {client.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{client.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button
                        onClick={() => router.push(`/clientes/editar/${client.id}`)}
                        disabled={!canEdit()}
                        className={`px-4 py-2 font-medium rounded-lg flex items-center gap-2 ${
                          canEdit()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      
                      {canAssign() && !client.promotorId && (
                        <button
                          onClick={() => openAssignModal(client.id, client.name)}
                          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg flex items-center gap-2"
                        >
                          <UserPlus size={18} />
                          Asignar
                        </button>
                      )}
                      
                      {canEdit() && (
                        <button
                          onClick={() => router.push(`/clientes/editar/${client.id}`)}
                          className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 font-medium rounded-lg flex items-center gap-2"
                        >
                          <Edit size={18} />
                          Editar
                        </button>
                      )}
                      
                      {canDelete() && (
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            clientId: client.id,
                            clientName: client.name
                          })}
                          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg flex items-center gap-2"
                        >
                          <Trash2 size={18} />
                          Eliminar
                        </button>
                      )}
                      <ChevronRight className="text-gray-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredClients.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-600">
              Página 1 de 1 • {filteredClients.length} clientes
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Anterior
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Siguiente
              </button>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Confirmar Eliminación</h2>
                <button
                  onClick={() => setDeleteModal({ isOpen: false, clientId: null, clientName: "" })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <p className="text-center text-gray-700 mb-2">
                  ¿Estás seguro de que deseas eliminar al cliente?
                </p>
                <p className="text-center font-bold text-lg text-gray-900 mb-4">
                  "{deleteModal.clientName}"
                </p>
                <p className="text-center text-sm text-gray-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, clientId: null, clientName: "" })}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Promotor Modal */}
        {assignModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Asignar Promotor</h2>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={assignModal.loading}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="text-green-600" size={32} />
                </div>
                <p className="text-center text-gray-700 mb-2">
                  Asignar promotor al cliente
                </p>
                <p className="text-center font-bold text-lg text-gray-900 mb-6">
                  "{assignModal.clientName}"
                </p>

                {assignModal.loading ? (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <RefreshCw className="text-blue-600 animate-spin" size={16} />
                    </div>
                    <p className="text-gray-600">Cargando promotores...</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Promotor
                    </label>
                    <select
                      value={assignModal.promotorId}
                      onChange={(e) => setAssignModal(prev => ({ ...prev, promotorId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      disabled={assignModal.loading}
                    >
                      <option value="">Selecciona un promotor</option>
                      {assignModal.promotores.map((promotor) => (
                        <option key={promotor.id} value={promotor.id}>
                          {promotor.name} {promotor.email ? `(${promotor.email})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {assignModal.promotores.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        No hay promotores disponibles
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeAssignModal}
                  disabled={assignModal.loading}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignPromotor}
                  disabled={assignModal.loading || !assignModal.promotorId}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignModal.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin" size={16} />
                      Asignando...
                    </span>
                  ) : (
                    "Asignar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                Sistema de Gestión de Clientes • {userInfo?.role || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500">
                {clients.length} clientes registrados
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Ayuda
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Soporte
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <RoleGuard requireAuth={true} requiredRole={['ADMIN', 'SUPERVISOR', 'PROMOTOR']}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="text-blue-600 animate-spin" size={24} />
            </div>
            <p className="text-gray-600">Cargando módulo de clientes...</p>
          </div>
        </div>
      }>
        <ClientesContent />
      </Suspense>
    </RoleGuard>
  );
}
