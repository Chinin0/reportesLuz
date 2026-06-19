import { useForm } from 'react-hook-form'
import { useState } from 'react'
import '../../styles/forms.css'

export default function ReportForm({ selectedLocation, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      problem_type: 'apagado',
      reporter_name: '',
      /* reporter_email: '', */
      reporter_phone: '',
      description: '',
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmitForm = async (data) => {
    if (!selectedLocation) {
      setError('Por favor selecciona una ubicación en el mapa')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const payload = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        problem_type: data.problem_type,
        description: data.description,
        reporter_name: data.reporter_name,
        /* reporter_email: data.reporter_email, */
        reporter_phone: data.reporter_phone,
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        reset()
        onSubmit()
      } else {
        setError(result.message || 'Error al enviar reporte')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="report-form">
      <h2>Detalles del Problema</h2>

      <div className="form-group">
        <label htmlFor="problem_type">Tipo de Problema *</label>
        <select id="problem_type" {...register('problem_type', { required: true })}>
          <option value="apagado">Luz apagada</option>
          <option value="parpadea">Parpadea</option>
          <option value="danado">Dañado</option>
          <option value="otro">Otro</option>
        </select>
        {errors.problem_type && <span className="error">Este campo es requerido</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción *</label>
        <textarea
          id="description"
          placeholder="Describe el problema en detalle..."
          {...register('description', {
            required: 'Este campo es requerido',
            minLength: { value: 5, message: 'Mínimo 5 caracteres' },
            maxLength: { value: 500, message: 'Máximo 500 caracteres' },
          })}
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <h3>Tus Datos (Opcional)</h3>

      <div className="form-group">
        <label htmlFor="reporter_name">Nombre</label>
        <input
          id="reporter_name"
          type="text"
          placeholder="Tu nombre"
          {...register('reporter_name')}
        />
      </div>
{/* 
      <div className="form-group">
        <label htmlFor="reporter_email">Email</label>
        <input
          id="reporter_email"
          type="email"
          placeholder="tu@email.com"
          {...register('reporter_email', {
            validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email inválido',
          })}
        />
        {errors.reporter_email && <span className="error">{errors.reporter_email.message}</span>}
      </div>
 */}
      <div className="form-group">
        <label htmlFor="reporter_phone">Teléfono</label>
        <input
          id="reporter_phone"
          type="tel"
          placeholder="+5917777777"
          {...register('reporter_phone')}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">✓ Reporte enviado correctamente</div>}

      <button type="submit" disabled={loading || !selectedLocation} className="submit-btn">
        {loading ? 'Enviando...' : '📍 Enviar Reporte'}
      </button>

      {!selectedLocation && (
        <p className="info-text">👈 Selecciona una ubicación en el mapa para enviar el reporte</p>
      )}
    </form>
  )
}
