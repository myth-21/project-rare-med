import { Link } from 'react-router-dom';

const CTASection = () => (
  <section className="cta-band">
    <h2>Can't find your medicine? Report it now</h2>
    <Link className="btn" to="/reports">Submit Report</Link>
  </section>
);

export default CTASection;
