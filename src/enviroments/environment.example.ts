declare const process: any;

export const environment = {
  production: false,
  apiBaseUrl: getApiBaseUrl()
};

function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env['JAVA_BASE_URL'] || 'http://localhost:8080/api';
  }
  return 'http://localhost:8080/api';
}