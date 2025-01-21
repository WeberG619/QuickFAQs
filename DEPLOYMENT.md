# QuickFAQs Deployment Guide

This guide covers deployment options and configurations for both the frontend and backend of QuickFAQs.

## Prerequisites

- Docker and Docker Compose installed
- Heroku CLI (for Heroku deployment)
- Vercel CLI (for Vercel deployment)
- MongoDB Atlas account (for production database)
- OpenAI API key
- Stripe account and API keys

## Local Development with Docker

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

2. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: localhost:27017

## Production Deployment

### Backend Deployment (Heroku)

1. Create a new Heroku app:
   ```bash
   heroku create quickfaqs-api
   ```

2. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
   heroku config:set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   heroku config:set FRONTEND_URL=your_frontend_url
   ```

3. Deploy to Heroku:
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   cd frontend
   vercel
   ```

4. Configure environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your Heroku backend URL

### Alternative Deployment Options

#### Backend Alternatives

1. **AWS Elastic Beanstalk**
   - Create an Elastic Beanstalk environment
   - Configure environment variables
   - Deploy using the AWS CLI or EB CLI

2. **Digital Ocean App Platform**
   - Create a new app
   - Connect to your GitHub repository
   - Configure environment variables
   - Enable automatic deployments

#### Frontend Alternatives

1. **Netlify**
   - Connect to your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `build`
   - Set environment variables

2. **AWS Amplify**
   - Connect to your GitHub repository
   - Configure build settings
   - Set environment variables

## Production Considerations

### Security

1. Enable SSL/TLS
2. Set secure headers:
   - CORS configuration
   - Content Security Policy
   - XSS Protection

3. Rate limiting:
   ```javascript
   // Add to backend/src/app.js
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use(limiter);
   ```

### Monitoring

1. Set up logging:
   - Winston for backend logging
   - Sentry for error tracking

2. Performance monitoring:
   - New Relic
   - Datadog
   - CloudWatch (if using AWS)

3. Uptime monitoring:
   - UptimeRobot
   - Pingdom

### Database

1. MongoDB Atlas setup:
   - Choose M0 (free) or higher tier
   - Configure IP whitelist
   - Create database user
   - Enable backup

2. Database indexing:
   ```javascript
   // Add to backend/src/models/User.js
   userSchema.index({ email: 1 });
   ```

### Caching

1. Implement Redis (optional):
   ```javascript
   // Add to backend/src/config/redis.js
   const Redis = require('ioredis');
   
   const redis = new Redis(process.env.REDIS_URL);
   
   module.exports = redis;
   ```

### CI/CD

GitHub Actions workflow is already configured for:
- Running tests
- Deploying to Heroku (backend)
- Deploying to Vercel (frontend)

Required secrets in GitHub:
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME`
- `HEROKU_EMAIL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Scaling Considerations

1. Horizontal scaling:
   - Use load balancer
   - Multiple backend instances
   - MongoDB replica set

2. Vertical scaling:
   - Upgrade server resources
   - Optimize database queries
   - Implement caching

3. Content Delivery:
   - Use CDN for static assets
   - Enable gzip compression
   - Optimize images and assets

## Troubleshooting

1. Check logs:
   ```bash
   # Heroku logs
   heroku logs --tail
   
   # Vercel logs
   vercel logs
   ```

2. Monitor error rates:
   - Set up Sentry
   - Configure error notifications

3. Database monitoring:
   - MongoDB Atlas metrics
   - Query performance analysis

## Backup Strategy

1. Database backups:
   - MongoDB Atlas automated backups
   - Manual backup scripts

2. Application data:
   - Regular exports of critical data
   - Backup environment variables

## SSL/TLS Configuration

1. Heroku:
   - Automatic SSL with paid dynos
   - Configure SSL endpoints

2. Vercel:
   - Automatic SSL certificates
   - Custom domain SSL configuration
