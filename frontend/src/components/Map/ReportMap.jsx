import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'
import L from 'leaflet'

// Icono para el reporte (punto rojo simple)
const markerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjRUE0MzM1Ii8+PC9zdmc+',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

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

export default function ReportMap({ onLocationSelect, selectedLocation }) {
  const [position, setPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    // Obtener ubicación del usuario al cargar
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            console.log('Ubicación obtenida:', latitude, longitude)
            setMapCenter([latitude, longitude])
            setMapZoom(15)
          },
          (error) => {
            console.log('Error de geolocalización:', error)
            // Si falla, usa default
            setMapCenter([
              parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
              parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
            ])
          },
          { timeout: 5000, maximumAge: 0 }
        )
      } else {
        // Si no soporta geolocalización, usa default
        setMapCenter([
          parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
          parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
        ])
      }
    }

    getLocation()
  }, [])

  // Usar default si no se cargó la ubicación en 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapCenter) {
        setMapCenter([
          parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
          parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
        ])
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [mapCenter])

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setPosition({ lat, lng })
        onLocationSelect(lat, lng)
      },
    })

    return position ? (
      <Marker position={position} icon={markerIcon}>
        <Popup>Ubicación seleccionada</Popup>
      </Marker>
    ) : null
  }

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
      <LocationMarker />
    </MapContainer>
  )
}
