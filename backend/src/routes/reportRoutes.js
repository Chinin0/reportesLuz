const express = require('express');
const { body } = require('express-validator');
const ReportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Validaciones reutilizables
const validateReport = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('problem_type')
    .isIn(['apagado', 'parpadea', 'danado', 'otro'])
    .withMessage('Tipo de problema inválido'),
  body('description').isLength({ min: 5, max: 500 }).withMessage('Descripción debe tener entre 5 y 500 caracteres'),
  body('reporter_name').optional().isLength({ min: 2, max: 100 }),
  body('reporter_email').optional().isEmail(),
  body('reporter_phone').optional().isMobilePhone(),
];

const validateUpdate = [
  body('status')
    .optional()
    .isIn(['pendiente', 'asignado', 'en_progreso', 'resuelto', 'rechazado'])
    .withMessage('Estado inválido'),
  body('priority').optional().isIn(['baja', 'media', 'alta']).withMessage('Prioridad inválida'),
  body('admin_notes').optional().isLength({ max: 500 }),
  body('assigned_to').optional().isLength({ max: 100 }),
];

// Rutas públicas
router.post('/reports', validateReport, ReportController.createReport);
router.get('/reports', ReportController.getReports);
router.get('/reports/:id', ReportController.getReportById);

// Rutas protegidas (admin)
router.patch('/reports/:id', verifyToken, validateUpdate, ReportController.updateReport);
router.delete('/reports/:id', verifyToken, ReportController.deleteReport);
router.get('/stats', verifyToken, ReportController.getStats);

module.exports = router;
