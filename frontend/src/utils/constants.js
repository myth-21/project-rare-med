export const availabilityLabels = {
  available: 'Available',
  limited: 'Limited',
  out_of_stock: 'Out of Stock',
};

export const categories = [
  'Analgesic',
  'Antibiotic',
  'Antidiabetic',
  'Cardiology',
  'Gastroenterology',
  'Allergy',
  'Endocrine',
  'Oncology',
  'Neurology',
  'Immunology',
];

// Use VITE_API_URL from environment variables
// In development: defaults to localhost:5000/api
// In production: must be explicitly set
export const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL || (() => {
      throw new Error('VITE_API_URL environment variable is required in production');
    })();

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
