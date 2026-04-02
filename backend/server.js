require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Initialize email queue
try {
  require('./services/emailQueue');
  console.log('Email queue initialized');
} catch (error) {
  console.error('Failed to initialize email queue:', error.message);
  console.log('Email functionality will not work without Redis');
}

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const allowedOrigins = [
  'https://cofsjabalpur.com',
  'https://www.cofsjabalpur.com',
  'https://cofsjabalpur.in',
  'https://www.cofsjabalpur.in',
  'https://cofsjabalpur.org',
  'https://www.cofsjabalpur.org',
  'https://college-of-fishery-jabalpur.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Upload-Category',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
}));

// Prevent caching for API responses
app.use('/api', (req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads with proper headers
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/news', require('./routes/news'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/research', require('./routes/research'));
app.use('/api/infrastructure', require('./routes/infrastructure'));
app.use('/api/collaborations', require('./routes/collaborations'));
app.use('/api/content', require('./routes/content'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/slideshow', require('./routes/slideshow'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/proxy', require('./routes/proxy'));
app.use('/api/placement', require('./routes/placement'));
app.use('/api/incubation', require('./routes/incubation'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/academics', require('./routes/academics'));
app.use('/api/extension', require('./routes/extension'));
app.use('/api/student-corner', require('./routes/studentCorner'));
app.use('/api/application', require('./routes/application'));
app.use('/api/job-application', require('./routes/jobApplication'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/contact', require('./routes/contact'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fishery College API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing gracefully...');
  try {
    const { closeQueue } = require('./services/emailQueue');
    await closeQueue();
  } catch (error) {
    console.error('Error closing queue:', error);
  }
  process.exit(0);
});

module.exports = app;




 