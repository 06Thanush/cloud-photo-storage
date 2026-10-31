import { useState, useEffect } from 'react';
import Login from './Login';
import Gallery from './Gallery';
import { getCurrentUser } from './auth';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setLoggedIn(!!user);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  return loggedIn ? (
    <Gallery onSignedOut={() => setLoggedIn(false)} />
  ) : (
    <Login onLoggedIn={() => setLoggedIn(true)} />
  );
}
