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
import { getVisitById, Visit, getPhotoUrl, getVisitDuration } from "@/lib/visits";

// Función helper para calcular duración
function calcularDuracion(createdAt: string, updatedAt: string): string {
  const inicio = new Date(createdAt);
  const fin = new Date(updatedAt);
  
  // Validar fechas
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return "Duración no disponible";
  }
  
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / 1000);
  
  // Si la diferencia es negativa (caso raro), mostrar mensaje
  if (diff < 0) {
    return "Datos inconsistentes";
  }
  
  const minutos = Math.floor(diff / 60);
  const segundos = diff % 60;
  
  if (minutos === 0) return `${segundos} segundos`;
  return `${minutos} min ${segundos} seg`;
}

// Tipo para visita detallada adaptada del backend
interface VisitaDetallada {
  id: string;
  fecha: string;
  hora: string;
  cliente: string;
  clienteId: string;
  ubicacion: string;
  lat?: number;
  lng?: number;
  promotor: string;
  promotorId: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
  notas?: string;
  fotos: number;
  beforePhotos: string[];
  afterPhotos: string[];
  createdAt: string;
  updatedAt: string;
  duracion: string;
}

function VisitaDetalleContent() {
  const router = useRouter();
  const params = useParams();
  const visitaId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [visita, setVisita] = useState<VisitaDetallada | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Función para manejar correctamente las fotos base64 (para compatibilidad)
  const getPhotoSrc = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith("data:image")) return photo;
    return `data:image/jpeg;base64,${photo}`;
  };

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

  const loadVisita = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[DEBUG] loadVisita: Iniciando carga de visita con ID: ${id}`);
      
      // Obtener visita real de la API
      const apiVisit = await getVisitById(id);
      console.log('[DEBUG] loadVisita: Objeto apiVisit recibido:', apiVisit);
      
      // Agregar logs de diagnóstico para ver la estructura real
      console.log('[DEBUG] loadVisita: Propiedades de apiVisit:');
      console.log('- id:', apiVisit.id);
      console.log('- client:', (apiVisit as any).client);
      console.log('- client?.name:', (apiVisit as any).client?.name);
      console.log('- client?.id:', (apiVisit as any).client?.id);
      console.log('- promoter:', (apiVisit as any).promoter);
      console.log('- promoter?.name:', (apiVisit as any).promoter?.name);
      console.log('- promoter?.id:', (apiVisit as any).promoter?.id);
      console.log('- status:', apiVisit.status);
      console.log('- notes:', apiVisit.notes);
      console.log('- latitude:', apiVisit.latitude);
      console.log('- longitude:', apiVisit.longitude);
      console.log('- beforePhotos:', (apiVisit as any).beforePhotos);
      console.log('- afterPhotos:', (apiVisit as any).afterPhotos);
      console.log('- photos:', (apiVisit as any).photos);
      console.log('- createdAt:', apiVisit.createdAt);
      console.log('- updatedAt:', apiVisit.updatedAt);
      console.log('- date:', (apiVisit as any).date);
      
      // Mapear datos del backend al formato del frontend
      const fechaISO = apiVisit.createdAt;
      let fecha = 'Sin fecha';
      let hora = 'Sin hora';
      
      if (fechaISO) {
        const fechaObj = new Date(fechaISO);
        if (!isNaN(fechaObj.getTime())) {
          fecha = fechaObj.toISOString().split('T')[0];
          hora = fechaObj.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        }
      }
      
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
      if (apiVisit.latitude && apiVisit.longitude) {
        ubicacion = `Lat: ${apiVisit.latitude.toFixed(6)}, Lng: ${apiVisit.longitude.toFixed(6)}`;
      }
      
      // Mapper robusto usando propiedades correctas
      const visitaMapeada: VisitaDetallada = {
        id: apiVisit.id,
        fecha: fecha,
        hora: hora,
        cliente: (apiVisit as any).client?.name || apiVisit.clientName || "Cliente no especificado",
        clienteId: (apiVisit as any).client?.id || "N/A",
        ubicacion: ubicacion,
        lat: apiVisit.latitude ?? null,
        lng: apiVisit.longitude ?? null,
        promotor: (apiVisit as any).promoter?.name || "Promotor no especificado",
        promotorId: (apiVisit as any).promoter?.id || "N/A",
        estado: estado,
        notas: apiVisit.notes || "",
        fotos: ((apiVisit as any).beforePhotos?.length || 0) + ((apiVisit as any).afterPhotos?.length || 0),
        beforePhotos: (apiVisit as any).beforePhotos || [],
        afterPhotos: (apiVisit as any).afterPhotos || [],
        createdAt: apiVisit.createdAt || "",
        updatedAt: apiVisit.updatedAt || "",
        duracion: getVisitDuration(apiVisit.createdAt || "", apiVisit.updatedAt || "")
      };
      
      console.log('[DEBUG] loadVisita: Objeto mapeado:', visitaMapeada);
      
      setVisita(visitaMapeada);
    } catch (error: any) {
      console.error('[DEBUG] Error al cargar visita:', error);
      
      let errorMessage = 'Error al cargar los detalles de la visita. Por favor, intenta nuevamente.';
      
      if (error?.message?.includes('No se encontró')) {
        errorMessage = `No se encontró la visita con ID: ${id}`;
      } else if (error?.status === 404) {
        errorMessage = 'La visita solicitada no existe.';
      } else if (error?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error?.message?.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
    if (!fecha || fecha === 'Sin fecha') {
      return 'Sin fecha';
    }
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
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
    if (!fecha || fecha === 'Sin fecha') {
      return 'Sin fecha';
    }
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
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
              onClick={() => loadVisita(visitaId)}
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
                  ID: {visita?.id ? visita.id.substring(0, 8) + '...' : 'N/A'} • {visita?.cliente || 'Sin información'}
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
                    ID: #{visita?.id ? visita.id.substring(0, 8) + '...' : 'N/A'}
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
                    <span className="text-sm text-blue-700">Fotos:</span>
                    <span className="font-medium text-blue-900">{visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(visita.estado)}`}>
                      {visita.estado}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Duración:</span>
                    <span className="font-medium text-blue-900">{visita.duracion}</span>
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
                    <span className="text-sm text-green-700">Cliente:</span>
                    <span className="font-medium text-green-900">{visita.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Coordenadas:</span>
                    <span className="font-medium text-green-900">
                      {visita.lat?.toFixed(6) || 'N/A'}, {visita.lng?.toFixed(6) || 'N/A'}
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
                Ver Ubicación
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                Imprimir Detalles
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Share2 size={18} />
                Compartir
              </button>
            </div>

            {/* Notas */}
            {visita.notas && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText size={18} />
                  Notas de la Visita
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{visita.notas}</p>
              </div>
            )}

            {/* Fotos de la visita */}
            {(visita.beforePhotos.length > 0 || visita.afterPhotos.length > 0) && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h3 className="font-medium text-yellow-900 mb-4 flex items-center gap-2">
                  <Camera size={18} />
                  Fotos de la Visita ({visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'})
                </h3>
                
                {/* Fotos ANTES */}
                {visita.beforePhotos?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">ANTES</span>
                      {visita.beforePhotos.length} {visita.beforePhotos.length === 1 ? 'foto' : 'fotos'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {visita.beforePhotos.map((photo, index) => (
                        <img
                          key={`before-${index}`}
                          src={getPhotoUrl(photo)}
                          alt={`Foto antes ${index}`}
                          className="w-full h-40 object-cover rounded-lg border border-yellow-300 cursor-pointer hover:opacity-80 transition"
                          onClick={() => setSelectedImage(getPhotoUrl(photo))}
                          loading="lazy"
                          onError={(e) => {
                            console.error("Error cargando imagen:", photo);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fotos DESPUÉS */}
                {visita.afterPhotos?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">DESPUÉS</span>
                      {visita.afterPhotos.length} {visita.afterPhotos.length === 1 ? 'foto' : 'fotos'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {visita.afterPhotos.map((photo, index) => (
                        <img
                          key={`after-${index}`}
                          src={getPhotoUrl(photo)}
                          alt={`Foto después ${index}`}
                          className="w-full h-40 object-cover rounded-lg border border-green-300 cursor-pointer hover:opacity-80 transition"
                          onClick={() => setSelectedImage(getPhotoUrl(photo))}
                          loading="lazy"
                          onError={(e) => {
                            console.error("Error cargando imagen:", photo);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje si no hay fotos */}
                {visita.beforePhotos.length === 0 && visita.afterPhotos.length === 0 && (
                  <div className="text-center py-4">
                    <Camera size={24} className="mx-auto text-yellow-400 mb-2" />
                    <p className="text-yellow-700 text-sm">No hay fotos disponibles para esta visita</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Información Técnica
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">ID de Visita:</span>
                  <span className="font-mono text-sm text-blue-900">{visita.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Cliente:</span>
                  <div className="text-right">
                    <span className="text-sm text-blue-900 font-medium">{visita.cliente}</span>
                    <div className="text-xs text-blue-600 font-mono">ID: {visita.clienteId}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Promotor:</span>
                  <div className="text-right">
                    <span className="text-sm text-blue-900 font-medium">{visita.promotor}</span>
                    <div className="text-xs text-blue-600 font-mono">ID: {visita.promotorId}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Fecha de Creación:</span>
                  <span className="text-sm text-blue-900">{formatFecha(visita.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Última Actualización:</span>
                  <span className="text-sm text-blue-900">{formatFecha(visita.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Link
                  href="/mis-visitas"
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Volver a Mis Visitas
                </Link>
                <button
                  onClick={() => loadVisita(visitaId)}
                  className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Actualizar Información
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Recargar Página
                </button>
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
                Sistema de Gestión de Visitas • Detalles de Visita
              </p>
              <p className="text-sm text-gray-500">
                Usuario: {userInfo?.name || userInfo?.username} • Rol: {userInfo?.role}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                Generado: {new Date().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal para visualización de imágenes */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full p-4">
            <button
              className="absolute top-2 right-2 text-white text-3xl hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-h-[90vh] w-auto mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisitaDetallePage() {
  return <VisitaDetalleContent />;
}
