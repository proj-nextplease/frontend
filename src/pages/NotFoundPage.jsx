import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link className="text-link" to="/">Back to home</Link>
    </section>
  );
}
