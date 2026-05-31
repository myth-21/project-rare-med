import { BellIcon, ChartBarIcon, CheckCircleIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const features = [
  ['Search medicines', MagnifyingGlassIcon],
  ['Real-time availability', CheckCircleIcon],
  ['Pharmacy map', MapPinIcon],
  ['Set alerts', BellIcon],
  ['Report shortage', ExclamationTriangleIcon],
  ['Admin insights', ChartBarIcon],
];

const FeaturesSection = () => (
  <section className="section">
    <h2>Built for urgent medicine discovery</h2>
    <div className="feature-grid">
      {features.map(([title, Icon]) => (
        <article className="card feature" key={title}>
          <Icon />
          <h3>{title}</h3>
          <p>Fast, verified workflows designed for rare medicine access.</p>
        </article>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
