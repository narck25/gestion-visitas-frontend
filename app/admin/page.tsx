"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Calendar, 
  FileText,
  Eye,
  EyeOff,
  Download,
  Filter,
  Search,
  ChevronRight
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { getUserInfo, isAdmin } from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    activePromotors: 0,
    pendingApprovals: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    
    // Simular carga de datos
    const loadData = async () => {
      setLoading(true);
      // En una implementación real, aquí harías fetch a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 156,
        totalVisits: 1243,
        activePromotors: 24,
        pendingApprovals: 8,
      });
      
      setRecentActivity([
        { id: 1, user: "Juan Pérez", action: "Nueva visita registrada", time: "Hace 5 minutos", type: "visit" },
        { id: 2, user: "María García", action: "Usuario registrado", time: "Hace 15 minutos", type: "user" },
        { id: 3, user: "Carlos López", action: "Foto subida", time: "Hace 30 minutos", type: "upload" },
        { id: 4, user: "Ana Martínez", action: "Visita completada", time: "Hace 1 hora", type: "visit" },
        { id: 5, user: "Pedro Sánchez", action: "Configuración actualizada", time: "Hace 2 horas", type: "settings" },
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  const statCards = [
    {
      title: "Usuarios Totales",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Visitas Registradas",
      value: stats.totalVisits,
      icon: BarChart3,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Promotores Activos",
      value: stats.activePromotors,
      icon: Shield,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Aprobaciones Pendientes",
      value: stats.pendingApprovals,
      icon: FileText,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const quickActions = [
    {
      title: "Gestión de Usuarios",
      description: "Administrar usuarios y permisos",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      onClick: () => router.push("/admin/users"),
    },
    {
      title: "Reportes y Estadísticas",
      description: "Ver reportes detallados",
      icon: BarChart3,
      color: "bg-green-100 text-green-600",
      onClick: () => router.push("/admin/reports"),
    },
    {
      title: "Configuración del Sistema",
      description: "Ajustes generales",
      icon: Settings,
      color: "bg-purple-100 text-purple-600",
      onClick: () => router.push("/admin/settings"),
    },
    {
      title: "Calendario de Visitas",
      description: "Ver agenda completa",
      icon: Calendar,
      color: "bg-yellow-100 text-yellow-600",
      onClick: () => router.push("/admin/calendar"),
    },
  ];

  return (
    <RoleGuard adminOnly>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {userInfo?.name || userInfo?.username} ({userInfo?.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Volver al Inicio
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={stat.textColor} size={24} />
                  </div>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{stat.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Total registrado en el sistema</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon size={24} />
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Actividad Reciente</h2>
                <p className="text-gray-600">Últimas acciones en el sistema</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar actividad..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Filter size={18} />
                  Filtrar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download size={18} />
                  Exportar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'visit' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'user' ? 'bg-green-100 text-green-600' :
                        activity.type === 'upload' ? 'bg-purple-100 text-purple-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {activity.type === 'visit' ? <Eye size={20} /> :
                         activity.type === 'user' ? <Users size={20} /> :
                         activity.type === 'upload' ? <FileText size={20} /> :
                         <Settings size={20} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.user}</h4>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2">
                Ver toda la actividad
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Shield size={24} />
                Permisos de Administrador
              </h3>
              <ul className="space-y-3 text-blue-800">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Acceso completo a todas las secciones del sistema</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Gestión de usuarios y asignación de roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Visualización de todas las visitas sin restricciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Configuración del sistema y parámetros generales</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sistema de Roles</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Administrador</h4>
                      <p className="text-sm text-gray-600">Acceso completo</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Activo</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="text-green-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Promotor</h4>
                      <p className="text-sm text-gray-600">Acceso limitado</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">24 activos</span>
                </div>
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
                  Panel de Administración • Sistema de Gestión de Visitas
                </p>
                <p className="text-sm text-gray-500">
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Ayuda
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Documentación
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Soporte
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}