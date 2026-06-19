import '../../styles/admin.css'

export default function ReportsList({ reports, selectedReport, onSelect, onUpdate }) {
  const getStatusBadge = (status) => {
    const colors = {
      pendiente: '#EF4444',
      asignado: '#3B82F6',
      en_progreso: '#F59E0B',
      resuelto: '#10B981',
      rechazado: '#6B7280',
    }
    return <span className="status-badge" style={{ backgroundColor: colors[status] || '#6B7280' }}>{status}</span>
  }

  const getPriorityBadge = (priority) => {
    const icons = { baja: '🟢', media: '🟡', alta: '🔴' }
    return <span>{icons[priority] || '⚪'} {priority}</span>
  }

  return (
    <div className="reports-list">
      <h3>Reportes ({reports.length})</h3>

      {reports.length === 0 ? (
        <p>No hay reportes</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#ID</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className={selectedReport?.id === report.id ? 'selected' : ''}
                onClick={() => onSelect(report)}
              >
                <td className="id">#{report.id}</td>
                <td>{report.problem_type}</td>
                <td className="description">
                  {report.description.substring(0, 30)}...
                </td>
                <td>{getStatusBadge(report.status)}</td>
                <td>{getPriorityBadge(report.priority)}</td>
                <td className="date">{new Date(report.created_at).toLocaleDateString()}</td>
                <td className="action">
                  <button onClick={(e) => { e.stopPropagation(); onSelect(report); }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
