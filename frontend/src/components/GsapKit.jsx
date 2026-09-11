import { Link } from 'react-router-dom';

/**
 * Curly-bracket annotation — the system's recurring section eyebrow.
 * e.g. <Bracket>Pernikahan Adat Minangkabau</Bracket> renders "{ Pernikahan Adat Minangkabau }"
 */
export function Bracket({ children, className = '', color = 'text-cream' }) {
  return (
    <p className={`text-[16px] md:text-[19px] font-normal tracking-tight ${color} ${className}`}>
      {'{ '}{children}{' }'}
    </p>
  );
}

/**
 * 1px hairline divider spanning the available width — the system's
 * only separator device, used full-bleed between sections/blocks.
 */
export function Hairline({ className = '' }) {
  return <div className={`w-full h-px bg-hairline ${className}`} />;
}

/**
 * Outlined ghost pill — the default interactive control.
 * Renders as a <Link> when `to` is provided, otherwise a <button>.
 */
export function GhostPill({ to, onClick, children, className = '', type = 'button', disabled }) {
  const classes = `ghost-pill inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-semibold tracking-tight disabled:opacity-40 disabled:cursor-not-allowed ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/**
 * Gradient-stroked pill — the single chromatic escalation allowed in
 * this system. Reserved for the primary call to action on a page.
 */
export function GradientPill({ to, onClick, children, className = '', type = 'button', disabled }) {
  const classes = `gradient-pill inline-flex items-center justify-center gap-2 px-6 py-3 text-sm md:text-base font-semibold tracking-tight text-maroon disabled:opacity-40 disabled:cursor-not-allowed ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/**
 * Single-word category-style label rendered in the accent color —
 * kept for spots that previously used a Minangkabau ornament as a
 * decorative flourish. Uses the system's green accent only.
 */
export function AccentLabel({ children, className = '' }) {
  return (
    <span className={`text-accent font-semibold ${className}`}>{children}</span>
  );
}
