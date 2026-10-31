import { useState } from 'react';
import { signIn, signUp } from './auth';

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onLoggedIn();
      } else {
        await signUp(email, password);
        setInfo('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={{ marginTop: 0 }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}
        {info && <p style={{ color: '#16a34a', fontSize: 14 }}>{info}</p>}

        <button style={styles.button} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        <p style={{ fontSize: 14, marginTop: 12 }}>
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <a href="#" onClick={() => setMode('signup')}>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" onClick={() => setMode('signin')}>
                Sign in
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', marginTop: 80 },
  card: {
    width: 320,
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  input: { padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' },
  button: {
    padding: 10,
    borderRadius: 6,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { color: '#dc2626', fontSize: 14 },
};
