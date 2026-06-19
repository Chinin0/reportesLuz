import { useState, useEffect, useRef } from 'react'
import AdminMap from '../components/Admin/AdminMap'
import ReportsList from '../components/Admin/ReportsList'
import RouteDirections from '../components/Admin/RouteDirections'
import { exportReportToPDF } from '../utils/mapExport'
import '../styles/pages.css'

export default function AdminPage() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [filters])

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Geolocalización no disponible:', error.message)
        }
      )
    }
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports?${params}`)
      const data = await response.json()
      setReports(data.data || [])
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReportUpdate = () => {
    fetchReports()
    setSelectedReport(null)
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Panel de Admin</h1>
        <p>Gestiona todos los reportes de alumbrado público</p>
      </div>

      <div className="admin-grid">
        <div className="admin-map-section">
          <AdminMap reports={reports} selectedReport={selectedReport} onSelectReport={setSelectedReport} />
        </div>

        <div className="admin-list-section">
          <div className="filters">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="asignado">Asignado</option>
              <option value="en_progreso">En Progreso</option>
              <option value="resuelto">Resuelto</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {loading ? (
            <p>Cargando reportes...</p>
          ) : (
            <ReportsList
              reports={reports}
              selectedReport={selectedReport}
              onSelect={setSelectedReport}
              onUpdate={handleReportUpdate}
            />
          )}
        </div>
      </div>

      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleReportUpdate}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}

function ReportDetail({ report, onClose, onUpdate, userLocation }) {
  const [formData, setFormData] = useState({
    status: report.status,
    priority: report.priority,
    admin_notes: report.admin_notes || '',
    assigned_to: report.assigned_to || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDirections, setShowDirections] = useState(false)
  const [exporting, setExporting] = useState(false)
  const mapRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const html2canvas = (await import('html2canvas')).default

      // Capturar el mapa visible
      const mapElement = document.querySelector('.admin-map-section')
      let mapImageData = null

      if (mapElement) {
        try {
          const mapCanvas = await html2canvas(mapElement, {
            backgroundColor: '#fff',
            scale: 1,
            logging: false,
            useCORS: true,
          })
          mapImageData = mapCanvas.toDataURL('image/png')
        } catch (e) {
          console.log('No se pudo capturar el mapa:', e)
        }
      }

      // Crear contenido PDF compacto
      const timestamp = new Date().toLocaleDateString('es-ES')
      const hour = new Date().toLocaleTimeString('es-ES')

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h1 style="color: #3B82F4; text-align: center; margin: 5px 0; font-size: 20px;">📍 Reporte #${report.id}</h1>

          <table style="width: 100%; font-size: 11px; margin-bottom: 10px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px; width: 40%;"><strong>Tipo:</strong></td>
              <td style="padding: 3px 5px;">${report.problem_type}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Estado:</strong></td>
              <td style="padding: 3px 5px;">${report.status}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Prioridad:</strong></td>
              <td style="padding: 3px 5px;">${report.priority}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Descripción:</strong></td>
              <td style="padding: 3px 5px;">${report.description}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Ubicación:</strong></td>
              <td style="padding: 3px 5px;">${report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Reportero:</strong></td>
              <td style="padding: 3px 5px;">${report.reporter_name || 'Anónimo'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Fecha:</strong></td>
              <td style="padding: 3px 5px;">${new Date(report.created_at).toLocaleDateString('es-ES')}</td>
            </tr>
            ${report.assigned_to ? `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 3px 5px;"><strong>Asignado a:</strong></td>
              <td style="padding: 3px 5px;">${report.assigned_to}</td>
            </tr>
            ` : ''}
          </table>

          ${mapImageData ? `
          <div style="margin: 10px 0;">
            <h3 style="font-size: 12px; margin: 5px 0; color: #333;">📍 Ubicación en Mapa</h3>
            <img src="${mapImageData}" style="width: 100%; border: 1px solid #ddd;" />
          </div>
          ` : ''}

          <div style="border-top: 1px solid #ddd; padding-top: 5px; text-align: center; font-size: 9px; color: #999; margin-top: 10px;">
            <p>Generado: ${timestamp} ${hour}</p>
          </div>
        </div>
      `

      const element = document.createElement('div')
      element.innerHTML = htmlContent

      const options = {
        margin: [5, 5, 5, 5],
        filename: `reporte-${report.id}.pdf`,
        image: { type: 'png', quality: 0.95 },
        html2canvas: { scale: 1 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }

      await html2pdf().set(options).from(element).save()
    } catch (err) {
      console.error('Error exportando:', err)
      setError('Error al exportar PDF: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/${report.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        onUpdate()
      } else {
        setError(data.message || 'Error al actualizar')
      }
    } catch (err) {
      setError('Error al conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>Detalles del Reporte #{report.id}</h2>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${!showDirections ? 'active' : ''}`}
            onClick={() => setShowDirections(false)}
          >
            Información
          </button>
          <button
            className={`tab-btn ${showDirections ? 'active' : ''}`}
            onClick={() => setShowDirections(true)}
          >
            Indicaciones 🗺️
          </button>
        </div>

        {!showDirections ? (
          <>
            <div className="report-details">
              <p><strong>Tipo:</strong> {report.problem_type}</p>
              <p><strong>Descripción:</strong> {report.description}</p>
              <p><strong>Ubicación:</strong> {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</p>
              <p><strong>Reportero:</strong> {report.reporter_name || 'Anónimo'}</p>
              <p><strong>Email:</strong> {report.reporter_email || 'No proporcionado'}</p>
              <p><strong>Teléfono:</strong> {report.reporter_phone || 'No proporcionado'}</p>
              <p><strong>Creado:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Estado</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="pendiente">Pendiente</option>
                  <option value="asignado">Asignado</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Asignado a</label>
                <input
                  type="text"
                  name="assigned_to"
                  placeholder="Nombre de la cuadrilla"
                  value={formData.assigned_to}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  name="admin_notes"
                  placeholder="Notas internas"
                  value={formData.admin_notes}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="error">{error}</p>}

              <div className="button-group">
                <button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={exporting}
                  style={{
                    background: '#34A853',
                    color: 'white',
                  }}
                >
                  {exporting ? 'Exportando...' : '📥 Descargar PDF'}
                </button>
                <button type="button" onClick={onClose}>Cerrar</button>
              </div>
            </form>
          </>
        ) : (
          <RouteDirections report={report} userLocation={userLocation} />
        )}
      </div>
    </div>
  )
}
