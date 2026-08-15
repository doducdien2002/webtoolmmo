export default function StatCard({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: { bg: 'var(--color-primary-light)', fg: 'var(--color-primary-dark)' },
    success: { bg: 'var(--color-success-light)', fg: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning)' },
    accent: { bg: 'var(--color-accent-light)', fg: 'var(--color-accent)' },
  };
  const t = tones[tone] || tones.primary;

  return (
    <div className="stat-card reveal">
      <div className="stat-card__icon" style={{ background: t.bg, color: t.fg }}>
        <Icon />
      </div>
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
      </div>
    </div>
  );
}