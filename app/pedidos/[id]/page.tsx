"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { 
  ArrowLeft,
  Edit,
  Printer,
  Download,
  ShoppingCart,
  User,
  Package,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { getUserInfo, hasAnyRole } from "@/lib/auth";

// Datos de ejemplo para un pedido específico
const pedidoEjemplo = {
  id: '1',
  cliente: 'Juan Pérez',
  clienteId: 1,
  fecha: '2024-03-09',
  fechaCreacion: '2024-03-09 10:30:00',
  fechaActualizacion: '2024-03-09 14:45:00',
  total: 1250.50,
  estado: 'pendiente',
  notas: 'Pedido urgente para fin de semana. El cliente necesita los productos para el sábado.',
  items: [
    {
      id: 1,
      producto: 'Producto A',
      descripcion: 'Descripción del producto A',
      cantidad: 2,
      precioUnitario: 250.75,
      total: 501.50
    },
    {
      id: 2,
      producto: 'Producto B',
      descripcion: 'Descripción del producto B',
      cantidad: 1,
      precioUnitario: 749.00,
      total: 749.00
    }
  ],
  clienteInfo: {
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '+52 55 1234 5678',
    direccion: 'Calle Principal 123, Ciudad de México',
    contacto: 'Juan Pérez',
    notas: 'Cliente preferente'
  }
};

function DetallePedidoContent() {
  const router = useRouter();
  const params = useParams();
  const pedidoId = params.id as string;
  
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState(pedidoEjemplo);
  const [showFolioModal, setShowFolioModal] = useState(false);
  const [folioIntelisis, setFolioIntelisis] = useState("");
  const [folioLoading, setFolioLoading] = useState(false);
  const [folioError, setFolioError] = useState<string | null>(null);
  const [folioSuccess, setFolioSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    
    // En una implementación real, aquí cargaríamos el pedido específico desde la API
    // usando el pedidoId
    console.log("Cargando pedido ID:", pedidoId);
  }, [pedidoId]);

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
        return <Clock className="text-yellow-600" size={20} />;
      case 'en_proceso':
        return <RefreshCw className="text-blue-600" size={20} />;
      case 'completado':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelado':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
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

  const handleImprimir = () => {
    window.print();
  };

  const handleExportar = () => {
    // Lógica para exportar el pedido
    alert("Exportando pedido...");
  };

  const handleFinalizarCaptura = () => {
    setShowFolioModal(true);
  };

  const handleGuardarFolio = async () => {
    if (!folioIntelisis.trim()) {
      setFolioError("Por favor ingresa el folio Intelisis");
      return;
    }

    setFolioLoading(true);
    setFolioError(null);
    setFolioSuccess(null);

    try {
      // En una implementación real, aquí enviaríamos el folio a la API
      console.log("Guardando folio Intelisis:", folioIntelisis);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar estado del pedido a "CAPTURED"
      setPedido({
        ...pedido,
        estado: 'captured',
        fechaActualizacion: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      setFolioSuccess("Folio guardado exitosamente. Estado actualizado a CAPTURED");
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowFolioModal(false);
        setFolioIntelisis("");
        setFolioSuccess(null);
      }, 2000);

    } catch (err: any) {
      setFolioError(err.message || "Error al guardar el folio");
    } finally {
      setFolioLoading(false);
    }
  };

  const isCapturista = () => {
    return userInfo?.role === 'CAPTURISTA';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando detalles del pedido...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
                <p className="text-sm text-gray-600">
                  Detalles del pedido
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/pedidos"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Volver a Pedidos
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Encabezado del pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h2>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                  {getEstadoIcon(pedido.estado)}
                  {getEstadoTexto(pedido.estado)}
                </span>
              </div>
              <p className="text-gray-600">
                Cliente: <span className="font-medium">{pedido.cliente}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleImprimir}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Printer size={18} />
                Imprimir
              </button>
              <button
                onClick={handleExportar}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={18} />
                Exportar
              </button>
              {canEdit() && (
                <Link
                  href={`/pedidos/${pedido.id}/editar`}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Edit size={18} />
                  Editar
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Fecha del Pedido</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={16} />
                  {pedido.fecha}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total del Pedido</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign size={20} />
                  ${pedido.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Fechas del sistema */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Creado el</p>
                <p className="font-medium text-gray-900">{pedido.fechaCreacion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-900">{pedido.fechaActualizacion}</p>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Cliente ID</p>
                <p className="font-medium text-gray-900">#{pedido.clienteId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items en el pedido</p>
                <p className="font-medium text-gray-900">{pedido.items.length} productos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items del pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Items del Pedido</h3>
              
              <div className="space-y-4">
                {pedido.items.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.producto}</h4>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Cantidad</p>
                        <p className="font-medium text-gray-900">{item.cantidad}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio Unitario</p>
                        <p className="font-medium text-gray-900">${item.precioUnitario.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen total */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-2xl font-bold text-gray-900">${pedido.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total de items</p>
                    <p className="text-xl font-bold text-gray-900">{pedido.items.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas del pedido */}
            {pedido.notas && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Notas del Pedido
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{pedido.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información del cliente */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} />
                Información del Cliente
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{pedido.clienteInfo.nombre}</h4>
                      <p className="text-sm text-gray-600">Cliente #{pedido.clienteId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {pedido.clienteInfo.email && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="text-green-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{pedido.clienteInfo.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {pedido.clienteInfo.telefono && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="text-purple-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{pedido.clienteInfo.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {pedido.clienteInfo.direccion && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-yellow-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium text-gray-900">{pedido.clienteInfo.direccion}</p>
                      </div>
                    </div>
                  )}
                  
                  {pedido.clienteInfo.contacto && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Persona de Contacto</p>
                        <p className="font-medium text-gray-900">{pedido.clienteInfo.contacto}</p>
                      </div>
                    </div>
                  )}
                </div>

                {pedido.clienteInfo.notas && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{pedido.clienteInfo.notas}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/clientes/editar/${pedido.clienteId}`}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    Ver Perfil del Cliente
                  </Link>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/pedidos/nuevo?cliente=${pedido.clienteId}`)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Nuevo Pedido para este Cliente
                </button>
                
                <button
                  onClick={() => router.push(`/clientes/editar/${pedido.clienteId}`)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Editar Información del Cliente
                </button>
                
                <button
                  onClick={handleImprimir}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Imprimir Detalles
                </button>
                
                <button
                  onClick={handleExportar}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Exportar a PDF
                </button>

                {/* Botón para CAPTURISTA */}
                {isCapturista() && pedido.estado !== 'captured' && (
                  <button
                    onClick={handleFinalizarCaptura}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Finalizar captura
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para folio Intelisis */}
      {showFolioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Finalizar Captura</h2>
              <button
                onClick={() => {
                  setShowFolioModal(false);
                  setFolioIntelisis("");
                  setFolioError(null);
                  setFolioSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-blue-600" size={32} />
              </div>
              <p className="text-center text-gray-700 mb-2">
                Ingresar Folio Intelisis
              </p>
              <p className="text-center text-sm text-gray-500 mb-6">
                Pedido #{pedido.id} • Cliente: {pedido.cliente}
              </p>
              
              {/* Mensajes de error/success */}
              {folioError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-red-800">{folioError}</p>
                  </div>
                </div>
              )}
              
              {folioSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-green-800">{folioSuccess}</p>
                  </div>
                </div>
              )}
              
              {/* Campo para folio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folio Intelisis
                </label>
                <input
                  type="text"
                  value={folioIntelisis}
                  onChange={(e) => setFolioIntelisis(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej: INT-2024-001234"
                  disabled={folioLoading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Ingresa el folio generado en Intelisis para este pedido
                </p>
              </div>
              
              {/* Resumen del pedido */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Total del pedido:</p>
                  <p className="font-bold text-gray-900">${pedido.total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Items:</p>
                  <p className="font-medium text-gray-900">{pedido.items.length} productos</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFolioModal(false);
                  setFolioIntelisis("");
                  setFolioError(null);
                  setFolioSuccess(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                disabled={folioLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarFolio}
                disabled={folioLoading || !folioIntelisis.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {folioLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Guardar Folio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">
                Detalles del Pedido #{pedido.id} • {userInfo?.role || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500">
                Estado: {getEstadoTexto(pedido.estado)} • Total: ${pedido.total.toFixed(2)}
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

export default function DetallePedidoPage() {
  return (
    <RoleGuard requireAuth={true} requiredRole={['ADMIN', 'SUPERVISOR', 'PROMOTOR']}>
      <DetallePedidoContent />
    </RoleGuard>
  );
}
