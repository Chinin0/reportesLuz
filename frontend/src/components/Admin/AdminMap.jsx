import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState, useEffect } from 'react'

const createStatusIcon = (status) => {
  // Todos los reportes usan un punto rojo simple
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjRUE0MzM1Ii8+PC9zdmc+',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })
}


export default function AdminMap({ reports, selectedReport, onSelectReport }) {
  const [mapCenter, setMapCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    // Obtener ubicación del usuario al cargar
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            console.log('Ubicación obtenida en admin:', latitude, longitude)
            setMapCenter([latitude, longitude])
            setMapZoom(15)
          },
          (error) => {
            console.log('Error de geolocalización en admin:', error)
            // Si falla, usa default
            setMapCenter([-34.6037, -58.3816])
          },
          { timeout: 5000, maximumAge: 0 }
        )
      } else {
        // Si no soporta geolocalización, usa default
        setMapCenter([-34.6037, -58.3816])
      }
    }

    getLocation()
  }, [])

  // Usar default si no se cargó la ubicación en 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapCenter) {
        setMapCenter([-34.6037, -58.3816])
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [mapCenter])

  // No renderizar el mapa hasta tener el center
  if (!mapCenter) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
        color: '#666',
        fontSize: '14px'
      }}>
        Cargando ubicación...
      </div>
    )
  }

  return (
    <MapContainer
      key={`${mapCenter[0]}-${mapCenter[1]}`}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports
        .filter((report) => report.status !== 'resuelto' && report.status !== 'rechazado')
        .map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createStatusIcon(report.status)}
            eventHandlers={{
              click: () => onSelectReport(report),
            }}
          >
            <Popup>
              <div className="popup-content">
                <p><strong>#{report.id}</strong></p>
                <p>Tipo: {report.problem_type}</p>
                <p>Estado: <strong>{report.status}</strong></p>
                <p>{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {selectedReport && (
        <Circle
          center={[selectedReport.latitude, selectedReport.longitude]}
          radius={100}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1 }}
        />
      )}
    </MapContainer>
  )
}
