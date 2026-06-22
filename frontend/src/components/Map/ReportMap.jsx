import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'
import L from 'leaflet'

const markerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjRUE0MzM1Ii8+PC9zdmc+',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjMzI4MmY2Ii8+PC9zdmc+',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

function MapInitializer({ onMapReady, onLocationSelect, setPosition }) {
  const map = useMap()

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  useEffect(() => {
    const handleGoToLocation = (e) => {
      const { latitude, longitude, markLocation } = e.detail
      map.setView([latitude, longitude], 15)
      
      if (markLocation && onLocationSelect) {
        onLocationSelect(latitude, longitude)
        if (setPosition) {
          setPosition({ lat: latitude, lng: longitude })
        }
      }
    }

    window.addEventListener('goToLocation', handleGoToLocation)
    return () => window.removeEventListener('goToLocation', handleGoToLocation)
  }, [map, onLocationSelect, setPosition])

  return null
}

export default function ReportMap({ onLocationSelect, selectedLocation, onMapReady }) {
  const [position, setPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(13)
  const [userLocation, setUserLocation] = useState(null)
  const [ignoreNextClick, setIgnoreNextClick] = useState(false)

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            setMapCenter([latitude, longitude])
            setMapZoom(15)
          },
          (error) => {
            console.log('Error de geolocalización:', error)
            setMapCenter([
              parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
              parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
            ])
          },
          { timeout: 5000, maximumAge: 0 }
        )
      } else {
        setMapCenter([
          parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
          parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
        ])
      }
    }

    getLocation()
  }, [])

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
        if (ignoreNextClick) {
          setIgnoreNextClick(false)
          return
        }

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
      
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>
      )}

      <MapInitializer onMapReady={onMapReady} onLocationSelect={onLocationSelect} setPosition={setPosition} />
      <LocationMarker />
    </MapContainer>
  )
}
