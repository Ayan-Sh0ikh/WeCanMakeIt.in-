// controllers/authController.js
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

/* helper: sign access + refresh tokens */
function signTokens(userId) {
  const access = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { access, refresh };
}

/* ─── REGISTER ─── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success:false, error:'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ name, email: email.toLowerCase(), password: hashed });
    const { access, refresh } = signTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: access,
      refreshToken: refresh,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

/* ─── LOGIN ─── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success:false, error:'Invalid email or password.' });
    }
    const { access, refresh } = signTokens(user._id);
    res.json({
      success: true,
      token: access,
      refreshToken: refresh,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

/* ─── REFRESH TOKEN ─── */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success:false, error:'No refresh token provided.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success:false, error:'User not found.' });
    const { access, refresh } = signTokens(user._id);
    res.json({ success:true, token:access, refreshToken:refresh });
  } catch (err) {
    res.status(401).json({ success:false, error:'Invalid or expired refresh token.' });
  }
};

/* ─── GET PROFILE ─── */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success:false, error:'User not found.' });
    res.json({ success:true, user: { id:user._id, name:user.name, email:user.email, role:user.role, createdAt:user.createdAt } });
  } catch (err) { next(err); }
};
