const db = require('../config/database');

class Report {
  static async create(reportData) {
    const {
      latitude,
      longitude,
      address,
      problem_type,
      description,
      reporter_name,
      reporter_email,
      reporter_phone,
    } = reportData;

    const sql = `
      INSERT INTO reports (
        latitude, longitude, address, problem_type, description,
        reporter_name, reporter_email, reporter_phone, status, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'media')
    `;

    const result = await db.run(sql, [
      latitude,
      longitude,
      address || null,
      problem_type,
      description,
      reporter_name || null,
      reporter_email || null,
      reporter_phone || null,
    ]);

    return this.findById(result.id);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.problem_type) {
      sql += ' AND problem_type = ?';
      params.push(filters.problem_type);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    // Filtro por bbox (cuadro geográfico)
    if (filters.bbox) {
      const [lat1, lng1, lat2, lng2] = filters.bbox;
      sql += ` AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
      params.push(Math.min(lat1, lat2), Math.max(lat1, lat2), Math.min(lng1, lng2), Math.max(lng1, lng2));
    }

    // Ordenamiento
    sql += ' ORDER BY created_at DESC';

    // Paginación
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const reports = await db.all(sql, params);

    // Contar total (sin paginación)
    const countSql = 'SELECT COUNT(*) as total FROM reports WHERE 1=1' +
      (filters.status ? ' AND status = ?' : '') +
      (filters.problem_type ? ' AND problem_type = ?' : '') +
      (filters.priority ? ' AND priority = ?' : '');

    const countParams = [];
    if (filters.status) countParams.push(filters.status);
    if (filters.problem_type) countParams.push(filters.problem_type);
    if (filters.priority) countParams.push(filters.priority);

    const countResult = await db.get(countSql, countParams);

    return {
      total: countResult.total,
      data: reports,
    };
  }

  static async findById(id) {
    const sql = 'SELECT * FROM reports WHERE id = ?';
    return db.get(sql, [id]);
  }

  static async update(id, updateData) {
    const {
      status,
      priority,
      admin_notes,
      assigned_to,
      problem_type,
      description,
    } = updateData;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
      if (assigned_to) {
        updates.push('assigned_date = CURRENT_TIMESTAMP');
      }
    }
    if (problem_type !== undefined) {
      updates.push('problem_type = ?');
      params.push(problem_type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (status === 'resuelto') {
      updates.push('resolved_at = CURRENT_TIMESTAMP');
    }

    params.push(id);

    const sql = `UPDATE reports SET ${updates.join(', ')} WHERE id = ?`;
    await db.run(sql, params);

    return this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM reports WHERE id = ?';
    return db.run(sql, [id]);
  }

  static async getStats() {
    const totalSql = 'SELECT COUNT(*) as total FROM reports';
    const byStatusSql = 'SELECT status, COUNT(*) as count FROM reports GROUP BY status';
    const byTypeSql = 'SELECT problem_type, COUNT(*) as count FROM reports GROUP BY problem_type';

    const [totalResult, byStatus, byType] = await Promise.all([
      db.get(totalSql),
      db.all(byStatusSql),
      db.all(byTypeSql),
    ]);

    const statusMap = {};
    const typeMap = {};

    byStatus.forEach((row) => {
      statusMap[row.status] = row.count;
    });

    byType.forEach((row) => {
      typeMap[row.problem_type] = row.count;
    });

    return {
      total: totalResult.total,
      by_status: statusMap,
      by_type: typeMap,
    };
  }
}

module.exports = Report;
