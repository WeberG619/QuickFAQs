# QuickFAQs Deployment Guide

This guide covers deployment options and configurations for both the frontend and backend of QuickFAQs.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 16+ and npm
- MongoDB Atlas account (for production database)
- OpenAI API key
- Stripe account and API keys
- Domain name and SSL certificate

## Local Development

### Using Docker Compose

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/quickfaqs.git
   cd quickfaqs
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit the .env files with your values
   ```

3. **Start the development stack**:
   ```bash
   # Start all services
   docker-compose up --build
   
   # Start specific services
   docker-compose up backend frontend mongo
   ```

4. **Access local services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: mongodb://localhost:27017
   - Grafana: http://localhost:3001
   - Prometheus: http://localhost:9090
   - Kibana: http://localhost:5601

## Production Deployment

### Infrastructure Setup

1. **Set up a Virtual Private Cloud (VPC)**:
   - Create separate subnets for public and private resources
   - Configure security groups and network ACLs
   - Set up NAT Gateway for private subnets

2. **Configure Load Balancer**:
   - Use Application Load Balancer (ALB)
   - Enable SSL/TLS termination
   - Configure health checks

3. **Set up Container Registry**:
   ```bash
   # Build images
   docker-compose build
   
   # Tag images
   docker tag quickfaqs-backend:latest your-registry/quickfaqs-backend:latest
   docker tag quickfaqs-frontend:latest your-registry/quickfaqs-frontend:latest
   
   # Push to registry
   docker push your-registry/quickfaqs-backend:latest
   docker push your-registry/quickfaqs-frontend:latest
   ```

### Deployment Options

#### Option 1: Docker Swarm

1. **Initialize Swarm**:
   ```bash
   docker swarm init
   ```

2. **Deploy the stack**:
   ```bash
   docker stack deploy -c docker-compose.prod.yml quickfaqs
   ```

#### Option 2: Kubernetes

1. **Apply configurations**:
   ```bash
   # Apply namespace
   kubectl apply -f k8s/namespace.yml
   
   # Apply secrets and configmaps
   kubectl apply -f k8s/config/
   
   # Deploy applications
   kubectl apply -f k8s/apps/
   ```

2. **Verify deployment**:
   ```bash
   kubectl get pods -n quickfaqs
   kubectl get services -n quickfaqs
   ```

### Monitoring Stack Deployment

1. **Deploy Prometheus and Grafana**:
   ```bash
   # Create monitoring namespace
   kubectl create namespace monitoring
   
   # Deploy Prometheus
   helm install prometheus prometheus-community/prometheus \
     --namespace monitoring \
     --values monitoring/prometheus-values.yml
   
   # Deploy Grafana
   helm install grafana grafana/grafana \
     --namespace monitoring \
     --values monitoring/grafana-values.yml
   ```

2. **Deploy ELK Stack**:
   ```bash
   # Create logging namespace
   kubectl create namespace logging
   
   # Deploy Elasticsearch
   helm install elasticsearch elastic/elasticsearch \
     --namespace logging \
     --values monitoring/elasticsearch-values.yml
   
   # Deploy Kibana
   helm install kibana elastic/kibana \
     --namespace logging \
     --values monitoring/kibana-values.yml
   
   # Deploy Logstash
   helm install logstash elastic/logstash \
     --namespace logging \
     --values monitoring/logstash-values.yml
   ```

## Security Configuration

### SSL/TLS Setup

1. **Generate certificates**:
   ```bash
   certbot certonly --dns-cloudflare \
     --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
     -d quickfaqs.com -d www.quickfaqs.com
   ```

2. **Configure SSL in Nginx**:
   ```nginx
   server {
     listen 443 ssl http2;
     server_name quickfaqs.com;
     
     ssl_certificate /etc/letsencrypt/live/quickfaqs.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/quickfaqs.com/privkey.pem;
     
     # Modern configuration
     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
     ssl_prefer_server_ciphers off;
     
     # HSTS
     add_header Strict-Transport-Security "max-age=63072000" always;
   }
   ```

### Security Headers

1. **Configure security headers**:
   ```javascript
   // backend/src/middleware/security.js
   const helmet = require('helmet');
   
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", "https://api.openai.com"]
       }
     },
     crossOriginEmbedderPolicy: true,
     crossOriginOpenerPolicy: true,
     crossOriginResourcePolicy: { policy: "same-site" }
   }));
   ```

## Database Configuration

### MongoDB Production Setup

1. **Create MongoDB Atlas cluster**:
   - Choose M10 or higher tier for production
   - Enable backup and monitoring
   - Configure IP whitelist

2. **Set up database indexes**:
   ```javascript
   // backend/src/models/FAQ.js
   faqSchema.index({ userId: 1, createdAt: -1 });
   faqSchema.index({ category: 1, tags: 1 });
   faqSchema.index({ 
     companyName: 'text', 
     productDetails: 'text', 
     generatedFAQ: 'text' 
   });
   ```

## Monitoring and Logging

### Prometheus Configuration

1. **Configure scrape targets**:
   ```yaml
   # monitoring/prometheus/prometheus.yml
   scrape_configs:
     - job_name: 'quickfaqs-backend'
       static_configs:
         - targets: ['backend:4000']
       metrics_path: '/metrics'
       scheme: 'http'
   ```

### Grafana Setup

1. **Import dashboards**:
   - Node.js Application Dashboard
   - MongoDB Dashboard
   - Custom QuickFAQs Dashboard

2. **Configure alerts**:
   ```yaml
   # monitoring/grafana/provisioning/alerting/high_error_rate.yml
   groups:
     - name: QuickFAQs
       rules:
         - alert: HighErrorRate
           expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
           for: 5m
           labels:
             severity: critical
           annotations:
             summary: High error rate detected
   ```

### ELK Stack Configuration

1. **Configure log shipping**:
   ```yaml
   # monitoring/filebeat/filebeat.yml
   filebeat.inputs:
     - type: container
       paths:
         - '/var/lib/docker/containers/*/*.log'
   
   output.logstash:
     hosts: ["logstash:5044"]
   ```

## Backup and Recovery

### Database Backups

1. **Configure automated backups**:
   ```bash
   # Create backup script
   cat > backup.sh << 'EOF'
   #!/bin/bash
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   mongodump --uri="$MONGO_URI" --out="/backups/mongodb_$TIMESTAMP"
   aws s3 sync /backups s3://quickfaqs-backups/
   find /backups -type d -mtime +7 -exec rm -rf {} +
   EOF
   ```

2. **Schedule backups**:
   ```bash
   # Add to crontab
   0 0 * * * /path/to/backup.sh
   ```

### Application State Backups

1. **Back up configuration**:
   ```bash
   # Backup script
   tar -czf config_backup.tar.gz \
     monitoring/prometheus/prometheus.yml \
     monitoring/grafana/provisioning/ \
     monitoring/logstash/config/
   ```

## Scaling Strategy

### Horizontal Scaling

1. **Configure autoscaling**:
   ```yaml
   # k8s/apps/backend-hpa.yml
   apiVersion: autoscaling/v2beta1
   kind: HorizontalPodAutoscaler
   metadata:
     name: backend-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: backend
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         targetAverageUtilization: 70
   ```

### Performance Optimization

1. **Enable caching**:
   ```javascript
   // backend/src/middleware/cache.js
   const cache = require('../utils/cache');
   
   const cacheMiddleware = async (req, res, next) => {
     const key = `cache:${req.originalUrl}`;
     const cached = await cache.get(key);
     
     if (cached) {
       return res.json(JSON.parse(cached));
     }
     
     next();
   };
   ```

## Troubleshooting

### Common Issues

1. **Container health checks**:
   ```bash
   # Check container status
   docker ps -a
   
   # View container logs
   docker logs <container_id>
   
   # Check resource usage
   docker stats
   ```

2. **Application logs**:
   ```bash
   # View backend logs
   kubectl logs -f deployment/backend -n quickfaqs
   
   # View frontend logs
   kubectl logs -f deployment/frontend -n quickfaqs
   ```

3. **Monitoring alerts**:
   - Check Grafana dashboards
   - Review Kibana logs
   - Monitor Prometheus alerts

## Maintenance Procedures

### Regular Updates

1. **Update dependencies**:
   ```bash
   # Update npm packages
   npm update
   
   # Update Docker images
   docker-compose pull
   ```

2. **Security patches**:
   ```bash
   # Scan for vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

### Performance Tuning

1. **Monitor and optimize**:
   - Review Grafana dashboards
   - Analyze slow queries
   - Optimize resource usage
   - Update scaling policies
