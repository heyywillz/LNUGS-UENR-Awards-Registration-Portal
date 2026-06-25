require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(xss());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Parse JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy in production (Render uses a reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
const nominationsRouter = require('./routes/nominations');
const adminRouter = require('./routes/admin');

app.use('/api/nominations', nominationsRouter);
app.use('/api/admin', adminRouter);

// Start server
app.listen(PORT, () => {
  console.log(`LNUGS-UENR Excellence Awards server running on http://localhost:${PORT}`);
});
