"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Key, Save, Edit, X, Loader2, 
  AlertCircle, CheckCircle, Shield, Calendar
} from "lucide-react";
import { getUserInfo } from "@/lib/auth";

// Tipos de datos
interface UserProfile {
  id: string | number;
  username: string;
  name: string;
  email?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UpdateProfileRequest {
  name: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function MiPerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userInfo = getUserInfo();
    if (userInfo) {
      // Usar datos reales del usuario desde localStorage/JWT
      const userProfile: UserProfile = {
        id: userInfo.id, // Usar el ID real del usuario
        username: userInfo.username,
        name: userInfo.name,
        email: userInfo.email, // Usar el email real del usuario
        role: userInfo.role,
        createdAt: new Date().toISOString().split('T')[0], // Fecha actual como ejemplo
        updatedAt: new Date().toISOString().split('T')[0], // Fecha actual como ejemplo
      };
      
      setProfile(userProfile);
      setFormData({
        name: userInfo.name,
        email: userInfo.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): { isValid: boolean; message: string } => {
    // Validar nombre
    if (!formData.name.trim()) {
      return { isValid: false, message: "El nombre es requerido" };
    }

    if (formData.name.trim().length < 2) {
      return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" };
    }

    // Validar email si se proporciona
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return { isValid: false, message: "El email no tiene un formato válido" };
      }
    }

    // Validar cambio de contraseña (si se intenta cambiar)
    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        return { isValid: false, message: "La contraseña actual es requerida para cambiar la contraseña" };
      }

      if (!formData.newPassword) {
        return { isValid: false, message: "La nueva contraseña es requerida" };
      }

      if (formData.newPassword.length < 6) {
        return { isValid: false, message: "La nueva contraseña debe tener al menos 6 caracteres" };
      }

      if (!formData.confirmPassword) {
        return { isValid: false, message: "La confirmación de contraseña es requerida" };
      }

      if (formData.newPassword !== formData.confirmPassword) {
        return { isValid: false, message: "Las contraseñas no coinciden" };
      }
    }

    return { isValid: true, message: "" };
  };

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);

    // Validar formulario
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);

    try {
      // En una implementación real, aquí se llamaría a la API
      // const response = await apiFetch('/api/auth/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(formData),
      // });

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar perfil localmente
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          name: formData.name.trim(),
          email: formData.email?.trim() || profile.email,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        
        setProfile(updatedProfile);
      }

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
      
      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err: any) {
      console.error("Error al guardar perfil:", err);
      setError(err.message || "Error al guardar los cambios. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleDisplay = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      ADMIN: "Administrador",
      promotor: "Promotor",
      PROMOTOR: "Promotor",
      user: "Usuario",
      USER: "Usuario",
    };
    return roles[role] || role;
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              Volver
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Información del perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="text-blue-600" size={28} />
              Información Personal
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit size={18} />
                Editar
              </button>
            )}
          </div>

          {/* Mensajes de éxito/error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Información de solo lectura */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Nombre de usuario</p>
                  <p className="font-bold text-gray-900">{profile.username}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Rol</p>
                  <div className="flex items-center gap-2">
                    <Shield className="text-blue-500" size={18} />
                    <p className="font-bold text-gray-900">{getRoleDisplay(profile.role)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Nombre completo</p>
                  <p className="font-bold text-gray-900">{profile.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-400" size={18} />
                    <p className="font-bold text-gray-900">{profile.email || "No especificado"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-gray-400" size={20} />
                  Información de la cuenta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Cuenta creada</p>
                    <p className="font-medium text-gray-900">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Última actualización</p>
                    <p className="font-medium text-gray-900">{formatDate(profile.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Formulario de edición */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Sección de cambio de contraseña */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="text-gray-400" size={20} />
                  Cambiar contraseña (opcional)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Deja estos campos vacíos si no deseas cambiar la contraseña.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                    isSaving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información de la cuenta (solo lectura) */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles de la cuenta</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">ID de usuario</p>
                <p className="font-mono font-bold text-gray-900">{profile.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Nombre de usuario</p>
                <p className="font-bold text-gray-900">{profile.username}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rol del sistema</p>
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500" size={18} />
                <p className="font-bold text-gray-900">{getRoleDisplay(profile.role)}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Estado de la cuenta</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <p className="font-bold text-gray-900">Activa</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Acciones de la cuenta</h4>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = "/auth/login"}
                className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Key size={18} />
                Cambiar contraseña
              </button>
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                    window.location.href = "/auth/login?logout=true";
                  }
                }}
                className="w-full bg-red-50 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
