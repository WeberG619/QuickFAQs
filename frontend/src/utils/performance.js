// Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
import { captureMessage } from './errorTracking';

const vitalsCallback = ({ name, delta, id }) => {
  // Report to analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name}: `, delta);
  }

  // Send to Sentry if the values are poor
  const poorThresholds = {
    CLS: 0.1,    // Cumulative Layout Shift
    FID: 100,    // First Input Delay
    LCP: 2500,   // Largest Contentful Paint
    FCP: 1800,   // First Contentful Paint
    TTFB: 600    // Time to First Byte
  };

  if (delta > poorThresholds[name]) {
    captureMessage(`Poor ${name} value: ${delta}`, 'warning');
  }
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  getCLS(vitalsCallback);
  getFID(vitalsCallback);
  getLCP(vitalsCallback);
  getFCP(vitalsCallback);
  getTTFB(vitalsCallback);
};

// Custom performance marks
export const performanceMark = {
  start: (markName) => {
    if (performance && performance.mark) {
      performance.mark(`${markName}-start`);
    }
  },

  end: (markName, shouldLog = false) => {
    if (performance && performance.mark && performance.measure) {
      performance.mark(`${markName}-end`);
      performance.measure(markName, `${markName}-start`, `${markName}-end`);

      if (shouldLog) {
        const entries = performance.getEntriesByName(markName);
        const duration = entries[0].duration;

        if (process.env.NODE_ENV === 'development') {
          console.log(`${markName} duration:`, duration);
        }

        // Report to analytics if duration is too long
        if (duration > 1000) { // 1 second threshold
          captureMessage(`Slow ${markName}: ${duration}ms`, 'warning');
        }
      }
    }
  }
};

// Resource timing
export const analyzeResourceTiming = () => {
  if (performance && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);

    if (slowResources.length > 0) {
      slowResources.forEach(resource => {
        captureMessage(`Slow resource load: ${resource.name} (${Math.round(resource.duration)}ms)`, 'warning');
      });
    }
  }
};

// Memory usage monitoring (Chrome only)
export const monitorMemoryUsage = () => {
  if (performance && performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
    const usageRatio = usedJSHeapSize / totalJSHeapSize;

    if (usageRatio > 0.9) { // 90% threshold
      captureMessage(`High memory usage: ${Math.round(usageRatio * 100)}%`, 'warning');
    }
  }
};

// Network request timing
export const measureNetworkRequest = async (url, options = {}) => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log slow requests
    if (duration > 1000) {
      captureMessage(`Slow network request to ${url}: ${Math.round(duration)}ms`, 'warning');
    }

    return response;
  } catch (error) {
    const endTime = performance.now();
    captureMessage(`Failed network request to ${url} after ${Math.round(endTime - startTime)}ms`, 'error');
    throw error;
  }
};

// React component performance HOC
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return class extends React.Component {
    componentDidMount() {
      performanceMark.end(`${componentName}-mount`);
    }

    componentWillUnmount() {
      performanceMark.start(`${componentName}-unmount`);
    }

    render() {
      performanceMark.start(`${componentName}-mount`);
      return <WrappedComponent {...this.props} />;
    }
  };
};
