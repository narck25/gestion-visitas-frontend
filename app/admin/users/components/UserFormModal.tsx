"use client";

import { useState, useEffect } from "react";
import { X, Save, User as UserIcon, Mail, Lock, Shield } from "lucide-react";
import { User, validateUserData, validateUpdateUserData, CreateUserRequest, UpdateUserRequest } from "@/lib/users";

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
}

export default function UserFormModal({ user, onClose, onSubmit }: UserFormModalProps) {
  const isEditing = !!user;
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    password: "",
    role: "PROMOTOR",
  });

  const [updateFormData, setUpdateFormData] = useState<UpdateUserRequest>({
    name: "",
    email: "",
    role: "PROMOTOR",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUpdateFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "PROMOTOR",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (isEditing) {
      setUpdateFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    if (isEditing) {
      const validation = validateUpdateUserData(updateFormData);
      if (!validation.isValid) {
        setErrors({ general: validation.message });
        return false;
      }
    } else {
      const validation = validateUserData(formData);
      if (!validation.isValid) {
        setErrors({ general: validation.message });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit(updateFormData);
      } else {
        await onSubmit(formData);
      }
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleOptions = () => [
    { value: "ADMIN", label: "Administrador" },
    { value: "SUPERVISOR", label: "Supervisor" },
    { value: "PROMOTOR", label: "Promotor" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="
          bg-white
          dark:bg-gray-900
          w-full
          max-w-lg
          rounded-2xl
          shadow-2xl
          p-6
          animate-fadeIn
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete la información del usuario
            </p>
          </div>
          <button
            onClick={onClose}
            className="
              p-2
              rounded-lg
              text-gray-500
              hover:text-gray-700
              hover:bg-gray-100
              dark:text-gray-400
              dark:hover:text-gray-300
              dark:hover:bg-gray-800
              transition
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Error messages */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={isEditing ? updateFormData.name : formData.name}
                  onChange={handleInputChange}
                  className="
                    pl-10
                    w-full
                    px-3
                    py-2.5
                    border
                    border-gray-300
                    rounded-lg
                    bg-white
                    text-gray-900
                    placeholder-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    dark:bg-gray-800
                    dark:border-gray-700
                    dark:text-white
                    dark:placeholder-gray-400
                  "
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={isEditing ? updateFormData.email : formData.email}
                  onChange={handleInputChange}
                  className="
                    pl-10
                    w-full
                    px-3
                    py-2.5
                    border
                    border-gray-300
                    rounded-lg
                    bg-white
                    text-gray-900
                    placeholder-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    dark:bg-gray-800
                    dark:border-gray-700
                    dark:text-white
                    dark:placeholder-gray-400
                  "
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            {/* Password (only for new users) */}
            {!isEditing && (
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 dark:text-gray-500" size={18} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="
                      pl-10
                      w-full
                      px-3
                      py-2.5
                      border
                      border-gray-300
                      rounded-lg
                      bg-white
                      text-gray-900
                      placeholder-gray-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      focus:border-blue-500
                      dark:bg-gray-800
                      dark:border-gray-700
                      dark:text-white
                      dark:placeholder-gray-400
                    "
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            )}

            {/* Role */}
            <div>
              <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol del usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <select
                  id="role"
                  name="role"
                  value={isEditing ? updateFormData.role : formData.role}
                  onChange={handleInputChange}
                  className="
                    pl-10
                    w-full
                    px-3
                    py-2.5
                    border
                    border-gray-300
                    rounded-lg
                    bg-white
                    text-gray-900
                    placeholder-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    dark:bg-gray-800
                    dark:border-gray-700
                    dark:text-white
                    dark:placeholder-gray-400
                    appearance-none
                  "
                  required
                >
                  {getRoleOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active status (only for editing) */}
            {isEditing && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={updateFormData.isActive}
                  onChange={handleInputChange}
                  className="
                    h-4
                    w-4
                    text-blue-600
                    focus:ring-blue-500
                    border-gray-300
                    rounded
                    dark:bg-gray-800
                    dark:border-gray-700
                  "
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Usuario activo
                </label>
              </div>
            )}
          </div>

          {/* Form actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4
                py-2
                rounded-lg
                border
                border-gray-300
                text-gray-700
                hover:bg-gray-100
                dark:border-gray-600
                dark:text-gray-300
                dark:hover:bg-gray-800
                transition
              "
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                bg-blue-600
                text-white
                hover:bg-blue-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? "Actualizar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}