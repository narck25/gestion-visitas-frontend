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
  UserPlus,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart
} from "lucide-react";
import { getUserInfo, hasAnyRole } from "@/lib/auth";
import { apiFetch } from "@/lib/api";


// Definir tipo para pedidos
interface Pedido {
  id: string;
  shortId: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
  itemsCount: number;
  notas?: string;
}

function PedidosContent() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; pedidoId: string | null; clienteName: string }>({
    isOpen: false,
    pedidoId: null,
    clienteName: ""
  });
  const [error, setError] = useState<string | null>(null);

  // Función para obtener pedidos desde la API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rawOrders = await apiFetch<any>("/api/orders");
      
      // Debug: verificar estructura de respuesta
      console.log("API /api/orders response:", rawOrders);
      
      // Extraer array de pedidos de diferentes estructuras de respuesta
      let ordersArray: any[] = [];
      
      if (Array.isArray(rawOrders)) {
        ordersArray = rawOrders;
      } else if (Array.isArray(rawOrders?.orders)) {
        ordersArray = rawOrders.orders;
      } else if (Array.isArray(rawOrders?.data)) {
        ordersArray = rawOrders.data;
      } else if (Array.isArray(rawOrders?.data?.orders)) {
        ordersArray = rawOrders.data.orders;
      } else {
        console.warn("Unexpected orders response structure:", rawOrders);
      }
      
      console.log("Orders loaded:", ordersArray);
      
  // Normalizar estructura de pedidos
  const pedidosData = ordersArray.map((o: any, index: number) => ({
    id: o.id?.toString() || "",
    shortId: `#${1000 + index + 1}`,
    cliente: 
      o.client?.businessName || 
      o.client?.name || 
      o.clientName || 
      "Cliente no asignado",
    fecha: o.createdAt || o.date || "",
    total: Number(o.total || 0),
    estado: o.status?.toLowerCase() || "pendiente",
    itemsCount: o.items?.length || 0,
    notas: o.notes || ""
  }));
      
      setPedidos(pedidosData);
      setFilteredPedidos(pedidosData);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    fetchOrders();
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let resultado = [...pedidos];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(pedido =>
        pedido.cliente.toLowerCase().includes(term) ||
        pedido.id.toLowerCase().includes(term) ||
        pedido.notas?.toLowerCase().includes(term)
      );
    }
    
    setFilteredPedidos(resultado);
  }, [searchTerm, pedidos]);

  const handleDelete = async () => {
    if (!deleteModal.pedidoId) return;
    
    try {
      // En una implementación real, aquí llamaríamos a la API para eliminar
      setPedidos(pedidos.filter(pedido => pedido.id !== deleteModal.pedidoId));
      setDeleteModal({ isOpen: false, pedidoId: null, clienteName: "" });
    } catch (err: any) {
      setError(err.message || "Error al eliminar pedido");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="text-yellow-600" size={16} />;
      case 'en_proceso':
        return <RefreshCw className="text-blue-600" size={16} />;
      case 'completado':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'cancelado':
        return <XCircle className="text-red-600" size={16} />;
      default:
        return <Package className="text-gray-600" size={16} />;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const canEdit = () => {
    if (!userInfo) return false;
    return hasAnyRole(['ADMIN', 'SUPERVISOR', 'PROMOTOR']);
  };

  const canDelete = () => {
    if (!userInfo) return false;
    return userInfo.role === 'ADMIN';
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando pedidos...</p>
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
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
                <p className="text-sm text-gray-600">
                  Gestión de pedidos del sistema
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
                  href="/pedidos/nuevo"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nuevo Pedido
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pedidos</p>
                <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(Array.isArray(pedidos) ? pedidos : []).reduce((sum, pedido) => sum + Number(pedido.total || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Promedio por Pedido</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${((Array.isArray(pedidos) ? pedidos : []).reduce((sum, pedido) => sum + Number(pedido.total || 0), 0) / (pedidos.length || 1)).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completados</p>
                <p className="text-3xl font-bold text-green-600">
                  {pedidos.filter(p => p.estado === 'completado').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lista de Pedidos</h2>
              <p className="text-gray-600">
                Todos los pedidos registrados en el sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchOrders}
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
                placeholder="Buscar por cliente, ID, notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
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
                {userInfo.role === 'PROMOTOR' && <ShoppingCart size={14} />}
                {userInfo.role}
              </div>
            )}
          </div>
        </div>

        {/* Pedidos List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredPedidos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron pedidos</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Intenta con otros criterios de búsqueda'
                  : 'Aún no hay pedidos registrados'}
              </p>
              {canEdit() && (
                <Link
                  href="/pedidos/nuevo"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Crear Nuevo Pedido
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPedidos.map((pedido) => (
                <div key={pedido.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="text-purple-600" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Pedido {pedido.shortId}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                              <User size={14} />
                              {pedido.cliente}
                            </span>
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                              <Calendar size={14} />
                              {pedido.fecha}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getEstadoColor(pedido.estado)}`}>
                              {getEstadoIcon(pedido.estado)}
                              {getEstadoTexto(pedido.estado)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Items</p>
                            <p className="font-medium text-gray-900">{pedido.itemsCount} productos</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium text-gray-900">${Number(pedido.total || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="text-yellow-600" size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cliente</p>
                            <p className="font-medium text-gray-900">{pedido.cliente}</p>
                          </div>
                        </div>
                      </div>
                      
                      {pedido.notas && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{pedido.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button
                        onClick={() => router.push(`/pedidos/${pedido.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg flex items-center gap-2"
                      >
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      
                      {canEdit() && (
                        <button
                          onClick={() => router.push(`/pedidos/${pedido.id}/editar`)}
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
                            pedidoId: pedido.id,
                            clienteName: pedido.cliente
                          })}
                          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg flex items-center gap-2"
                        >
                          <Trash2 size={18} />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredPedidos.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-600">
              Página 1 de 1 • {filteredPedidos.length} pedidos
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
                  onClick={() => setDeleteModal({ isOpen: false, pedidoId: null, clienteName: "" })}
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
                  ¿Estás seguro de que deseas eliminar el pedido?
                </p>
                <p className="text-center font-bold text-lg text-gray-900 mb-4">
                  Pedido #{deleteModal.pedidoId} - {deleteModal.clienteName}
                </p>
                <p className="text-center text-sm text-gray-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, pedidoId: null, clienteName: "" })}
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
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                Sistema de Gestión de Pedidos • {userInfo?.role || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500">
                {pedidos.length} pedidos registrados
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

export default function PedidosPage() {
  return (
    <RoleGuard requireAuth={true} requiredRole={['ADMIN', 'SUPERVISOR', 'PROMOTOR']}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="text-blue-600 animate-spin" size={24} />
            </div>
            <p className="text-gray-600">Cargando módulo de pedidos...</p>
          </div>
        </div>
      }>
        <PedidosContent />
      </Suspense>
    </RoleGuard>
  );
}
