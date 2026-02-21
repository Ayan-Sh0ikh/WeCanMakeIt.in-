// middleware/errorHandler.js
module.exports = (err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success:false, error:`${field} already exists.` });
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e=>e.message);
    return res.status(422).json({ success:false, error:'Validation error.', details:messages });
  }
  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success:false, error:`Invalid ${err.path}: ${err.value}` });
  }

  const statusCode = err.statusCode || 500;
  if (!isProd) console.error(`[ERROR ${statusCode}]`, err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    error: (isProd && statusCode===500) ? 'Internal server error.' : (err.message || 'Something went wrong.'),
    ...((!isProd) && { stack: err.stack }),
  });
};
