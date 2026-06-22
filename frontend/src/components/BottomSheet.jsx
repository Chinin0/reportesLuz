import { useState, useRef, useEffect } from 'react'
import '../styles/bottomsheet.css'

export default function BottomSheet({ children, isOpen }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [translateY, setTranslateY] = useState(85)
  const sheetRef = useRef(null)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart(e.clientY)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const diff = e.clientY - dragStart
    const percent = Math.max(15, Math.min(85, translateY + (diff / window.innerHeight) * 100))
    setTranslateY(percent)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // Snap a posición cercana
    if (translateY > 70) {
      setTranslateY(85) // Pico mínimo
    } else if (translateY < 40) {
      setTranslateY(15) // Expandido
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, translateY])

  return (
    <div
      ref={sheetRef}
      className="bottom-sheet-persistent"
      style={{
        transform: `translateY(${translateY}%)`,
      }}
    >
      {/* Drag Handle */}
      <div
        className="bottom-sheet-handle"
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          setIsDragging(true)
          setDragStart(e.touches[0].clientY)
        }}
        onTouchMove={(e) => {
          if (!isDragging) return
          const diff = e.touches[0].clientY - dragStart
          const percent = Math.max(15, Math.min(85, translateY + (diff / window.innerHeight) * 100))
          setTranslateY(percent)
        }}
        onTouchEnd={() => {
          setIsDragging(false)
          if (translateY > 70) {
            setTranslateY(85)
          } else if (translateY < 40) {
            setTranslateY(15)
          }
        }}
      >
        <div className="bottom-sheet-line" />
        <span className="bottom-sheet-title">Detalles del Reporte</span>
      </div>

      {/* Content con Scroll */}
      <div className="bottom-sheet-content">
        {children}
      </div>
    </div>
  )
}
