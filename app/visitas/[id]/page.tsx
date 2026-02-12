"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  FileText,
  Navigation,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  Share2,
  Printer
} from "lucide-react";
import { isAuthenticated, getUserInfo } from "@/lib/auth";

// Tipos de datos para visita detallada
interface VisitaDetallada {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  clienteId: number;
  ubicacion: string;
  lat?: number;
  lng?: number;
  promotor: string;
  promotorId: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
  notas?: string;
  fotos: number;
  fotosUrls?: string[];
  productos?: string[];
  observaciones?: string;
  duracion?: string;
  temperatura?: string;
  clima?: string;
  createdAt: string;
  updatedAt: string;
}

// Datos de ejemplo para demostración
const visitasDetalladas: VisitaDetallada[] = [
  {
    id: 1,
    fecha: '2024-03-15',
    hora: '10:30',
    cliente: 'Tienda ABC',
    clienteId: 101,
    ubicacion: 'Centro Comercial Plaza, Av. Principal 123, Col. Centro',
    lat: 19.4326,
    lng: -99.1332,
    promotor: 'Juan Pérez',
    promotorId: 101,
    estado: 'completada',
    notas: 'Visita de seguimiento, cliente satisfecho con los productos. Se realizó demostración del nuevo catálogo.',
    fotos: 3,
    fotosUrls: [
      '/placeholder-foto1.jpg',
      '/placeholder-foto2.jpg',
      '/placeholder-foto3.jpg'
    ],
    productos: ['Producto A', 'Producto B', 'Producto C'],
    observaciones: 'Cliente mostró interés en ampliar su pedido para el próximo mes.',
    duracion: '45 minutos',
    temperatura: '22°C',
    clima: 'Soleado',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T11:15:00Z'
  },
  {
    id: 2,
    fecha: '2024-03-14',
    hora: '14:00',
    cliente: 'Supermercado XYZ',
    clienteId: 102,
    ubicacion: 'Av. Principal 123, Col. Norte',
    lat: 19.4342,
    lng: -99.1345,
    promotor: 'María García',
    promotorId: 102,
    estado: 'completada',
    notas: 'Nuevo pedido realizado. Cliente solicitó entrega para el viernes.',
    fotos: 2,
    fotosUrls: [
      '/placeholder-foto4.jpg',
      '/placeholder-foto5.jpg'
    ],
    productos: ['Producto D', 'Producto E'],
    observaciones: 'Se coordinó entrega con el almacén.',
    duracion: '30 minutos',
    temperatura: '24°C',
    clima: 'Parcialmente nublado',
    createdAt: '2024-03-14T14:00:00Z',
    updatedAt: '2024-03-14T14:30:00Z'
  },
  {
    id: 3,
    fecha: '2024-03-14',
    hora: '16:45',
    cliente: 'Farmacia Salud',
    clienteId: 103,
    ubicacion: 'Calle Secundaria 456, Col. Sur',
    lat: 19.4330,
    lng: -99.1320,
    promotor: 'Carlos López',
    promotorId: 103,
    estado: 'pendiente',
    notas: 'Programada para mañana. Cliente no estaba disponible hoy.',
    fotos: 0,
    productos: [],
    observaciones: 'Reagendar para mañana a la misma hora.',
    duracion: '15 minutos',
    temperatura: '23°C',
    clima: 'Lluvioso',
    createdAt: '2024-03-14T16:45:00Z',
    updatedAt: '2024-03-14T17:00:00Z'
  }
];

function VisitaDetalleContent() {
  const router = useRouter();
  const params = useParams();
  const visitaId = params.id ? parseInt(params.id as string) : null;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [visita, setVisita] = useState<VisitaDetallada | null>(null);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push("/auth/login?redirect=/visitas/" + visitaId);
      return;
    }

    const user = getUserInfo();
    setUserInfo(user);
    
    if (visitaId) {
      loadVisita(visitaId);
    } else {
      setError("ID de visita no válido");
      setLoading(false);
    }
  }, [visitaId, router]);

  const loadVisita = async (id: number) => {
    setLoading(true);
    setError(null);
    
    // Simular carga de datos
    setTimeout(() => {
      const visitaEncontrada = visitasDetalladas.find(v => v.id === id);
      
      if (visitaEncontrada) {
        setVisita(visitaEncontrada);
      } else {
        setError(`No se encontró la visita con ID: ${id}`);
      }
      
      setLoading(false);
    }, 1000);
  };

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
      case 'completada': return <CheckCircle size={20} />;
      case 'pendiente': return <Clock size={20} />;
      case 'cancelada': return <XCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para abrir ubicación en Google Maps
  const abrirGoogleMaps = () => {
    if (visita?.lat && visita?.lng) {
      const url = `https://www.google.com/maps?q=${visita.lat},${visita.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (visita?.ubicacion) {
      const query = encodeURIComponent(visita.ubicacion);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para imprimir/exportar
  const handlePrint = () => {
    window.print();
  };

  // Función para compartir
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Visita #${visita?.id} - ${visita?.cliente}`,
        text: `Detalles de la visita a ${visita?.cliente} el ${visita?.fecha}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando detalles de la visita...</p>
        </div>
      </div>
    );
  }

  if (error || !visita) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Visita no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || "La visita solicitada no existe"}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mis-visitas"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Volver a Mis Visitas
            </Link>
            <button
              onClick={() => loadVisita(visitaId!)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detalles de Visita</h1>
                <p className="text-sm text-gray-600">
                  ID: {visita.id} • {visita.cliente}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                Imprimir
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Share2 size={18} />
                Compartir
              </button>
              <Link
                href="/mis-visitas"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Volver
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Encabezado de la visita */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getEstadoColor(visita.estado)}`}>
                    {getEstadoIcon(visita.estado)}
                    {visita.estado.charAt(0).toUpperCase() + visita.estado.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: #{visita.id}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{visita.cliente}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={16} />
                  {visita.ubicacion}
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-right mb-4">
                  <p className="text-2xl font-bold text-gray-900">{formatFechaCorta(visita.fecha)}</p>
                  <p className="text-lg text-gray-600">{visita.hora}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{visita.promotor}</p>
                    <p className="text-sm text-gray-500">Promotor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Calendar size={18} />
                  Información de la Visita
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Duración:</span>
                    <span className="font-medium text-blue-900">{visita.duracion || 'No registrada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Fotos:</span>
                    <span className="font-medium text-blue-900">{visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Clima:</span>
                    <span className="font-medium text-blue-900">{visita.clima || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Building size={18} />
                  Información del Cliente
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">ID Cliente:</span>
                    <span className="font-medium text-green-900">#{visita.clienteId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Temperatura:</span>
                    <span className="font-medium text-green-900">{visita.temperatura || 'No registrada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(visita.estado)}`}>
                      {visita.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  Fechas del Sistema
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Creada:</span>
                    <span className="font-medium text-purple-900">{formatFechaCorta(visita.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Actualizada:</span>
                    <span className="font-medium text-purple-900">{formatFechaCorta(visita.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Hora:</span>
                    <span className="font-medium text-purple-900">{visita.hora}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={abrirGoogleMaps}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Navigation size={18} />
                Ver en Google Maps
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download size={18} />
                Descargar Reporte
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
                <Edit size={18} />
                Editar Visita
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <Trash2 size={18} />
                Eliminar Visita
              </button>
            </div>
          </div>

          {/* Notas y Observaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Notas de la Visita
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{visita.notas || 'No hay notas registradas para esta visita.'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Observaciones
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{visita.observaciones || 'No hay observaciones registradas.'}</p>
              </div>
            </div>
          </div>

          {/* Productos y Fotos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building size={20} />
                Productos Mencionados
              </h3>
              {visita.productos && visita.productos.length > 0 ? (
                <div className="space-y-2">
                  {visita.productos.map((producto, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{producto}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-600">No se mencionaron productos en esta visita</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera size={20} />
                Fotos de la Visita
              </h3>
              {visita.fotos > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {visita.fotosUrls && visita.fotosUrls.length > 0 ? (
                    visita.fotosUrls.map((url, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="text-gray-400 mx-auto mb-2" size={24} />
                            <p className="text-sm text-gray-500">Foto {index + 1}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-600">{visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'} registradas</p>
                      <p className="text-sm text-gray-500 mt-1">Las fotos se almacenan en el servidor</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-600">No hay fotos registradas para esta visita</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Detalles Técnicos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID Promotor:</span>
                    <span className="font-medium text-gray-900">#{visita.promotorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado del Sistema:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(visita.estado)}`}>
                      {visita.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Coordenadas GPS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Latitud:</span>
                    <span className="font-medium text-gray-900">{visita.lat?.toFixed(6) || 'No disponible'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Longitud:</span>
                    <span className="font-medium text-gray-900">{visita.lng?.toFixed(6) || 'No disponible'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Metadatos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha Completa:</span>
                    <span className="font-medium text-gray-900">{formatFecha(visita.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Última Actualización:</span>
                    <span className="font-medium text-gray-900">{formatFecha(visita.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-6 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                Detalles de Visita • ID: {visita.id}
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

export default function VisitaDetallePage() {
  return <VisitaDetalleContent />;
}
