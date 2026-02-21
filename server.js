/**
 * WeCanMakeIt — Production Express Server
 * Stack: Node.js + Express + MongoDB + JWT + Stripe + Razorpay + Nodemailer
 */
require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');

/* ── routes ── */
const authRoutes    = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');

/* ── middleware ── */
const errorHandler = require('./middleware/errorHandler');

const app = express();

/* ═══════════════════════════════
   SECURITY
═══════════════════════════════ */
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

/* ═══════════════════════════════
   RATE LIMITING
═══════════════════════════════ */
const globalLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error:'Too many requests, slow down.' },
});
const strictLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 20,
  message: { error:'Rate limit hit. Try again in 15 minutes.' },
});
app.use('/api/', globalLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/auth', strictLimiter);

/* ═══════════════════════════════
   BODY PARSING
   Stripe webhooks need raw body — must come before express.json()
═══════════════════════════════ */
app.use('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ═══════════════════════════════
   LOGGING
═══════════════════════════════ */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/* ═══════════════════════════════
   DATABASE
═══════════════════════════════ */
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => console.log('✅  MongoDB connected'))
.catch(err => { console.error('❌  MongoDB error:', err.message); process.exit(1); });

/* ═══════════════════════════════
   ROUTES
═══════════════════════════════ */
app.use('/api/auth',    authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);

/* ── health ── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'WeCanMakeIt API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ── 404 ── */
app.use('*', (req, res) => {
  res.status(404).json({ success:false, error:`Route ${req.originalUrl} not found.` });
});

/* ── error handler ── */
app.use(errorHandler);

/* ═══════════════════════════════
   START
═══════════════════════════════ */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀  WeCanMakeIt API → http://localhost:${PORT}`);
  console.log(`🌍  Environment   → ${process.env.NODE_ENV || 'development'}`);
});

/* graceful shutdown */
process.on('SIGTERM', () => {
  server.close(() => { mongoose.connection.close(); process.exit(0); });
});

module.exports = app;
