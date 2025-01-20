import { CLSMetric, FIDMetric, FCPMetric, LCPMetric, TTFBMetric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: any) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((vitals) => {
      vitals.onCLS(onPerfEntry);
      vitals.onFID(onPerfEntry);
      vitals.onFCP(onPerfEntry);
      vitals.onLCP(onPerfEntry);
      vitals.onTTFB(onPerfEntry);
    });
  }
};


export default reportWebVitals;
