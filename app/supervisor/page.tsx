"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Building, 
  Calendar, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  Download,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
  FileText,
  Shield,
  Target,
  Award,
  Activity
} from "lucide-react";
import { isAuthenticated, getUserInfo } from "@/lib/auth";
import { exportVisitasToCSV, exportVisitasToPDF, exportClientesToCSV, exportClientesToPDF } from "@/lib/export";

// Tipos de datos
interface Promotor {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'activo' | 'inactivo' | 'vacaciones';
  visitasCompletadas: number;
  visitasPendientes: number;
  clientesAsignados: number;
  ultimaVisita: string;
}

interface ClienteEquipo {
  id: number;
  name: string;
  promotor: string;
  promotorId: number;
  ubicacion: string;
  ultimaVisita: string;
  visitasTotales: number;
  status: 'activo' | 'inactivo' | 'pendiente';
}

interface VisitaEquipo {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  clienteId: number;
  promotor: string;
  promotorId: number;
  ubicacion: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
  notas?: string;
  fotos: number;
}

// Datos de ejemplo para demostración
const promotoresEjemplo: Promotor[] = [
  {
    id: 101,
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    phone: '555-123-4567',
    status: 'activo',
    visitasCompletadas: 24,
    visitasPendientes: 3,
    clientesAsignados: 15,
    ultimaVisita: '2024-03-15'
  },
  {
    id: 102,
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    phone: '555-234-5678',
    status: 'activo',
    visitasCompletadas: 18,
    visitasPendientes: 5,
    clientesAsignados: 12,
    ultimaVisita: '2024-03-14'
  },
  {
    id: 103,
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    phone: '555-345-6789',
    status: 'vacaciones',
    visitasCompletadas: 15,
    visitasPendientes: 2,
    clientesAsignados: 10,
    ultimaVisita: '2024-03-10'
  },
  {
    id: 104,
    name: 'Ana Martínez',
    email: 'ana.martinez@empresa.com',
    phone: '555-456-7890',
    status: 'activo',
    visitasCompletadas: 30,
    visitasPendientes: 1,
    clientesAsignados: 20,
    ultimaVisita: '2024-03-15'
  },
  {
    id: 105,
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@empresa.com',
    phone: '555-567-8901',
    status: 'inactivo',
    visitasCompletadas: 8,
    visitasPendientes: 0,
    clientesAsignados: 5,
    ultimaVisita: '2024-03-05'
  }
];

const clientesEquipoEjemplo: ClienteEquipo[] = [
  {
    id: 201,
    name: 'Tienda ABC',
    promotor: 'Juan Pérez',
    promotorId: 101,
    ubicacion: 'Centro Comercial Plaza',
    ultimaVisita: '2024-03-15',
    visitasTotales: 12,
    status: 'activo'
  },
  {
    id: 202,
    name: 'Supermercado XYZ',
    promotor: 'María García',
    promotorId: 102,
    ubicacion: 'Av. Principal 123',
    ultimaVisita: '2024-03-14',
    visitasTotales: 8,
    status: 'activo'
  },
  {
    id: 203,
    name: 'Farmacia Salud',
    promotor: 'Carlos López',
    promotorId: 103,
    ubicacion: 'Calle Secundaria 456',
    ultimaVisita: '2024-03-10',
    visitasTotales: 5,
    status: 'activo'
  },
  {
    id: 204,
    name: 'Restaurante Sabor',
    promotor: 'Ana Martínez',
    promotorId: 104,
    ubicacion: 'Zona Gastronómica',
    ultimaVisita: '2024-03-15',
    visitasTotales: 15,
    status: 'activo'
  },
  {
    id: 205,
    name: 'Tienda Moda',
    promotor: 'Pedro Sánchez',
    promotorId: 105,
    ubicacion: 'Centro Comercial Moderno',
    ultimaVisita: '2024-03-05',
    visitasTotales: 3,
    status: 'inactivo'
  },
  {
    id: 206,
    name: 'Cafetería Aroma',
    promotor: 'Juan Pérez',
    promotorId: 101,
    ubicacion: 'Plaza Central',
    ultimaVisita: '2024-03-14',
    visitasTotales: 7,
    status: 'activo'
  },
  {
    id: 207,
    name: 'Papelería Escolar',
    promotor: 'María García',
    promotorId: 102,
    ubicacion: 'Calle Escuela 789',
    ultimaVisita: '2024-03-13',
    visitasTotales: 6,
    status: 'activo'
  },
  {
    id: 208,
    name: 'Ferretería Construye',
    promotor: 'Ana Martínez',
    promotorId: 104,
    ubicacion: 'Av. Industrial 321',
    ultimaVisita: '2024-03-12',
    visitasTotales: 10,
    status: 'activo'
  }
];

const visitasEquipoEjemplo: VisitaEquipo[] = [
  {
    id: 1,
    fecha: '2024-03-15',
    hora: '10:30',
    cliente: 'Tienda ABC',
    clienteId: 201,
    promotor: 'Juan Pérez',
    promotorId: 101,
    ubicacion: 'Centro Comercial Plaza',
    estado: 'completada',
    notas: 'Visita de seguimiento',
    fotos: 3
  },
  {
    id: 2,
    fecha: '2024-03-14',
    hora: '14:00',
    cliente: 'Supermercado XYZ',
    clienteId: 202,
    promotor: 'María García',
    promotorId: 102,
    ubicacion: 'Av. Principal 123',
    estado: 'completada',
    notas: 'Nuevo pedido realizado',
    fotos: 2
  },
  {
    id: 3,
    fecha: '2024-03-14',
    hora: '16:45',
    cliente: 'Farmacia Salud',
    clienteId: 203,
    promotor: 'Carlos López',
    promotorId: 103,
    ubicacion: 'Calle Secundaria 456',
    estado: 'pendiente',
    notas: 'Programada para mañana',
    fotos: 0
  },
  {
    id: 4,
    fecha: '2024-03-13',
    hora: '09:15',
    cliente: 'Restaurante Sabor',
    clienteId: 204,
    promotor: 'Ana Martínez',
    promotorId: 104,
    ubicacion: 'Zona Gastronómica',
    estado: 'completada',
    notas: 'Revisión de inventario',
    fotos: 4
  },
  {
    id: 5,
    fecha: '2024-03-12',
    hora: '11:30',
    cliente: 'Tienda Moda',
    clienteId: 205,
    promotor: 'Pedro Sánchez',
    promotorId: 105,
    ubicacion: 'Centro Comercial Moderno',
    estado: 'cancelada',
    notas: 'Cliente no se presentó',
    fotos: 0
  },
  {
    id: 6,
    fecha: '2024-03-11',
    hora: '13:00',
    cliente: 'Cafetería Aroma',
    clienteId: 206,
    promotor: 'Juan Pérez',
    promotorId: 101,
    ubicacion: 'Plaza Central',
    estado: 'completada',
    notas: 'Entrega de material promocional',
    fotos: 2
  },
  {
    id: 7,
    fecha: '2024-03-10',
    hora: '15:20',
    cliente: 'Papelería Escolar',
    clienteId: 207,
    promotor: 'María García',
    promotorId: 102,
    ubicacion: 'Calle Escuela 789',
    estado: 'completada',
    notas: 'Pedido especial de útiles',
    fotos: 3
  },
  {
    id: 8,
    fecha: '2024-03-09',
    hora: '08:45',
    cliente: 'Ferretería Construye',
    clienteId: 208,
    promotor: 'Ana Martínez',
    promotorId: 104,
    ubicacion: 'Av. Industrial 321',
    estado: 'pendiente',
    notas: 'Seguimiento de cotización',
    fotos: 0
  }
];

function SupervisorContent() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'promotores' | 'clientes' | 'visitas'>('promotores');
  
  // Estados para datos
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [clientesEquipo, setClientesEquipo] = useState<ClienteEquipo[]>([]);
  const [visitasEquipo, setVisitasEquipo] = useState<VisitaEquipo[]>([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPromotor, setFilterPromotor] = useState<string>("todos");
  const [filterFecha, setFilterFecha] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  useEffect(() => {
    // Verificar autenticación y rol
    if (!isAuthenticated()) {
      router.push("/auth/login?redirect=/supervisor");
      return;
    }

    const user = getUserInfo();
    setUserInfo(user);
    
    // Verificar si es supervisor
    const userRole = user?.role?.toUpperCase();
    if (userRole !== 'SUPERVISOR' && userRole !== 'ADMIN') {
      router.push("/unauthorized");
      return;
    }
    
    // Cargar datos
    loadData();
  }, [router]);

  const loadData = () => {
    setLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setPromotores(promotoresEjemplo);
      setClientesEquipo(clientesEquipoEjemplo);
      setVisitasEquipo(visitasEquipoEjemplo);
      setLoading(false);
    }, 1000);
  };

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const totalPromotores = promotores.length;
    const promotoresActivos = promotores.filter(p => p.status === 'activo').length;
    const totalClientes = clientesEquipo.length;
    const clientesActivos = clientesEquipo.filter(c => c.status === 'activo').length;
    const totalVisitas = visitasEquipo.length;
    const visitasCompletadas = visitasEquipo.filter(v => v.estado === 'completada').length;
    
    return {
      totalPromotores,
      promotoresActivos,
      totalClientes,
      clientesActivos,
      totalVisitas,
      visitasCompletadas,
      tasaCompletitud: totalVisitas > 0 ? Math.round((visitasCompletadas / totalVisitas) * 100) : 0
    };
  };

  const estadisticas = getEstadisticas();

  // Función para obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'vacaciones': return 'bg-yellow-100 text-yellow-800';
      case 'pendiente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color de estado de visita
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Función para manejar exportación
  const handleExport = (type: 'promotores' | 'clientes' | 'visitas', format: 'csv' | 'pdf') => {
    let data: any[] = [];
    let title = '';
    
    switch (type) {
      case 'promotores':
        data = promotores;
        title = 'Reporte de Promotores';
        if (format === 'csv') {
          // Crear CSV personalizado para promotores
          exportToCSV(promotores.map(p => ({
            ID: p.id,
            Nombre: p.name,
            Email: p.email,
            Teléfono: p.phone,
            Estado: p.status,
            'Visitas Completadas': p.visitasCompletadas,
            'Visitas Pendientes': p.visitasPendientes,
            'Clientes Asignados': p.clientesAsignados,
            'Última Visita': p.ultimaVisita
          })), `promotores_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          exportToPDF(promotores.map(p => ({
            ID: p.id,
            Nombre: p.name,
            Email: p.email,
            Teléfono: p.phone,
            Estado: p.status,
            'Visitas Completadas': p.visitasCompletadas,
            'Visitas Pendientes': p.visitasPendientes,
            'Clientes Asignados': p.clientesAsignados,
            'Última Visita': p.ultimaVisita
          })), title);
        }
        break;
        
      case 'clientes':
        data = clientesEquipo;
        title = 'Reporte de Clientes del Equipo';
        if (format === 'csv') {
          // Usar exportToCSV directamente con datos formateados
          exportToCSV(clientesEquipo.map(c => ({
            ID: c.id,
            Nombre: c.name,
            Promotor: c.promotor,
            Ubicación: c.ubicacion,
            'Última Visita': c.ultimaVisita,
            'Visitas Totales': c.visitasTotales,
            Estado: c.status
          })), `clientes_equipo_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          exportToPDF(clientesEquipo.map(c => ({
            ID: c.id,
            Nombre: c.name,
            Promotor: c.promotor,
            Ubicación: c.ubicacion,
            'Última Visita': c.ultimaVisita,
            'Visitas Totales': c.visitasTotales,
            Estado: c.status
          })), title);
        }
        break;
        
      case 'visitas':
        data = visitasEquipo;
        title = 'Reporte de Visitas del Equipo';
        if (format === 'csv') {
          exportVisitasToCSV(visitasEquipo);
        } else {
          exportVisitasToPDF(visitasEquipo);
        }
        break;
    }
  };

  // Función auxiliar para exportar a CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función auxiliar para exportar a PDF
  const exportToPDF = (data: any[], title: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Por favor, permite ventanas emergentes.');
      return;
    }

    const headers = Object.keys(data[0]);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #4F46E5; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .date { color: #666; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <p class="date">Generado: ${new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <button class="no-print" onclick="window.print()" style="
            background: #4F46E5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          ">
            🖨️ Imprimir / Guardar como PDF
          </button>
        </div>
        
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Total de registros: ${data.length}</p>
          <p>Sistema de Gestión de Visitas - ${new Date().getFullYear()}</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Función para adaptar clientes para exportación
  const adaptClientesForExport = (clientes: ClienteEquipo[]) => {
    return clientes.map(c => ({
      id: c.id,
      name: c.name,
      contactPerson: c.promotor,
      email: '',
      phone: '',
      address: c.ubicacion,
      notes: `Promotor: ${c.promotor}, Última visita: ${c.ultimaVisita}, Total visitas: ${c.visitasTotales}`,
      createdAt: c.ultimaVisita,
      updatedAt: c.ultimaVisita
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-blue-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-600">Cargando panel de supervisor...</p>
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
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Supervisor</h1>
                <p className="text-sm text-gray-600">
                  Gestión de equipo y seguimiento de actividades
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Inicio
              </Link>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Promotores</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalPromotores}</p>
                <p className="text-sm text-green-600">{estadisticas.promotoresActivos} activos</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalClientes}</p>
                <p className="text-sm text-green-600">{estadisticas.clientesActivos} activos</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Visitas</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalVisitas}</p>
                <p className="text-sm text-green-600">{estadisticas.visitasCompletadas} completadas</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasa de Completitud</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.tasaCompletitud}%</p>
                <p className="text-sm text-blue-600">Eficiencia del equipo</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión del Equipo</h2>
              <p className="text-gray-600">
                Supervisa y gestiona a tus promotores, clientes y visitas
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download size={18} />
                  Exportar
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                  <button
                    onClick={() => handleExport(activeTab, 'csv')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Exportar a CSV
                  </button>
                  <button
                    onClick={() => handleExport(activeTab, 'pdf')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Exportar a PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('promotores')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'promotores'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Promotores ({promotores.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'clientes'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building size={18} />
                Clientes del Equipo ({clientesEquipo.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('visitas')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'visitas'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                Visitas del Equipo ({visitasEquipo.length})
              </div>
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {activeTab === 'visitas' && (
              <>
                <div>
                  <select
                    value={filterPromotor}
                    onChange={(e) => setFilterPromotor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="todos">Todos los promotores</option>
                    {promotores.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="completada">Completadas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cancelada">Canceladas</option>
                  </select>
                </div>
              </>
            )}
            
            {activeTab === 'clientes' && (
              <div>
                <select
                  value={filterPromotor}
                  onChange={(e) => setFilterPromotor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="todos">Todos los promotores</option>
                  {promotores.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <input
                type="date"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {activeTab === 'promotores' && (
            <div className="divide-y divide-gray-100">
              {promotores.map((promotor) => (
                <div key={promotor.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(promotor.status)}`}>
                          {promotor.status.charAt(0).toUpperCase() + promotor.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: #{promotor.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{promotor.name}</h3>
                            <p className="text-sm text-gray-600">{promotor.email}</p>
                            <p className="text-sm text-gray-600">{promotor.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Visitas</p>
                            <p className="font-medium text-gray-900">
                              {promotor.visitasCompletadas} completadas
                            </p>
                            <p className="text-sm text-gray-600">
                              {promotor.visitasPendientes} pendientes
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Clientes</p>
                            <p className="font-medium text-gray-900">{promotor.clientesAsignados} asignados</p>
                            <p className="text-sm text-gray-600">
                              Última: {formatFecha(promotor.ultimaVisita)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Activity className="text-yellow-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Eficiencia</p>
                            <p className="font-medium text-gray-900">
                              {promotor.visitasCompletadas > 0 ? 
                                Math.round((promotor.visitasCompletadas / (promotor.visitasCompletadas + promotor.visitasPendientes)) * 100) : 0}%
                            </p>
                            <p className="text-sm text-gray-600">Tasa de completitud</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg flex items-center gap-2">
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      <ChevronRight className="text-gray-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'clientes' && (
            <div className="divide-y divide-gray-100">
              {clientesEquipo.map((cliente) => (
                <div key={cliente.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cliente.status)}`}>
                          {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: #{cliente.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cliente.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {cliente.ubicacion}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Promotor Asignado</p>
                            <p className="font-medium text-gray-900">{cliente.promotor}</p>
                            <p className="text-sm text-gray-600">ID: #{cliente.promotorId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Historial</p>
                            <p className="font-medium text-gray-900">{cliente.visitasTotales} visitas</p>
                            <p className="text-sm text-gray-600">
                              Última: {formatFecha(cliente.ultimaVisita)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg flex items-center gap-2">
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      <ChevronRight className="text-gray-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'visitas' && (
            <div className="divide-y divide-gray-100">
              {visitasEquipo.map((visita) => (
                <div key={visita.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getEstadoColor(visita.estado)}`}>
                          {visita.estado === 'completada' ? <CheckCircle size={16} /> : 
                           visita.estado === 'pendiente' ? <Clock size={16} /> : 
                           <XCircle size={16} />}
                          {visita.estado.charAt(0).toUpperCase() + visita.estado.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatFecha(visita.fecha)} • {visita.hora}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{visita.cliente}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {visita.ubicacion}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Promotor</p>
                            <p className="font-medium text-gray-900">{visita.promotor}</p>
                            <p className="text-sm text-gray-600">ID: #{visita.promotorId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fotos</p>
                            <p className="font-medium text-gray-900">{visita.fotos} {visita.fotos === 1 ? 'foto' : 'fotos'}</p>
                            <p className="text-sm text-gray-600">ID Cliente: #{visita.clienteId}</p>
                          </div>
                        </div>
                      </div>
                      
                      {visita.notas && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{visita.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg flex items-center gap-2">
                        <Eye size={18} />
                        Ver Detalles
                      </button>
                      <ChevronRight className="text-gray-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen del Equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Promotores</h4>
              <div className="space-y-3">
                {[...promotores]
                  .sort((a, b) => b.visitasCompletadas - a.visitasCompletadas)
                  .slice(0, 3)
                  .map((promotor, index) => (
                    <div key={promotor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{promotor.name}</p>
                          <p className="text-sm text-gray-600">{promotor.visitasCompletadas} visitas</p>
                        </div>
                      </div>
                      <Award className={
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-orange-400'
                      } size={20} />
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Métricas Clave</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Tasa de Completitud</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.tasaCompletitud}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${estadisticas.tasaCompletitud}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Promotores Activos</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.promotoresActivos}/{estadisticas.totalPromotores}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(estadisticas.promotoresActivos / estadisticas.totalPromotores) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Clientes Activos</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.clientesActivos}/{estadisticas.totalClientes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(estadisticas.clientesActivos / estadisticas.totalClientes) * 100}%` }}
                    ></div>
                  </div>
                </div>
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
                Panel de Supervisor • Gestión de Equipo
              </p>
              <p className="text-sm text-gray-500">
                Usuario: {userInfo?.name || userInfo?.username} • Rol: {userInfo?.role}
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

export default function SupervisorPage() {
  return <SupervisorContent />;
}
