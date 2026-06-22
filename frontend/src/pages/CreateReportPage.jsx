import ReportMap from '../components/Map/ReportMap'
import ReportForm from '../components/Forms/ReportForm'
import BottomSheet from '../components/BottomSheet'
import { useState } from 'react'
import '../styles/pages.css'

export default function CreateReportPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [submitted, setSubmitted] = useState(false)

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
          <ReportMap onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
          {selectedLocation && (
            <div className="location-badge">
              📍 Ubicación: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </div>
          )}
        </div>

        {/* Desktop: mostrar forma inline */}
        <div className="form-section">
          {submitted && <div className="success-message">✓ Reporte enviado correctamente!</div>}
          <ReportForm selectedLocation={selectedLocation} onSubmit={handleFormSubmit} />
        </div>
      </div>

      {/* Mobile: Bottom sheet persistente */}
      <BottomSheet isOpen={true}>
        {submitted && <div className="success-message">✓ Reporte enviado correctamente!</div>}
        <ReportForm selectedLocation={selectedLocation} onSubmit={handleFormSubmit} />
      </BottomSheet>
    </div>
  )
}
