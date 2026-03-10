"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  Package,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Check,
  Hash,
  List
} from "lucide-react";
import { getUserInfo } from "@/lib/auth";

// Productos de ejemplo con SKU y descripción
const productosEjemplo = [
  { sku: "DEXTRO 08", descripcion: "Dextrosa Monohidratada 08", precio: 150.00 },
  { sku: "DEXTRO 09", descripcion: "Dextrosa Monohidratada 09", precio: 165.00 },
  { sku: "DEXTRO 11", descripcion: "Dextrosa Monohidratada 11", precio: 180.00 },
  { sku: "GLUCOSA 01", descripcion: "Glucosa Anhidra 01", precio: 200.00 },
  { sku: "GLUCOSA 02", descripcion: "Glucosa Anhidra 02", precio: 220.00 },
  { sku: "FRUCTOSA 05", descripcion: "Fructosa Cristalina 05", precio: 250.00 },
  { sku: "MALTOSA 03", descripcion: "Maltosa Monohidratada 03", precio: 190.00 },
  { sku: "SACAROSA 07", descripcion: "Sacarosa Refinada 07", precio: 120.00 },
];

// Clientes de ejemplo
const clientesEjemplo = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "María García" },
  { id: 3, nombre: "Carlos López" },
  { id: 4, nombre: "Ana Martínez" },
];

function NuevoPedidoContent() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchProducto, setSearchProducto] = useState("");
  const [filteredProductos, setFilteredProductos] = useState(productosEjemplo);
  const [showProductList, setShowProductList] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    clienteId: "",
    clienteNombre: "",
    fecha: new Date().toISOString().split('T')[0],
    estado: "pendiente",
    notas: "",
    items: [
      {
        id: 1,
        sku: "",
        descripcion: "",
        cantidad: 1,
        precio: 0,
        total: 0
      }
    ]
  });

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    
    // Cerrar lista de productos al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductList(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Filtrar productos según búsqueda
    if (searchProducto.trim() === "") {
      setFilteredProductos(productosEjemplo);
    } else {
      const searchTerm = searchProducto.toLowerCase();
      setFilteredProductos(
        productosEjemplo.filter(
          producto =>
            producto.sku.toLowerCase().includes(searchTerm) ||
            producto.descripcion.toLowerCase().includes(searchTerm)
        )
      );
    }
  }, [searchProducto]);

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const cliente = clientesEjemplo.find(c => c.id.toString() === clienteId);
    
    setFormData({
      ...formData,
      clienteId,
      clienteNombre: cliente ? cliente.nombre : ""
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    
    if (field === "sku") {
      newItems[index].sku = value;
      // Buscar producto por SKU
      const producto = productosEjemplo.find(p => p.sku === value);
      if (producto) {
        newItems[index].descripcion = producto.descripcion;
        newItems[index].precio = producto.precio;
        newItems[index].total = newItems[index].cantidad * producto.precio;
      }
    } else if (field === "cantidad") {
      const cantidad = parseInt(value) || 0;
      newItems[index].cantidad = cantidad;
      newItems[index].total = cantidad * newItems[index].precio;
    }

    setFormData({
      ...formData,
      items: newItems
    });
  };

  const selectProducto = (index: number, producto: typeof productosEjemplo[0]) => {
    const newItems = [...formData.items];
    newItems[index].sku = producto.sku;
    newItems[index].descripcion = producto.descripcion;
    newItems[index].precio = producto.precio;
    newItems[index].total = newItems[index].cantidad * producto.precio;
    
    setFormData({
      ...formData,
      items: newItems
    });
    setShowProductList(false);
    setSearchProducto("");
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: formData.items.length + 1,
          sku: "",
          descripcion: "",
          cantidad: 1,
          precio: 0,
          total: 0
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  const calcularTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowConfirmModal(false);

    // Validaciones básicas
    if (!formData.clienteId) {
      setError("Por favor selecciona un cliente");
      setLoading(false);
      return;
    }

    if (formData.items.some(item => !item.sku || item.cantidad <= 0)) {
      setError("Por favor completa todos los items del pedido");
      setLoading(false);
      return;
    }

    try {
      // En una implementación real, aquí enviaríamos los datos a la API
      console.log("Datos del pedido:", {
        ...formData,
        total: calcularTotal()
      });

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess("Pedido enviado exitosamente");
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/pedidos");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error al enviar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const productosCorrectos = formData.items.every(item => item.sku && item.descripcion);
  const cantidadesCorrectas = formData.items.every(item => item.cantidad > 0);

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
                <h1 className="text-xl font-bold text-gray-900">Nuevo Pedido</h1>
                <p className="text-sm text-gray-600">
                  Crear un nuevo pedido en el sistema
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
        {/* Mensajes de estado */}
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-green-800">{success}</p>
              <p className="text-sm text-green-600 mt-1">
                Redirigiendo a la lista de pedidos...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Pedido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Cliente
                  </div>
                </label>
                <select
                  value={formData.clienteId}
                  onChange={handleClienteChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientesEjemplo.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                {formData.clienteNombre && (
                  <p className="mt-2 text-sm text-gray-600">
                    Cliente seleccionado: <span className="font-medium">{formData.clienteNombre}</span>
                  </p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Fecha del Pedido
                  </div>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Pedido
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Notas adicionales
                  </div>
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Notas sobre el pedido..."
                />
              </div>
            </div>
          </div>

          {/* Items del pedido */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Items del Pedido</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar línea
              </button>
            </div>

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Línea #{index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SKU con autocomplete */}
                    <div className="relative" ref={searchRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Hash size={14} />
                          SKU
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => {
                            handleItemChange(index, "sku", e.target.value);
                            setSearchProducto(e.target.value);
                            setShowProductList(true);
                          }}
                          onFocus={() => setShowProductList(true)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Buscar SKU..."
                          required
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      
                      {/* Lista de productos */}
                      {showProductList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProductos.map((producto) => (
                            <button
                              key={producto.sku}
                              type="button"
                              onClick={() => selectProducto(index, producto)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{producto.sku}</div>
                              <div className="text-sm text-gray-600">{producto.descripcion}</div>
                              <div className="text-sm text-gray-500">Precio: ${producto.precio.toFixed(2)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <List size={14} />
                          Descripción
                        </div>
                      </label>
                      <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg min-h-[42px]">
                        <p className="text-gray-900">{item.descripcion || "Selecciona un SKU"}</p>
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Total de la línea */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Precio unitario: ${item.precio.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total línea: ${item.total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total de líneas: {formData.items.length}</p>
                  <p className="text-sm text-gray-600">Líneas completas: {formData.items.filter(item => item.sku && item.descripcion).length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total del pedido</p>
                  <p className="text-2xl font-bold text-gray-900">${calcularTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/pedidos"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enviar Pedido
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirmar Pedido</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-blue-600" size={32} />
              </div>
              <p className="text-center text-gray-700 mb-2">
                ¿Seguro que deseas enviar el pedido?
              </p>
              <p className="text-center font-bold text-lg text-gray-900 mb-4">
                Pedido para: {formData.clienteNombre}
              </p>
              
              {/* Checklist */}
              <div className="space-y-3 mb-6">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${productosCorrectos ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  {productosCorrectos ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-yellow-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Productos correctos</p>
                    <p className="text-sm text-gray-600">
                      {productosCorrectos ? 'Todos los productos tienen SKU y descripción' : 'Algunos productos no tienen SKU o descripción'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-3 rounded-lg ${cantidadesCorrectas ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  {cantidadesCorrectas ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-yellow-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Cantidades correctas</p>
                    <p className="text-sm text-gray-600">
                      {cantidadesCorrectas ? 'Todas las cantidades son mayores a 0' : 'Algunas cantidades son 0 o negativas'}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Total del pedido: <span className="font-bold">${calcularTotal().toFixed(2)}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                Revisar
              </button>
              <button
                onClick={confirmSubmit}
                disabled={!productosCorrectos || !cantidadesCorrectas}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Pedido
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
                Creando nuevo pedido • {userInfo?.role || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500">
                {formData.items.length} líneas en el pedido
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

export default function NuevoPedidoPage() {
  return (
    <RoleGuard requireAuth={true} requiredRole={['ADMIN', 'SUPERVISOR', 'PROMOTOR']}>
      <NuevoPedidoContent />
    </RoleGuard>
  );
}
