const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-super-secreta-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 86400;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Hash de la contraseña admin (en producción, usar base de datos)
let adminPasswordHash = null;

async function initAdminPassword() {
  adminPasswordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10);
}

initAdminPassword();

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message,
    });
  }
}

async function loginAdmin(email, password) {
  if (email !== ADMIN_EMAIL) {
    return { success: false, message: 'Credenciales inválidas' };
  }

  const isPasswordValid = await bcryptjs.compare(password, adminPasswordHash);
  if (!isPasswordValid) {
    return { success: false, message: 'Credenciales inválidas' };
  }

  const token = generateToken({
    email,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
  });

  return {
    success: true,
    token,
    expires_in: JWT_EXPIRES_IN,
  };
}

module.exports = {
  generateToken,
  verifyToken,
  loginAdmin,
};
