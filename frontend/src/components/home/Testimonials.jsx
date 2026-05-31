import { StarIcon } from '@heroicons/react/24/outline';

const testimonials = [
  ['Aarav P.', 'Found my son medicine in 20 minutes.'],
  ['Mira S.', 'Alerts saved us three days of calls.'],
  ['Dr. Rao', 'The shortage reports are finally actionable.'],
];

const Testimonials = () => (
  <section className="section testimonials">
    {testimonials.map(([name, text]) => (
      <article className="card" key={name}>
        <div className="stars">{Array.from({ length: 5 }).map((_, index) => <StarIcon key={index} />)}</div>
        <p>{text}</p>
        <strong>{name}</strong>
      </article>
    ))}
  </section>
);

export default Testimonials;
