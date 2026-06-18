const panelStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 24,
  background: '#fafafa',
  color: '#6b7280',
  fontSize: 14,
};

export default function SentPage() {
  return (
    <div style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 20 }}>Sent</h1>
      <div style={panelStyle}>Sent mail view coming soon.</div>
    </div>
  );
}
