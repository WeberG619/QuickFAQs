const promClient = require('prom-client');
const responseTime = require('response-time');
const logger = require('./logger');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'quickfaqs-backend'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotalCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotalCounter);

// Middleware to measure response time and record metrics
const metricsMiddleware = responseTime((req, res, time) => {
  if (req.route) {
    const route = req.route.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Record response time
    httpRequestDurationMicroseconds
      .labels(method, route, statusCode)
      .observe(time / 1000); // Convert to seconds

    // Increment request counter
    httpRequestsTotalCounter
      .labels(method, route, statusCode)
      .inc();

    // Log request details
    logger.info({
      message: 'Request processed',
      method,
      route,
      statusCode,
      responseTime: time,
      user: req.user ? req.user.id : 'anonymous'
    });
  }
});

// Health check endpoint data
const healthCheck = {
  uptime: () => process.uptime(),
  responseTime: () => process.hrtime(),
  message: () => 'OK',
  timestamp: () => Date.now()
};

module.exports = {
  register,
  metricsMiddleware,
  healthCheck,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestsTotalCounter
  }
};
