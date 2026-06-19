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

function LocationButton() {
  const map = useMap()
  const [userMarker, setUserMarker] = useState(null)

  const handleLocation = () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            map.setView([latitude, longitude], 15)

            // Remover marcador anterior si existe
            if (userMarker) {
              map.removeLayer(userMarker)
            }

            // Agregar nuevo marcador
            const newMarker = L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI3IiBmaWxsPSIjMzI4MmY2Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMyODJmNiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              }),
            }).addTo(map).bindPopup('Tu ubicación actual')

            setUserMarker(newMarker)
          },
          (error) => {
            console.error('Error de geolocalización:', error)
            alert('No se pudo acceder a tu ubicación')
          }
        )
      } else {
        alert('Tu navegador no soporta geolocalización')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <button
      onClick={handleLocation}
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '10px',
        zIndex: 400,
        background: 'white',
        border: '1px solid #ccc',
        padding: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '18px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Ir a mi ubicación"
    >
      🎯
    </button>
  )
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

      <LocationButton />

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
