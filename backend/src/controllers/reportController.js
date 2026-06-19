const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const axios = require('axios');

// Obtener dirección desde coordenadas usando Nominatim (OpenStreetMap)
async function getAddressFromCoords(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: { 'User-Agent': 'AlumbradoPublicoReports/1.0' },
      }
    );
    return response.data.address?.road || response.data.display_name || null;
  } catch (error) {
    console.error('Error getting address:', error.message);
    return null;
  }
}

class ReportController {
  static async createReport(req, res) {
    try {
      // Validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { latitude, longitude, problem_type, description, reporter_name, reporter_email, reporter_phone } = req.body;

      // Obtener dirección automáticamente
      const address = await getAddressFromCoords(latitude, longitude);

      const reportData = {
        latitude,
        longitude,
        address,
        problem_type,
        description,
        reporter_name,
        reporter_email,
        reporter_phone,
      };

      const report = await Report.create(reportData);

      return res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente',
        data: report,
      });
    } catch (error) {
      console.error('Error creating report:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el reporte',
        error: error.message,
      });
    }
  }

  static async getReports(req, res) {
    try {
      const { status, problem_type, priority, limit = 50, offset = 0, bbox } = req.query;

      const filters = {
        status: status || null,
        problem_type: problem_type || null,
        priority: priority || null,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      if (bbox) {
        filters.bbox = bbox.split(',').map(Number);
      }

      const result = await Report.findAll(filters);

      return res.json({
        success: true,
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        data: result.data,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener reportes',
        error: error.message,
      });
    }
  }

  static async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await Report.findById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      return res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el reporte',
        error: error.message,
      });
    }
  }

  static async updateReport(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      const updatedReport = await Report.update(id, req.body);

      return res.json({
        success: true,
        message: 'Reporte actualizado exitosamente',
        data: updatedReport,
      });
    } catch (error) {
      console.error('Error updating report:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el reporte',
        error: error.message,
      });
    }
  }

  static async deleteReport(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      await Report.delete(id);

      return res.json({
        success: true,
        message: 'Reporte eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el reporte',
        error: error.message,
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Report.getStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }
}

module.exports = ReportController;
