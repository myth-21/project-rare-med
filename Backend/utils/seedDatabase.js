import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import Report from '../models/Report.js';
import Alert from '../models/Alert.js';

export const SEED_VERSION = 3;

const FALLBACK_MEDICINE = '/medicines/fallback.svg';
const FALLBACK_PHARMACY = '/pharmacies/fallback.svg';

const medicines = [
  {
    name: 'Paracetamol',
    genericName: 'Paracetamol',
    category: 'Analgesic',
    manufacturer: 'Cipla',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1584308664944-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Paracetamol is widely used for fever and mild to moderate pain relief.',
  },
  {
    name: 'Paracetamol 650mg',
    genericName: 'Paracetamol',
    category: 'Analgesic',
    manufacturer: 'Micro Labs',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1584308664944-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Higher-strength paracetamol tablets for fever and body pain.',
  },
  {
    name: 'Crocin',
    genericName: 'Paracetamol',
    category: 'Analgesic',
    manufacturer: 'GSK',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
    description: 'Crocin is a trusted paracetamol brand for fever and headache.',
  },
  {
    name: 'Dolo 650',
    genericName: 'Paracetamol',
    category: 'Analgesic',
    manufacturer: 'Micro Labs',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=600&q=80',
    description: 'Dolo 650 is commonly used for fever and pain management.',
  },
  {
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    manufacturer: 'Cipla',
    availability: 'limited',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    description: 'Macrolide antibiotic prescribed for respiratory and bacterial infections.',
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'Sun Pharma',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1631549916768-4119d9580c8a?auto=format&fit=crop&w=600&q=80',
    description: 'Penicillin-class antibiotic for bacterial infections.',
  },
  {
    name: 'Augmentin',
    genericName: 'Amoxicillin + Clavulanate',
    category: 'Antibiotic',
    manufacturer: 'GSK',
    availability: 'limited',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    description: 'Combination antibiotic for resistant bacterial infections.',
  },
  {
    name: 'Metformin',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    manufacturer: 'USV',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b42d80?auto=format&fit=crop&w=600&q=80',
    description: 'First-line oral medicine for type 2 diabetes management.',
  },
  {
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    category: 'Antidiabetic',
    manufacturer: 'Sanofi',
    availability: 'limited',
    image: 'https://images.unsplash.com/photo-1583912086096-0586c9717979?auto=format&fit=crop&w=600&q=80',
    description: 'Long-acting insulin for blood glucose control.',
  },
  {
    name: 'Pantoprazole',
    genericName: 'Pantoprazole',
    category: 'Gastroenterology',
    manufacturer: 'Sun Pharma',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1585435557343-3b5930311d45?auto=format&fit=crop&w=600&q=80',
    description: 'Proton pump inhibitor for acidity and GERD.',
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine',
    category: 'Allergy',
    manufacturer: 'UCB',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=600&q=80',
    description: 'Antihistamine for allergies and hay fever.',
  },
  {
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    category: 'Cardiology',
    manufacturer: 'Pfizer',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=600&q=80',
    description: 'Statin medicine to lower cholesterol levels.',
  },
  {
    name: 'Amlodipine',
    genericName: 'Amlodipine',
    category: 'Cardiology',
    manufacturer: 'Cipla',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1584308664944-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Calcium channel blocker for hypertension.',
  },
  {
    name: 'Losartan',
    genericName: 'Losartan',
    category: 'Cardiology',
    manufacturer: 'Torrent',
    availability: 'available',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
    description: 'ARB medicine for blood pressure management.',
  },
];

const pharmacies = [
  {
    name: 'Apollo Pharmacy',
    address: 'Road No. 12, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    location: { latitude: 17.4126, longitude: 78.4482 },
    phone: '040-2335-4242',
    image: 'https://images.unsplash.com/photo-1576602976047-174e1f8d0b0e?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1584308664944-24d5c474f2ae?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'MedPlus',
    address: 'Madhapur Main Road, HITEC City',
    city: 'Hyderabad',
    state: 'Telangana',
    location: { latitude: 17.4485, longitude: 78.3900 },
    phone: '040-4012-3456',
    image: 'https://images.unsplash.com/photo-1631549916768-4119d9580c8a?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1631549916768-4119d9580c8a?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Wellness Forever',
    address: 'Gachibowli DLF Cyber Towers Road',
    city: 'Hyderabad',
    state: 'Telangana',
    location: { latitude: 17.4401, longitude: 78.3489 },
    phone: '040-2311-8899',
    image: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Medicover Pharmacy',
    address: 'HITEC City, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    location: { latitude: 17.4435, longitude: 78.3772 },
    phone: '040-6831-2345',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Apollo Pharmacy',
    address: 'Plot 13, Carter Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    location: { latitude: 19.0596, longitude: 72.8295 },
    phone: '022-2640-1234',
    image: 'https://images.unsplash.com/photo-1576602976047-174e1f8d0b0e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'MedPlus',
    address: '12 MG Road, Camp',
    city: 'Pune',
    state: 'Maharashtra',
    location: { latitude: 18.5204, longitude: 73.8567 },
    phone: '020-2612-5678',
    image: 'https://images.unsplash.com/photo-1631549916768-4119d9580c8a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wellness Forever',
    address: '88 Brigade Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    location: { latitude: 12.9716, longitude: 77.5946 },
    phone: '080-2555-9012',
    image: 'https://images.unsplash.com/photo-1587854692152-cf240b12c497?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Netmeds Store',
    address: '45 Anna Salai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    location: { latitude: 13.0827, longitude: 80.2707 },
    phone: '044-2810-3344',
    image: 'https://images.unsplash.com/photo-1576602976047-174e1f8d0b0e?auto=format&fit=crop&w=800&q=80',
  },
];

const linkMedicinesToPharmacies = (medicineDocs, pharmacyCount) =>
  Array.from({ length: pharmacyCount }, (_, index) => {
    const ids = [];
    for (let i = 0; i < Math.min(12, medicineDocs.length); i += 1) {
      ids.push(medicineDocs[(index + i) % medicineDocs.length]._id);
    }
    return ids;
  });

export async function seedDatabase({ clear = false, force = false } = {}) {
  if (clear) {
    await Promise.all([
      User.deleteMany({}),
      Medicine.deleteMany({}),
      Pharmacy.deleteMany({}),
      Report.deleteMany({}),
      Alert.deleteMany({}),
    ]);
  }

  const existingMeds = await Medicine.countDocuments();
  const existingPharms = await Pharmacy.countDocuments();
  const samplePharmacy = await Pharmacy.findOne().select('logo name').lean();

  const needsUpgrade =
    force ||
    existingPharms < 8 ||
    !samplePharmacy?.logo ||
    (samplePharmacy?.name === '1mg Pharmacy Hub' && existingPharms < 10);

  if (!clear && !needsUpgrade && existingMeds > 0 && existingPharms > 0) {
    return { skipped: true, medicines: existingMeds, pharmacies: existingPharms, version: SEED_VERSION };
  }

  if (!clear) {
    await Promise.all([Medicine.deleteMany({}), Pharmacy.deleteMany({}), Report.deleteMany({}), Alert.deleteMany({})]);
  }

  let user = await User.findOne({ email: 'user@raremed.com' });
  let owner = await User.findOne({ email: 'owner@raremed.com' });

  if (!user || !owner) {
    const created = await User.create([
      {
        name: 'Demo User',
        email: 'user@raremed.com',
        password: 'User@123',
        phoneNumber: '9000000002',
        city: 'Hyderabad',
        state: 'Telangana',
        isActive: true,
      },
      {
        name: 'Pharmacy Owner',
        email: 'owner@raremed.com',
        password: 'Owner@123',
        phoneNumber: '9000000003',
        city: 'Pune',
        state: 'Maharashtra',
        isActive: true,
      },
    ]);
    user = user || created[0];
    owner = owner || created[1];
  }

  const medicineDocs = await Medicine.create(
    medicines.map((m) => ({
      ...m,
      image: m.image || FALLBACK_MEDICINE,
    }))
  );

  const medicineLinks = linkMedicinesToPharmacies(medicineDocs, pharmacies.length);

  const pharmacyDocs = await Pharmacy.create(
    pharmacies.map((p, index) => ({
      ...p,
      ownerUser: owner._id,
      email: `store+${index}@raremed.local`,
      openHours: index % 2 === 0 ? '8:00 AM - 11:00 PM' : '24 hours',
      isVerified: true,
      rating: 4.3 + (index % 4) * 0.1,
      image: p.image || FALLBACK_PHARMACY,
      logo: p.logo || p.image || FALLBACK_PHARMACY,
      availableMedicines: medicineLinks[index] || medicineDocs.slice(0, 8).map((m) => m._id),
    }))
  );

  for (const medicine of medicineDocs) {
    const stockists = pharmacyDocs
      .filter((pharmacy) => pharmacy.availableMedicines.some((id) => id.equals(medicine._id)))
      .map((p) => p._id);
    medicine.pharmacies = stockists.length ? stockists : pharmacyDocs.slice(0, 3).map((p) => p._id);
    await medicine.save();
  }

  for (const pharmacy of pharmacyDocs) {
    const linked = medicineDocs.filter((m) => m.pharmacies.some((id) => id.equals(pharmacy._id))).map((m) => m._id);
    pharmacy.availableMedicines = linked.length ? linked : medicineDocs.slice(0, 8).map((m) => m._id);
    await pharmacy.save();
  }

  if ((await Report.countDocuments()) === 0) {
    const hyd = pharmacyDocs.find((p) => p.city === 'Hyderabad');
    await Report.create({
      reportedBy: user._id,
      medicine: medicineDocs[0]._id,
      pharmacy: hyd?._id || pharmacyDocs[0]._id,
      medicineName: medicineDocs[0].name,
      pharmacyName: hyd?.name || pharmacyDocs[0].name,
      location: 'Hyderabad',
      notes: 'Paracetamol and Dolo 650 confirmed in stock.',
      description: 'Verified availability at counter.',
      availabilityStatus: 'available',
      status: 'verified',
    });
  }

  return {
    skipped: false,
    version: SEED_VERSION,
    medicines: medicineDocs.length,
    pharmacies: pharmacyDocs.length,
    users: await User.countDocuments(),
    reports: await Report.countDocuments(),
  };
}
