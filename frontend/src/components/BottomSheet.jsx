import { useState, useRef, useEffect } from 'react'
import '../styles/bottomsheet.css'

export default function BottomSheet({ children, isOpen, onClose }) {
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
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const diff = e.clientY - dragStart
    const percent = Math.max(20, Math.min(100, translateY + (diff / window.innerHeight) * 100))
    setTranslateY(percent)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    if (translateY > 60) {
      setTranslateY(100)
      onClose()
    } else {
      setTranslateY(20)
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
    <>
      {isOpen && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => {
            setTranslateY(100)
            onClose()
          }}
          style={{
            opacity: Math.max(0, 1 - translateY / 100),
            pointerEvents: translateY > 80 ? 'none' : 'auto',
          }}
        />
      )}

      <div
        ref={sheetRef}
        className="bottom-sheet"
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
          }}
          onTouchMove={(e) => {
            if (!isDragging) return
            const diff = e.touches[0].clientY - dragStart
            const percent = Math.max(20, Math.min(100, translateY + (diff / window.innerHeight) * 100))
            setTranslateY(percent)
          }}
          onTouchEnd={() => {
            setIsDragging(false)
            if (translateY > 60) {
              setTranslateY(100)
              onClose()
            } else {
              setTranslateY(20)
            }
          }}
        >
          <div className="bottom-sheet-line" />
        </div>

        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>
  )
}
