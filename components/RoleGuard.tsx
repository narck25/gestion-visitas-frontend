"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserInfo, isAdmin, hasRole, hasAnyRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string | string[];
  adminOnly?: boolean;
  promotorOnly?: boolean;
}

export default function RoleGuard({
  children,
  requireAuth = true,
  redirectTo = "/",
  requiredRole,
  adminOnly = false,
  promotorOnly = false,
}: RoleGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = () => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      
        if (authStatus) {
          const userInfo = getUserInfo();
          const role = userInfo?.role || null;
          setUserRole(role);
          
          // Verificar acceso basado en roles
          let access = true;
          
          if (adminOnly) {
            // Normalizar rol a mayúsculas para comparación
            const normalizedRole = role?.toUpperCase();
            access = normalizedRole === 'ADMIN';
          } else if (promotorOnly) {
            // Normalizar rol a mayúsculas para comparación
            const normalizedRole = role?.toUpperCase();
            access = normalizedRole === 'PROMOTOR' || normalizedRole === 'USER';
          } else if (requiredRole) {
            if (Array.isArray(requiredRole)) {
              access = hasAnyRole(requiredRole);
            } else {
              access = hasRole(requiredRole);
            }
          }
          
          setHasAccess(access);
        } else {
          setUserRole(null);
          setHasAccess(false);
        }
      
      setIsChecking(false);

      // Redirigir si no está autenticado y requiere autenticación
      if (requireAuth && !authStatus) {
        router.push(redirectTo);
      }
      // Redirigir si está autenticado pero no requiere autenticación
      else if (!requireAuth && authStatus) {
        router.push("/");
      }
      // Redirigir si está autenticado pero no tiene el rol requerido
      else if (requireAuth && authStatus && !hasAccess) {
        router.push("/unauthorized");
      }
    };

    checkAuthAndRole();
  }, [requireAuth, redirectTo, router, requiredRole, adminOnly, promotorOnly, hasAccess]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (requireAuth && isAuth && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-2">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tu rol actual: <span className="font-semibold">{userRole || 'No asignado'}</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuth) {
    return null; // El router redirigirá automáticamente
  }

  return <>{children}</>;
}

// Componente helper para verificar roles en el cliente
export function withRoleCheck(Component: React.ComponentType<any>, options: Omit<RoleGuardProps, 'children'>) {
  return function WithRoleCheckWrapper(props: any) {
    return (
      <RoleGuard {...options}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}