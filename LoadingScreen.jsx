export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: '16px'
    }}>
      <div style={{ fontSize: '40px' }}>⚡</div>
      <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent)' }}>STARKO</div>
      <div className="spinner" style={{ width: '28px', height: '28px' }} />
    </div>
  );
}
