export default function RouteDirections({ report, userLocation }) {
  const openInMaps = () => {
    const { latitude: reportLat, longitude: reportLng } = report

    if (userLocation) {
      // Si tenemos la ubicación del usuario, abre con ella como origen
      const { latitude: userLat, longitude: userLng } = userLocation
      const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${reportLat},${reportLng}`
      window.open(mapsUrl, '_blank')
    } else {
      // Si no, solo abre el destino
      const mapsUrl = `https://www.google.com/maps/search/${reportLat},${reportLng}`
      window.open(mapsUrl, '_blank')
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        📍 {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
      </p>
      <button
        onClick={openInMaps}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #34A853 0%, #1E8E3E 100%)',
          color: 'white',
          fontWeight: '600',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 4px 12px rgba(52, 168, 83, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        🗺️ Abrir en Google Maps
      </button>
    </div>
  )
}
