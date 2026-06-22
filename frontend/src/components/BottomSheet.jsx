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

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart(e.clientY)
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const diff = e.clientY - dragStart
    const percent = Math.max(15, Math.min(85, translateY + (diff / window.innerHeight) * 100))
    setTranslateY(percent)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    if (translateY > 70) {
      setTranslateY(85)
    } else if (translateY < 40) {
      setTranslateY(15)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, translateY])

  return (
    <>
      {isOpen && (
        <div
          className="bottom-sheet-overlay"
          onClick={(e) => {
            setTranslateY(100)
          }}
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
      >
        <div
          className="bottom-sheet-handle"
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            setIsDragging(true)
            setDragStart(e.touches[0].clientY)
            e.preventDefault()
          }}
          onTouchMove={(e) => {
            if (!isDragging) return
            const diff = e.touches[0].clientY - dragStart
            const percent = Math.max(15, Math.min(85, translateY + (diff / window.innerHeight) * 100))
            setTranslateY(percent)
            e.preventDefault()
          }}
          onTouchEnd={(e) => {
            setIsDragging(false)
            if (translateY > 70) {
              setTranslateY(85)
            } else if (translateY < 40) {
              setTranslateY(15)
            }
            e.preventDefault()
          }}
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
