"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { 
  ArrowLeft, 
  Save, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw
} from "lucide-react";
import { getClientById, updateClient, validateClientData, UpdateClientRequest } from "@/lib/clients";
import { getUserInfo } from "@/lib/auth";

function EditarClienteContent() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id ? parseInt(params.id as string) : null;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  
  const [formData, setFormData] = useState<UpdateClientRequest>({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    notes: ""
  });

  const [originalData, setOriginalData] = useState<UpdateClientRequest | null>(null);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    
    if (clientId) {
      loadClient(clientId);
    } else {
      setError("ID de cliente no válido");
      setLoading(false);
    }
  }, [clientId]);

  const loadClient = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const client = await getClientById(id);
      const clientData: UpdateClientRequest = {
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        contactPerson: client.contactPerson || "",
        notes: client.notes || ""
      };
      setFormData(clientData);
      setOriginalData(clientData);
    } catch (err: any) {
      setError(err.message || "Error al cargar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validate form data
    const validation = validateClientData(formData as any);
    if (!validation.isValid) {
      setError(validation.message);
      setSaving(false);
      return;
    }

    try {
      const response = await updateClient(clientId, formData);
      setSuccess(`Cliente "${response.name}" actualizado exitosamente`);
      setOriginalData(formData);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/clientes");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error al actualizar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando información del cliente...</p>
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
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editar Cliente</h1>
                <p className="text-sm text-gray-600">
                  ID: {clientId} • Modificar información del cliente
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/clientes"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Volver a Clientes
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-800">{success}</p>
                <p className="text-sm text-green-700 mt-1">
                  Redirigiendo a la lista de clientes...
                </p>
              </div>
            </div>
          )}

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

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Editar Información del Cliente</h2>
              <p className="text-gray-600">
                Modifica los campos que necesites actualizar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre del Cliente (Requerido) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Building size={16} />
                    Nombre del Cliente *
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Tienda ABC S.A. de C.V."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                  required
                  disabled={saving}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nombre completo de la empresa o negocio
                </p>
              </div>

              {/* Contact Person and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      Persona de Contacto
                    </span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone size={16} />
                      Teléfono
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej: 555-123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ej: contacto@tiendaabc.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                  disabled={saving}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    Dirección
                  </span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ej: Av. Principal #123, Col. Centro"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                  disabled={saving}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    Notas Adicionales
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Información adicional sobre el cliente..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 resize-none"
                  disabled={saving}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Horarios preferidos, productos de interés, observaciones, etc.
                </p>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/clientes"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges()}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                      saving || !hasChanges()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando Cambios...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {hasChanges() ? "Guardar Cambios" : "Sin Cambios"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Form Help */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Información Importante
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Los campos marcados con * son obligatorios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>El botón "Guardar Cambios" se activará solo cuando haya modificaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Los cambios se reflejarán inmediatamente en el sistema</span>
                </li>
              </ul>
            </div>

            {/* Client Info */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} />
                Información del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID del Cliente</p>
                  <p className="font-medium text-gray-900">{clientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última Modificación</p>
                  <p className="font-medium text-gray-900">
                    {originalData ? "Cargando..." : "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Editando como: <span className="font-medium">{userInfo?.name || userInfo?.username}</span> • 
              Rol: <span className="font-medium">{userInfo?.role}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EditarClientePage() {
  return (
    <RoleGuard requireAuth={true} requiredRole={['ADMIN', 'SUPERVISOR']}>
      <EditarClienteContent />
    </RoleGuard>
  );
}