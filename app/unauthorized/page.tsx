"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-yellow-600" size={48} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Acceso No Autorizado</h1>
          
          <p className="text-gray-600 mb-6">
            No tienes los permisos necesarios para acceder a esta página.
            Esta sección está restringida a usuarios con roles específicos.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Información de Roles:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  <strong>Administrador:</strong> Acceso completo a todas las secciones
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <strong>Promotor:</strong> Acceso limitado a sus propias visitas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                  <strong>Usuario:</strong> Acceso básico según permisos asignados
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Volver al Inicio
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
            >
              Volver Atrás
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Si crees que esto es un error, por favor contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}