"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  PieChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  RefreshCw,
  Shield
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { getUserInfo } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

// Importar componentes de recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

export default function AdminEstadisticas() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  // Datos de ejemplo para las gráficas (serán reemplazados por datos reales del backend)
  const [visitasPorMes, setVisitasPorMes] = useState([
    { mes: 'Ene', visitas: 120, clientes: 85 },
    { mes: 'Feb', visitas: 150, clientes: 95 },
    { mes: 'Mar', visitas: 180, clientes: 110 },
    { mes: 'Abr', visitas: 210, clientes: 130 },
    { mes: 'May', visitas: 190, clientes: 115 },
    { mes: 'Jun', visitas: 220, clientes: 140 },
    { mes: 'Jul', visitas: 240, clientes: 155 },
    { mes: 'Ago', visitas: 230, clientes: 145 },
    { mes: 'Sep', visitas: 250, clientes: 160 },
    { mes: 'Oct', visitas: 270, clientes: 175 },
    { mes: 'Nov', visitas: 260, clientes: 170 },
    { mes: 'Dic', visitas: 280, clientes: 185 },
  ]);

  const [visitasPorPromotor, setVisitasPorPromotor] = useState([
    { name: 'Juan Pérez', value: 45, color: '#0088FE' },
    { name: 'María García', value: 38, color: '#00C49F' },
    { name: 'Carlos López', value: 52, color: '#FFBB28' },
    { name: 'Ana Martínez', value: 29, color: '#FF8042' },
    { name: 'Pedro Sánchez', value: 41, color: '#8884D8' },
  ]);

  const [actividadSemanal, setActividadSemanal] = useState([
    { dia: 'Lun', visitas: 12, clientes: 8 },
    { dia: 'Mar', visitas: 15, clientes: 10 },
    { dia: 'Mié', visitas: 18, clientes: 12 },
    { dia: 'Jue', visitas: 14, clientes: 9 },
    { dia: 'Vie', visitas: 20, clientes: 14 },
    { dia: 'Sáb', visitas: 8, clientes: 5 },
    { dia: 'Dom', visitas: 5, clientes: 3 },
  ]);

  // Función para cargar datos del backend
  const loadStatsData = async () => {
    setLoading(true);
    try {
      // En una implementación real, aquí consumiríamos el endpoint del backend
      // const data = await apiFetch("/api/admin/estadisticas");
      // setStatsData(data);
      
      // Por ahora usamos datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular datos del backend
      setStatsData({
        totalVisitas: 2450,
        totalClientes: 1560,
        promedioDiario: 68,
        crecimiento: 12.5
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    loadStatsData();
  }, []);

  // Colores para las gráficas
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <RoleGuard adminOnly>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Estadísticas del Sistema</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {userInfo?.name || userInfo?.username} ({userInfo?.role})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/admin")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Filtros y controles */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Filtros de Estadísticas</h2>
                <p className="text-sm text-gray-600">Selecciona el período y criterios para las gráficas</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">Todos los promotores</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María García</option>
                  <option value="3">Carlos López</option>
                </select>
                <button 
                  onClick={loadStatsData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw size={18} />
                  Actualizar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download size={18} />
                  Exportar Datos
                </button>
              </div>
            </div>
          </div>

          {/* Resumen de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">2,450</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Visitas</h3>
              <p className="text-sm text-gray-500">Visitas registradas en el sistema</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">1,560</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Clientes</h3>
              <p className="text-sm text-gray-500">Clientes atendidos</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">68</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Promedio Diario</h3>
              <p className="text-sm text-gray-500">Visitas por día</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="text-yellow-600" size={24} />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">12.5%</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Crecimiento</h3>
              <p className="text-sm text-gray-500">Incremento mensual</p>
            </div>
          </div>

          {/* Sección 1: Visitas por Mes (Bar Chart) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">1️⃣ Visitas por Mes</h2>
                  <p className="text-gray-600">Distribución mensual de visitas y clientes</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Ver detalles
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={visitasPorMes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitas" name="Visitas" fill="#0088FE" />
                    <Bar dataKey="clientes" name="Clientes" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Esta gráfica muestra la distribución de visitas y clientes atendidos por mes.</p>
                <p className="mt-1">Los datos serán reemplazados por información real del backend.</p>
              </div>
            </div>
          </div>

          {/* Sección 2: Visitas por Promotor (Pie Chart) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <PieChart className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">2️⃣ Visitas por Promotor</h2>
                  <p className="text-gray-600">Distribución porcentual de visitas por promotor</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Ver detalles
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={visitasPorPromotor}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {visitasPorPromotor.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Promotor</h3>
                  <div className="space-y-3">
                    {visitasPorPromotor.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value} visitas</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Actividad Semanal (Line Chart) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <LineChart className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">3️⃣ Actividad Semanal</h2>
                  <p className="text-gray-600">Tendencia de visitas durante la semana</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Ver detalles
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={actividadSemanal}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="visitas" 
                      name="Visitas" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clientes" 
                      name="Clientes" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Esta gráfica muestra la tendencia de actividad durante la semana.</p>
                <p className="mt-1">Los datos serán reemplazados por información real del backend.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 bg-white border-t border-gray-200 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-600">
                    Estadísticas del Sistema • Panel de Administración
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
        </main>
      </div>
    </RoleGuard>
  );
}
