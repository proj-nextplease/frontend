import { Link, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <span>Next Please</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>
    </header>
  );
}
