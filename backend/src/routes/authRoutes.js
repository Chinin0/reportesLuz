const express = require('express');
const { loginAdmin } = require('../middleware/auth');

const router = express.Router();

// Ruta de login para admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña requeridos',
      });
    }

    const result = await loginAdmin(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en login',
      error: error.message,
    });
  }
});

module.exports = router;
