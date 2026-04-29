import { useState } from 'react';

export default function PasswordGate({ onAuth }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        onAuth(token);
      } else {
        setError('Incorrect password.');
      }
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#F3F4F6',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        width: '340px',
      }}>
        <img
          src="/logo-horizontal.png"
          alt="IKE Smart City"
          style={{ width: '200px', marginBottom: '28px', display: 'block' }}
        />
        <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          ATL Site Reviewer
        </h1>
        <p style={{ margin: '0 0 28px', color: '#6B7280', fontSize: '14px' }}>
          Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              marginBottom: error ? '8px' : '12px',
              outline: 'none',
            }}
          />
          {error && (
            <p style={{ color: '#EF4444', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '10px',
              background: loading || !password ? '#9CA3AF' : '#1D4ED8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
