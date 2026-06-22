import { useState, useRef, useEffect } from 'react'
import '../styles/bottomsheet.css'

export default function BottomSheet({ children, isOpen }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [translateY, setTranslateY] = useState(100)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTranslateY(70)
    } else {
      setTranslateY(100)
    }
  }, [isOpen])

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const diff = e.touches[0].clientY - dragStart
    const percent = Math.max(15, Math.min(85, translateY + (diff / window.innerHeight) * 100))
    setTranslateY(percent)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (translateY > 70) {
      setTranslateY(85)
    } else if (translateY < 40) {
      setTranslateY(15)
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="bottom-sheet-overlay"
          style={{
            opacity: Math.max(0, 1 - translateY / 100),
            pointerEvents: translateY > 80 ? 'none' : 'auto',
          }}
        />
      )}

      <div
        ref={sheetRef}
        className="bottom-sheet-persistent"
        style={{
          transform: `translateY(${translateY}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="bottom-sheet-handle"
          style={{ cursor: 'grab' }}
        >
          <div className="bottom-sheet-line" />
          <span className="bottom-sheet-title">Detalles del Reporte</span>
        </div>

        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>
  )
}
