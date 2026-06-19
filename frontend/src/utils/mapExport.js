import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'

export async function exportReportToPDF(report, mapElement) {
  try {
    // Capturar el mapa como imagen
    const canvas = await html2canvas(mapElement, {
      backgroundColor: '#fff',
      scale: 2,
    })

    const imgData = canvas.toDataURL('image/png')
    const timestamp = new Date().toLocaleDateString('es-ES')
    const hour = new Date().toLocaleTimeString('es-ES')

    // Crear contenido HTML para el PDF
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
        <h1 style="color: #3B82F6; text-align: center; margin-bottom: 30px;">
          📍 Reporte de Alumbrado Público
        </h1>

        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Detalles del Reporte</h2>

          <p style="margin: 8px 0;"><strong>ID Reporte:</strong> #${report.id}</p>
          <p style="margin: 8px 0;"><strong>Tipo de Problema:</strong> ${getProblemaType(report.problem_type)}</p>
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="background: ${getStatusColor(report.status)}; color: white; padding: 4px 8px; border-radius: 4px;">${report.status}</span></p>
          <p style="margin: 8px 0;"><strong>Prioridad:</strong> ${report.priority}</p>
          <p style="margin: 8px 0;"><strong>Descripción:</strong> ${report.description}</p>
          <p style="margin: 8px 0;"><strong>Ubicación:</strong> ${report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</p>
          <p style="margin: 8px 0;"><strong>Reportero:</strong> ${report.reporter_name || 'Anónimo'}</p>
          ${report.reporter_email ? `<p style="margin: 8px 0;"><strong>Email:</strong> ${report.reporter_email}</p>` : ''}
          ${report.reporter_phone ? `<p style="margin: 8px 0;"><strong>Teléfono:</strong> ${report.reporter_phone}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Fecha Creación:</strong> ${new Date(report.created_at).toLocaleDateString('es-ES')}</p>
          ${report.assigned_to ? `<p style="margin: 8px 0;"><strong>Asignado a:</strong> ${report.assigned_to}</p>` : ''}
          ${report.admin_notes ? `<p style="margin: 8px 0;"><strong>Notas:</strong> ${report.admin_notes}</p>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Ubicación en Mapa</h2>
          <img src="${imgData}" style="width: 100%; border: 1px solid #ddd; border-radius: 8px;" />
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 15px; text-align: center; color: #666; font-size: 12px;">
          <p>Documento generado el ${timestamp} a las ${hour}</p>
          <p>Sistema de Reportes de Alumbrado Público</p>
        </div>
      </div>
    `

    // Generar PDF
    const element = document.createElement('div')
    element.innerHTML = htmlContent

    const options = {
      margin: 10,
      filename: `reporte-${report.id}-alumbrado.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    }

    html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('Error exportando PDF:', error)
    throw new Error('No se pudo exportar el PDF')
  }
}

function getProblemaType(type) {
  const types = {
    apagado: 'Luz Apagada',
    parpadea: 'Parpadea',
    danado: 'Dañado',
    otro: 'Otro',
  }
  return types[type] || type
}

function getStatusColor(status) {
  const colors = {
    pendiente: '#EA4335',
    asignado: '#4285F4',
    en_progreso: '#FBBC04',
    resuelto: '#34A853',
    rechazado: '#9AA0A6',
  }
  return colors[status] || '#9AA0A6'
}
