import ReportMap from '../components/Map/ReportMap'
import ReportForm from '../components/Forms/ReportForm'
import BottomSheet from '../components/BottomSheet'
import { useState, useEffect } from 'react'
import '../styles/pages.css'

export default function CreateReportPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)

  useEffect(() => {
    const handleGoToLocation = (e) => {
      const { latitude, longitude } = e.detail
      if (mapInstance) {
        mapInstance.setView([latitude, longitude], 15)
      }
    }

    window.addEventListener('goToLocation', handleGoToLocation)
    return () => window.removeEventListener('goToLocation', handleGoToLocation)
  }, [mapInstance])

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ latitude: lat, longitude: lng })
  }

  const handleFormSubmit = () => {
    setSubmitted(true)
    setSelectedLocation(null)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="create-report-page">
      <div className="page-header">
        <h1>Reportar Problema</h1>
        <p>Selecciona la ubicación en el mapa donde hay un problema</p>
      </div>

      <div className="content-grid">
        <div className="map-section">
          <ReportMap onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} onMapReady={setMapInstance} />
          {selectedLocation && (
            <div className="location-badge">
              📍 Ubicación: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </div>
          )}
        </div>

        <div className="form-section">
          {submitted && <div className="success-message">✓ Reporte enviado correctamente!</div>}
          <ReportForm selectedLocation={selectedLocation} onSubmit={handleFormSubmit} />
        </div>
      </div>

      <BottomSheet isOpen={true}>
        {submitted && <div className="success-message">✓ Reporte enviado correctamente!</div>}
        <ReportForm selectedLocation={selectedLocation} onSubmit={handleFormSubmit} />
      </BottomSheet>
    </div>
  )
}
