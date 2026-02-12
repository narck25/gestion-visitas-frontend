// Módulo para exportación de datos
import { Client } from './clients';

// Función para exportar a CSV
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Obtener headers del primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear contenido CSV
  const csvContent = [
    headers.join(','), // Headers
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comas y comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función para exportar a PDF (básico usando window.print)
export function exportToPDF(data: any[], title: string = 'Reporte'): void {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear una ventana temporal para imprimir
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('No se pudo abrir la ventana de impresión. Por favor, permite ventanas emergentes.');
    return;
  }

  // Crear contenido HTML para el PDF
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
        // Auto-imprimir al cargar
        window.onload = function() {
          setTimeout(() => {
            window.print();
            // Cerrar ventana después de imprimir (opcional)
            // setTimeout(() => window.close(), 1000);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Función para exportar visitas a CSV
export function exportVisitasToCSV(visitas: any[]): void {
  if (!visitas || visitas.length === 0) {
    alert('No hay visitas para exportar');
    return;
  }

  // Formatear datos para exportación
  const formattedData = visitas.map(visita => ({
    ID: visita.id,
    Fecha: visita.fecha,
    Hora: visita.hora,
    Cliente: visita.cliente,
    Ubicación: visita.ubicacion,
    Promotor: visita.promotor,
    Estado: visita.estado,
    Fotos: visita.fotos,
    Notas: visita.notas || ''
  }));

  const filename = `visitas_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(formattedData, filename);
}

// Función para exportar visitas a PDF
export function exportVisitasToPDF(visitas: any[]): void {
  if (!visitas || visitas.length === 0) {
    alert('No hay visitas para exportar');
    return;
  }

  // Formatear datos para PDF
  const formattedData = visitas.map(visita => ({
    ID: visita.id,
    Fecha: visita.fecha,
    Hora: visita.hora,
    Cliente: visita.cliente,
    Ubicación: visita.ubicacion,
    Promotor: visita.promotor,
    Estado: visita.estado,
    Fotos: visita.fotos,
    Notas: visita.notas || ''
  }));

  exportToPDF(formattedData, 'Reporte de Visitas');
}

// Función para exportar clientes a CSV
export function exportClientesToCSV(clientes: Client[]): void {
  if (!clientes || clientes.length === 0) {
    alert('No hay clientes para exportar');
    return;
  }

  // Formatear datos para exportación
  const formattedData = clientes.map(cliente => ({
    ID: cliente.id,
    Nombre: cliente.name,
    'Persona de Contacto': cliente.contactPerson || '',
    Email: cliente.email || '',
    Teléfono: cliente.phone || '',
    Dirección: cliente.address || '',
    Notas: cliente.notes || '',
    'Fecha Creación': cliente.createdAt,
    'Fecha Actualización': cliente.updatedAt
  }));

  const filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(formattedData, filename);
}

// Función para exportar clientes a PDF
export function exportClientesToPDF(clientes: Client[]): void {
  if (!clientes || clientes.length === 0) {
    alert('No hay clientes para exportar');
    return;
  }

  // Formatear datos para PDF
  const formattedData = clientes.map(cliente => ({
    ID: cliente.id,
    Nombre: cliente.name,
    'Persona de Contacto': cliente.contactPerson || '',
    Email: cliente.email || '',
    Teléfono: cliente.phone || '',
    Dirección: cliente.address || '',
    Notas: cliente.notes || '',
    'Fecha Creación': cliente.createdAt,
    'Fecha Actualización': cliente.updatedAt
  }));

  exportToPDF(formattedData, 'Reporte de Clientes');
}

// Función para formatear fecha para nombres de archivo
function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[0];
}