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
  Navigation
} from "lucide-react";
import { isAuthenticated, getUserInfo, isAdmin } from "@/lib/auth";

// Tipos de datos para visitas
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

// Datos de ejemplo para demostración con coordenadas
const visitasEjemplo: Visita[] = [
  {
    id: 1,
    fecha: '2024-03-15',
    hora: '10:30',
    cliente: 'Tienda ABC',
    ubicacion: 'Centro Comercial Plaza',
    lat: 19.4326,
    lng: -99.1332,
    promotor: 'Juan Pérez',
    promotorId: 101,
    estado: 'completada',
    notas: 'Visita de seguimiento, cliente satisfecho',
    fotos: 3
  },
  {
    id: 2,
    fecha: '2024-03-14',
    hora: '14:00',
    cliente: 'Supermercado XYZ',
    ubicacion: 'Av. Principal 123',
    lat: 19.4342,
    lng: -99.1345,
    promotor: 'María García',
    promotorId: 102,
    estado: 'completada',
    notas: 'Nuevo pedido realizado',
    fotos: 2
  },
  {
    id: 3,
    fecha: '2024-03-14',
    hora: '16:45',
    cliente: 'Farmacia Salud',
    ubicacion: 'Calle Secundaria 456',
    lat: 19.4330,
    lng: -99.1320,
    promotor: 'Carlos López',
    promotorId: 103,
    estado: 'pendiente',
    notas: 'Programada para mañana',
    fotos: 0
  },
  {
    id: 4,
    fecha: '2024-03-13',
    hora: '09:15',
    cliente: 'Restaurante Sabor',
    ubicacion: 'Zona Gastronómica',
    lat: 19.4350,
    lng: -99.1350,
    promotor: 'Ana Martínez',
    promotorId: 104,
    estado: 'completada',
    notas: 'Revisión de inventario',
    fotos: 4
  },
  {
    id: 5,
    fecha: '2024-03-12',
    hora: '11:30',
    cliente: 'Tienda Moda',
    ubicacion: 'Centro Comercial Moderno',
    lat: 19.4310,
    lng: -99.1310,
    promotor: 'Pedro Sánchez',
    promotorId: 105,
    estado: 'cancelada',
    notas: 'Cliente no se presentó',
    fotos: 0
  },
  {
    id: 6,
    fecha: '2024-03-11',
    hora: '13:00',
    cliente: 'Cafetería Aroma',
    ubicacion: 'Plaza Central',
    lat: 19.4360,
    lng: -99.1360,
    promotor: 'Laura Rodríguez',
    promotorId: 106,
    estado: 'completada',
    notas: 'Entrega de material promocional',
    fotos: 2
  },
  {
    id: 7,
    fecha: '2024-03-10',
    hora: '15:20',
    cliente: 'Papelería Escolar',
    ubicacion: 'Calle Escuela 789',
    lat: 19.4370,
    lng: -99.1370,
    promotor: 'Roberto Fernández',
    promotorId: 107,
    estado: 'completada',
    notas: 'Pedido especial de útiles',
    fotos: 3
  },
  {
    id: 8,
    fecha: '2024-03-09',
    hora: '08:45',
    cliente: 'Ferretería Construye',
    ubicacion: 'Av. Industrial 321',
    lat: 19.4380,
    lng: -99.1380,
    promotor: 'Sofía Vargas',
    promotorId: 108,
    estado: 'pendiente',
    notas: 'Seguimiento de cotización',
    fotos: 0
  }
];

function MisVisitasContent() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [filteredVisitas, setFilteredVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadVisitas = (user: { username: string; name: string; role: string } | null) => {
    setLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      let visitasFiltradas = [...visitasEjemplo];
      
      // Si no es admin, filtrar solo las visitas del usuario actual
      // Normalizar el rol a mayúsculas para comparar
      const userRole = user?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        // En una implementación real, aquí se filtraría por userId
        // Para la demo, asignamos algunas visitas al usuario actual
        const userId = 101; // ID del usuario actual (simulado)
        visitasFiltradas = visitasFiltradas.filter(v => 
          v.promotorId === userId || Math.random() > 0.5 // Demo: mezcla de visitas
        );
      }
      
      setVisitas(visitasFiltradas);
      setFilteredVisitas(visitasFiltradas);
      setLoading(false);
    }, 1000);
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={18} />
                Exportar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
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
