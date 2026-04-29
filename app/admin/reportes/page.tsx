"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  ChevronRight,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { getUserInfo } from "@/lib/auth";

export default function AdminReportes() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para las tablas
  const [visitasPorPromotor, setVisitasPorPromotor] = useState([
    { id: 1, promotor: "Juan Pérez", visitas: 45, clientesAtendidos: 32 },
    { id: 2, promotor: "María García", visitas: 38, clientesAtendidos: 28 },
    { id: 3, promotor: "Carlos López", visitas: 52, clientesAtendidos: 41 },
    { id: 4, promotor: "Ana Martínez", visitas: 29, clientesAtendidos: 22 },
    { id: 5, promotor: "Pedro Sánchez", visitas: 41, clientesAtendidos: 35 },
  ]);

  const [visitasPorCliente, setVisitasPorCliente] = useState([
    { id: 1, cliente: "Empresa ABC S.A.", visitas: 12, ultimaVisita: "2024-03-08" },
    { id: 2, cliente: "Comercial XYZ Ltda.", visitas: 8, ultimaVisita: "2024-03-07" },
    { id: 3, cliente: "Industrias DEF", visitas: 15, ultimaVisita: "2024-03-09" },
    { id: 4, cliente: "Servicios GHI", visitas: 6, ultimaVisita: "2024-03-05" },
    { id: 5, cliente: "Distribuidora JKL", visitas: 10, ultimaVisita: "2024-03-06" },
  ]);

  const [visitasPorDia, setVisitasPorDia] = useState([
    { id: 1, fecha: "2024-03-01", visitas: 8, tendencia: "up" },
    { id: 2, fecha: "2024-03-02", visitas: 12, tendencia: "up" },
    { id: 3, fecha: "2024-03-03", visitas: 5, tendencia: "down" },
    { id: 4, fecha: "2024-03-04", visitas: 15, tendencia: "up" },
    { id: 5, fecha: "2024-03-05", visitas: 10, tendencia: "stable" },
    { id: 6, fecha: "2024-03-06", visitas: 14, tendencia: "up" },
    { id: 7, fecha: "2024-03-07", visitas: 11, tendencia: "down" },
    { id: 8, fecha: "2024-03-08", visitas: 9, tendencia: "down" },
    { id: 9, fecha: "2024-03-09", visitas: 7, tendencia: "down" },
  ]);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "up":
        return <TrendingUp className="text-green-600" size={20} />;
      case "down":
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-gray-600" size={20} />;
    }
  };

  const getTendenciaText = (tendencia: string) => {
    switch (tendencia) {
      case "up":
        return "En aumento";
      case "down":
        return "En descenso";
      default:
        return "Estable";
    }
  };

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
                  <h1 className="text-xl font-bold text-gray-900">Reportes del Sistema</h1>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Filtros de Reportes</h2>
                <p className="text-sm text-gray-600">Selecciona los criterios para generar reportes</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar en reportes..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos los promotores</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María García</option>
                  <option value="3">Carlos López</option>
                </select>
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Filter size={18} />
                  Aplicar Filtros
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download size={18} />
                  Exportar Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Sección 1: Visitas por Promotor */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">1️⃣ Visitas por Promotor</h2>
                  <p className="text-gray-600">Distribución de visitas realizadas por cada promotor</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                Ver detalle
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promotor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clientes Atendidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eficiencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitasPorPromotor.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="text-blue-600" size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.promotor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{item.visitas}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.clientesAtendidos}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${(item.clientesAtendidos / item.visitas) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {Math.round((item.clientesAtendidos / item.visitas) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Espacio para futura gráfica */}
              <div className="p-6 border-t border-gray-200">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
                  <div className="text-center">
                    <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Gráfica de visitas por promotor (futura implementación)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Visitas por Cliente */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">2️⃣ Visitas por Cliente</h2>
                  <p className="text-gray-600">Frecuencia de visitas a cada cliente</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                Ver detalle
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Visita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frecuencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitasPorCliente.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.cliente}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{item.visitas}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.ultimaVisita}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            item.visitas >= 10 ? 'bg-green-100 text-green-800' :
                            item.visitas >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.visitas >= 10 ? 'Alta' : item.visitas >= 5 ? 'Media' : 'Baja'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Espacio para futura gráfica */}
              <div className="p-6 border-t border-gray-200">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
                  <div className="text-center">
                    <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Gráfica de visitas por cliente (futura implementación)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Visitas por Día */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">3️⃣ Visitas por Día</h2>
                  <p className="text-gray-600">Distribución de visitas a lo largo del tiempo</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                Ver detalle
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tendencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Día de la Semana
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitasPorDia.map((item) => {
                      const fecha = new Date(item.fecha);
                      const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.fecha}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-semibold">{item.visitas}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getTendenciaIcon(item.tendencia)}
                              <span className={`text-sm ${
                                item.tendencia === 'up' ? 'text-green-600' :
                                item.tendencia === 'down' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {getTendenciaText(item.tendencia)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{diaSemana}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Espacio para futura gráfica */}
              <div className="p-6 border-t border-gray-200">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
                  <div className="text-center">
                    <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Gráfica de visitas por día (futura implementación)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 bg-white border-t border-gray-200 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-600">
                    Reportes del Sistema • Panel de Administración
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
