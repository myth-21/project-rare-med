const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};

export const medicineImage = (medicine) => {
  const src = resolveMediaUrl(medicine?.image);
  return src || '/medicines/fallback.svg';
};

export const pharmacyImage = (pharmacy) => {
  const src = resolveMediaUrl(pharmacy?.image);
  return src || '/pharmacies/fallback.svg';
};

export default resolveMediaUrl;
