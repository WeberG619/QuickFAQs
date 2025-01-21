# QuickFAQs Monitoring and Error Tracking Guide

This guide covers the monitoring, logging, and error tracking setup for both the frontend and backend of QuickFAQs.

## Monitoring Stack Overview

QuickFAQs uses a comprehensive monitoring stack:

1. **Prometheus & Grafana**: For metrics collection and visualization
2. **ELK Stack**: For centralized logging
3. **Docker & Docker Compose**: For containerization and orchestration

### Quick Start

```bash
# Start the entire stack
docker-compose up -d

# Access monitoring interfaces:
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Kibana: http://localhost:5601
```

## Monitoring Components

### Prometheus

- **Port**: 9090
- **Config**: `monitoring/prometheus/prometheus.yml`
- **Metrics**:
  - HTTP request duration
  - Total HTTP requests
  - Node.js metrics (memory, CPU)
  - MongoDB metrics
  - Custom business metrics

### Grafana

- **Port**: 3001
- **Default Login**: admin/admin
- **Features**:
  - Pre-configured dashboards
  - Prometheus & Elasticsearch datasources
  - Automated provisioning
  - Alert configuration

### ELK Stack

#### Elasticsearch
- **Port**: 9200
- **Features**:
  - Document storage
  - Full-text search
  - Real-time analytics

#### Logstash
- **Ports**: 
  - 5044 (Beats)
  - 5000 (TCP)
  - 9600 (API)
- **Config**: 
  - `monitoring/logstash/config/logstash.yml`
  - `monitoring/logstash/pipeline/logstash.conf`

#### Kibana
- **Port**: 5601
- **Features**:
  - Log visualization
  - Search interface
  - Dashboard creation

## Application Monitoring

### Backend Monitoring

1. **Metrics Collection**:
   ```javascript
   // Example metric collection
   const requestDuration = new client.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status']
   });
   ```

2. **Logging**:
   ```javascript
   // Example structured logging
   logger.info('API request', {
     method: req.method,
     path: req.path,
     duration: requestDuration,
     userId: req.user?.id
   });
   ```

### Frontend Monitoring

1. **Performance Metrics**:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)
   - Cumulative Layout Shift (CLS)

2. **Error Tracking**:
   ```javascript
   // Example error boundary
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, errorInfo) {
       logger.error('Frontend Error', {
         error,
         errorInfo,
         component: this.props.componentName
       });
     }
   }
   ```

## Alert Configuration

### Grafana Alerts

1. **High Error Rate**:
   - Condition: >5% error rate over 5 minutes
   - Severity: Critical
   - Notification: Email + Slack

2. **API Latency**:
   - Condition: >500ms p95 over 5 minutes
   - Severity: Warning
   - Notification: Slack

3. **Memory Usage**:
   - Condition: >85% usage
   - Severity: Warning
   - Notification: Email

## Maintenance Procedures

### Log Management

1. **Rotation Policy**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

2. **Cleanup Policy**:
   - Elasticsearch indices: 30 days retention
   - Prometheus metrics: 15 days retention
   - Container logs: 3 files, 10MB each

### Backup Procedures

1. **Volume Backups**:
   ```bash
   # Backup monitoring data
   docker run --rm \
     --volumes-from prometheus \
     -v $(pwd)/backup:/backup \
     alpine tar cvf /backup/prometheus-backup.tar /prometheus
   ```

2. **Configuration Backups**:
   - Store all configurations in version control
   - Regular backups of Grafana dashboards
   - Export of Kibana visualizations

## Troubleshooting Guide

### Common Issues

1. **High Memory Usage**:
   ```bash
   # Check container stats
   docker stats
   
   # Check Elasticsearch heap
   curl -X GET "localhost:9200/_nodes/stats/jvm?pretty"
   ```

2. **Slow Queries**:
   ```bash
   # Check MongoDB logs
   docker-compose logs mongo
   
   # Check slow query log in Kibana
   ```

3. **Container Issues**:
   ```bash
   # Check container health
   docker-compose ps
   
   # View container logs
   docker-compose logs [service_name]
   ```

### Security Considerations

1. **Access Control**:
   - Use strong passwords for all services
   - Implement role-based access in Grafana
   - Secure Elasticsearch with X-Pack

2. **Network Security**:
   - Internal-only access to Prometheus
   - HTTPS for external access
   - Regular security audits

3. **Data Protection**:
   - Regular backups
   - Data encryption at rest
   - Secure credential management

## Development Guidelines

### Adding New Metrics

1. **Define Metric**:
   ```javascript
   const newMetric = new prometheus.Counter({
     name: 'my_metric_name',
     help: 'Description of the metric'
   });
   ```

2. **Update Grafana**:
   - Add to relevant dashboard
   - Configure appropriate alerts
   - Document in this guide

### Adding New Logs

1. **Structured Logging**:
   ```javascript
   logger.info('Event name', {
     context: 'relevant_context',
     metadata: 'additional_info'
   });
   ```

2. **Log Processing**:
   - Update Logstash pipeline if needed
   - Create Kibana visualizations
   - Set up relevant alerts
