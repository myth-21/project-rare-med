import { API_ORIGIN } from './constants';

const medicineFallbacks = [
  {
    match: /paracetamol/i,
    url: 'https://images.unsplash.com/photo-1584308664944-24d5c474f2ae?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /crocin/i,
    url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /dolo/i,
    url: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /metformin|diabet/i,
    url: 'https://images.unsplash.com/photo-1550572017-edd951b42d80?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /insulin|glargine/i,
    url: 'https://images.unsplash.com/photo-1583912086096-0586c9717979?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /amoxicillin|augmentin/i,
    url: 'https://images.unsplash.com/photo-1631549916768-4119d9580c8a?auto=format&fit=crop&w=700&q=85',
  },
  {
    match: /azithro|antibiotic/i,
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=85',
  },
];

const pharmacyFallbacks = [
  {
    match: /apollo/i,
    url: 'https://images.unsplash.com/photo-1576602976047-174e1f8d0b0e?auto=format&fit=crop&w=900&q=85',
  },
  {
    match: /medplus|medicover|netmeds|wellness/i,
    url: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=900&q=85',
  },
];

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

export const medicineImage = (medicine) => {
  const src = resolveMediaUrl(medicine?.image);
  if (src) return src;
  const label = `${medicine?.name || ''} ${medicine?.genericName || ''} ${medicine?.category || ''}`;
  return medicineFallbacks.find((item) => item.match.test(label))?.url || '/medicines/fallback.png';
};

export const pharmacyImage = (pharmacy) => {
  const src = resolveMediaUrl(pharmacy?.image);
  if (src) return src;
  const label = `${pharmacy?.name || ''} ${pharmacy?.city || ''}`;
  return pharmacyFallbacks.find((item) => item.match.test(label))?.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85';
};

export default resolveMediaUrl;
