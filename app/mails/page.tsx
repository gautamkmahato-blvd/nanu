'use client';

import { useState } from 'react';

const boxStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

export default function MessagePage() {
  const [listTimeMs, setListTimeMs] = useState<number | null>(null);
  const [fullDataTimeMs, setFullDataTimeMs] = useState<number | null>(null);
  const [messages, setMessages] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGetAllMessages() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mails');
      const data = await response.json();
      setListTimeMs(data.listTimeMs);
      setFullDataTimeMs(data.fullDataTimeMs);
      setMessages(data.messages ?? []);
      setError(data.error ?? '');
    } catch (err) {
      setListTimeMs(null);
      setFullDataTimeMs(null);
      setMessages([]);
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <button type="button" onClick={handleGetAllMessages} disabled={loading}>
        {loading ? 'Loading...' : 'Get all messages'}
      </button>

      {listTimeMs !== null ? (
        <div style={{ ...boxStyle, marginTop: 16 }}>
          <p style={{ margin: 0 }}>List response time: {listTimeMs}ms</p>
        </div>
      ) : null}

      {fullDataTimeMs !== null ? (
        <div style={boxStyle}>
          <p style={{ margin: 0 }}>Full data response time: {fullDataTimeMs}ms</p>
        </div>
      ) : null}

      {error ? (
        <div style={{ ...boxStyle, borderColor: '#f87171' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      ) : null}

      {messages.map((message, index) => (
        <div key={index} style={boxStyle}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Message {index + 1}</p>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
            <p className='border p-3'>{JSON.stringify(message, null, 2)}</p>
          </pre>
        </div>
      ))}
    </div>
  );
}
