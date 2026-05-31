import { BellIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

const DashboardStats = ({ savedCount = 0, searchCount = 0 }) => (
  <section className="grid-4">
    {[
      ['12', 'My Reports', ClipboardDocumentListIcon],
      ['4', 'Active Alerts', BellIcon],
      [savedCount, 'Saved Medicines', SparklesIcon],
      [searchCount, 'Recent Searches', MagnifyingGlassIcon],
    ].map(([value, label, Icon]) => (
      <article className="stat-card" key={label}>
        <Icon />
        <strong>{value}</strong>
        <span>{label}</span>
      </article>
    ))}
  </section>
);

export default DashboardStats;
