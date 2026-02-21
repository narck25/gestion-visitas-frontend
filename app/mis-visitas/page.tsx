"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  Search, 
  Filter, 
  Download,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Navigation,
  FileText,
  FileDown
} from "lucide-react";
import { isAuthenticated, getUserInfo, isAdmin } from "@/lib/auth";
import { exportVisitasToCSV, exportVisitasToPDF } from "@/lib/export";
import { getVisits, Visit as ApiVisit } from "@/lib/visits";

// Tipos de datos para visitas (frontend)
interface Visita {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  ubicacion: string;
  lat?: number;
  lng?: number;
  promotor: string;
  promotorId: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
  notas?: string;
  fotos: number;
}

function MisVisitasContent() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [filteredVisitas, setFilteredVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterFecha, setFilterFecha] = useState<string>("");

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push("/auth/login?redirect=/mis-visitas");
      return;
    }

    const user = getUserInfo();
    setUserInfo(user);
    
    // Cargar visitas
    loadVisitas(user);
  }, [router]);

  const loadVisitas = async (user: { username: string; name: string; role: string } | null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener visitas reales de la API
      const apiVisits = await getVisits();
      
      // Mapear datos del backend al formato del frontend
      const visitasMapeadas: Visita[] = apiVisits.map((apiVisit: any) => {
        // Usar date o createdAt para la fecha
        const fechaISO = apiVisit.date || apiVisit.createdAt;
        const fechaObj = new Date(fechaISO);
        const fecha = fechaObj.toISOString().split('T')[0];
        const hora = fechaObj.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        // Convertir estado del backend al frontend
        let estado: 'completada' | 'pendiente' | 'cancelada';
        const status = apiVisit.status?.toUpperCase();
        
        switch (status) {
          case 'COMPLETED':
          case 'FINISHED':
          case 'DONE':
            estado = 'completada';
            break;
          case 'SCHEDULED':
          case 'PENDING':
          case 'IN_PROGRESS':
            estado = 'pendiente';
            break;
          case 'CANCELLED':
          case 'CANCELED':
            estado = 'cancelada';
            break;
          default:
            estado = 'pendiente';
        }
        
        // Crear ubicación a partir de dirección o coordenadas
        let ubicacion = 'Ubicación no disponible';
        if (apiVisit.address) {
          ubicacion = apiVisit.address;
        } else if (apiVisit.latitude && apiVisit.longitude) {
          ubicacion = `Lat: ${apiVisit.latitude.toFixed(6)}, Lng: ${apiVisit.longitude.toFixed(6)}`;
        }
        
        // Obtener información del cliente
        const clienteNombre = apiVisit.client?.name || apiVisit.clientName || 'Cliente no especificado';
        
        // Obtener información del promotor
        const promotorNombre = apiVisit.promoter?.name || 'Promotor no especificado';
        const promotorId = apiVisit.promoterId || apiVisit.promoter?.id || 0;
        
        // Contar fotos - manejar diferentes tipos de datos
        let fotosCount = 0;
        if (apiVisit.beforePhotos) {
          if (typeof apiVisit.beforePhotos === 'string') {
            fotosCount += (apiVisit.beforePhotos.split(' ').filter((p: string) => p.trim()).length || 0);
          } else if (Array.isArray(apiVisit.beforePhotos)) {
            fotosCount += apiVisit.beforePhotos.length;
          }
        }
        if (apiVisit.afterPhotos) {
          if (typeof apiVisit.afterPhotos === 'string') {
            fotosCount += (apiVisit.afterPhotos.split(' ').filter((p: string) => p.trim()).length || 0);
          } else if (Array.isArray(apiVisit.afterPhotos)) {
            fotosCount += apiVisit.afterPhotos.length;
          }
        }
        
        return {
          id: apiVisit.id || 0,
          fecha,
          hora,
          cliente: clienteNombre,
          ubicacion,
          lat: apiVisit.latitude,
          lng: apiVisit.longitude,
          promotor: promotorNombre,
          promotorId: typeof promotorId === 'string' ? parseInt(promotorId) || 0 : promotorId,
          estado,
          notas: apiVisit.notes || '',
          fotos: fotosCount
        };
      });
      
      // Filtrar visitas si no es admin
      const userRole = user?.role?.toUpperCase();
      let visitasFiltradas = [...visitasMapeadas];
      
      if (userRole !== 'ADMIN') {
        // En una implementación real, el backend debería filtrar por userId
        // Por ahora mostramos todas las visitas obtenidas
        // TODO: Implementar filtrado por userId cuando el backend lo soporte
        visitasFiltradas = visitasMapeadas;
      }
      
      setVisitas(visitasFiltradas);
      setFilteredVisitas(visitasFiltradas);
    } catch (error: any) {
      console.error('Error al cargar visitas:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al cargar las visitas. Por favor, intenta nuevamente.';
      
      if (error?.message?.includes('Usuario no encontrado')) {
        errorMessage = 'Tu usuario no está registrado en el sistema. Por favor, contacta al administrador.';
      } else if (error?.message?.includes('Token inválido')) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error?.status === 403) {
        errorMessage = 'No tienes permisos para ver las visitas.';
      } else if (error?.message?.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
      
      // En caso de error, mostrar lista vacía
      setVisitas([]);
      setFilteredVisitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aplicar filtros
    let resultado = [...visitas];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(v =>
        v.cliente.toLowerCase().includes(term) ||
        v.ubicacion.toLowerCase().includes(term) ||
        v.promotor.toLowerCase().includes(term) ||
        v.notas?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por estado
    if (filterEstado !== "todos") {
      resultado = resultado.filter(v => v.estado === filterEstado);
    }
    
    // Filtro por fecha
    if (filterFecha) {
      resultado = resultado.filter(v => v.fecha === filterFecha);
    }
    
    setFilteredVisitas(resultado);
  }, [searchTerm, filterEstado, filterFecha, visitas]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completada': return <CheckCircle size={16} />;
      case 'pendiente': return <Clock size={16} />;
      case 'cancelada': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para abrir ubicación en Google Maps
  const abrirGoogleMaps = (visita: Visita) => {
    if (visita.lat && visita.lng) {
      // Si hay coordenadas, abrir con lat,lng
      const url = `https://www.google.com/maps?q=${visita.lat},${visita.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Si no hay coordenadas, usar la dirección como fallback
      const query = encodeURIComponent(visita.ubicacion);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para normalizar y verificar si el usuario es admin
  const isUserAdmin = () => {
    const userRole = userInfo?.role?.toUpperCase();
    return userRole === 'ADMIN';
  };

  // Función para manejar exportación
  const handleExport = (format: 'csv' | 'pdf') => {
    if (filteredVisitas.length === 0) {
      alert('No hay visitas para exportar');
      return;
    }

    if (format === 'csv') {
      exportVisitasToCSV(filteredVisitas);
    } else {
      exportVisitasToPDF(filteredVisitas);
    }
  };

  // Función para ver detalles de visita
  const handleVerDetalles = (visitaId: number) => {
    router.push(`/visitas/${visitaId}`);
  };

  const estadisticas = {
    total: visitas.length,
    completadas: visitas.filter(v => v.estado === 'completada').length,
    pendientes: visitas.filter(v => v.estado === 'pendiente').length,
    canceladas: visitas.filter(v => v.estado === 'cancelada').length,
  };

  if (loading && visitas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando visitas...</p>
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
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mis Visitas</h1>
                <p className="text-sm text-gray-600">
                  {isUserAdmin() ? 'Todas las visitas del sistema' : 'Historial de tus visitas'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/nueva-visita"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                + Nueva Visita
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mensaje de error */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Error al cargar visitas</h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={() => loadVisitas(userInfo)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Visitas</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{estadisticas.completadas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Canceladas</p>
                <p className="text-3xl font-bold text-red-600">{estadisticas.canceladas}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Historial de Visitas</h2>
              <p className="text-gray-600">
                {isUserAdmin() 
                  ? 'Todas las visitas registradas en el sistema' 
                  : 'Tus visitas registradas'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadVisitas(userInfo)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download size={18} />
                  Exportar
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Exportar a CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileDown size={16} />
                    Exportar a PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="todos">Todos los estados</option>
                <option value="completada">Completadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            {/* Filtro por fecha */}
            <div>
              <input
                type="date"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Información del filtro */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Mostrando {filteredVisitas.length} de {visitas.length} visitas
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
              {filterEstado !== 'todos' && ` • Estado: ${filterEstado}`}
              {filterFecha && ` • Fecha: ${formatFecha(filterFecha)}`}
            </p>
            
            {isUserAdmin() && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Eye size={14} />
                Vista de Administrador
              </div>
            )}
          </div>
        </div>

        {/* Lista de Visitas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredVisitas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron visitas</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterEstado !== 'todos' || filterFecha
                  ? 'Intenta con otros criterios de búsqueda'
                  : 'Aún no hay visitas registradas'}
              </p>
              <Link
                href="/nueva-visita"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                + Registrar Nueva Visita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredVisitas.map((visita) => (
                <div key={visita.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getEstadoColor(visita.estado)}`}>
                          {getEstadoIcon(visita.estado)}
                          {visita.estado.charAt(0).toUpperCase() + visita.estado.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatFecha(visita.fecha)} • {visita.hora}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{visita.cliente}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {visita.ubicacion}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Promotor</p>
                            <p className="font-medium text-gray-900">{visita.promotor}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fotos</p>
                            <p className="font-medium text-gray-900">{visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {visita.notas && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{visita.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button
                        onClick={() => abrirGoogleMaps(visita)}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg flex items-center gap-2"
                      >
                        <Navigation size={18} />
                        Ver Ubicación
                      </button>
                      <button 
                        onClick={() => handleVerDetalles(visita.id)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg flex items-center gap-2"
                      >
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      <ChevronRight className="text-gray-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Paginación */}
        {filteredVisitas.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-600">
              Página 1 de 1 • {filteredVisitas.length} visitas
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
        
        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Eye size={20} />
              {isUserAdmin() ? 'Vista de Administrador' : 'Tu Historial'}
            </h3>
            <p className="text-blue-800 mb-3">
              {isUserAdmin() 
                ? 'Como administrador, puedes ver todas las visitas del sistema. Usa los filtros para encontrar información específica.'
                : 'Esta es tu historia de visitas. Solo puedes ver las visitas que has registrado tú mismo.'
              }
            </p>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Filtra por estado, fecha o cliente para encontrar visitas específicas</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Exporta el historial para reportes o análisis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Haz clic en "Ver Detalles" para más información de cada visita</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estados de Visitas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Completadas</span>
                </div>
                <span className="font-medium">{estadisticas.completadas}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pendientes</span>
                </div>
                <span className="font-medium">{estadisticas.pendientes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Canceladas</span>
                </div>
                <span className="font-medium">{estadisticas.canceladas}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Última actualización: {new Date().toLocaleDateString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                Sistema de Gestión de Visitas • Historial
              </p>
              <p className="text-sm text-gray-500">
                Usuario: {userInfo?.name || userInfo?.username} • Rol: {userInfo?.role}
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

export default function MisVisitasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando historial de visitas...</p>
        </div>
      </div>
    }>
      <MisVisitasContent />
    </Suspense>
  );
}
