import { useState } from 'react'
import '../styles/bottomsheet.css'

export default function BottomSheet({ children, isOpen }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {isExpanded && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => setIsExpanded(false)}
          style={{
            opacity: 0.5,
            pointerEvents: 'auto',
          }}
        />
      )}

      <div
        className="bottom-sheet-persistent"
        style={{
          transform: isExpanded ? 'translateY(15%)' : 'translateY(80%)',
        }}
      >
        <div
          className="bottom-sheet-handle"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <div className="bottom-sheet-line" />
          <span className="bottom-sheet-title">Detalles del Reporte</span>
        </div>

        {isExpanded && (
          <div className="bottom-sheet-content">
            {children}
          </div>
        )}
      </div>
    </>
  )
}
