import { useEffect, useRef, useState } from 'react';
import { uploadPhoto, listPhotos, deletePhoto } from './api';
import { signOut } from './auth';

export default function Gallery({ onSignedOut }) {
  const [photos, setPhotos] = useState([]);
  const [sortBy, setSortBy] = useState('uploaded_at');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function refresh(sort = sortBy) {
    try {
      const data = await listPhotos(sort);
      setPhotos(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadPhoto(file);
      await refresh(); // thumbnail is generated client-side, so it's ready immediately
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleDelete(id, path) {
    try {
      await deletePhoto(id, path);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSortChange(e) {
    const val = e.target.value;
    setSortBy(val);
    refresh(val);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>☁️ Cloud Photo Gallery</h1>
        <button
          style={styles.signOutBtn}
          onClick={() => {
            signOut();
            onSignedOut();
          }}
        >
          Sign out
        </button>
      </header>

      <div style={styles.toolbar}>
        <label style={styles.uploadBtn}>
          {uploading ? 'Uploading…' : '+ Upload photo'}
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>

        <select value={sortBy} onChange={handleSortChange} style={styles.select}>
          <option value="uploaded_at">Newest first</option>
          <option value="size">Largest first</option>
        </select>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {photos.length === 0 && !uploading && (
        <p style={{ color: '#666' }}>No photos yet — upload your first one!</p>
      )}

      <div style={styles.grid}>
        {photos.map((p) => (
          <div key={p.id} style={styles.card}>
            <img src={p.thumbUrl} alt={p.caption || 'photo'} style={styles.img} />
            <div style={styles.cardFooter}>
              <span style={{ fontSize: 12, color: '#666' }}>
                {(p.size / 1024).toFixed(0)} KB
              </span>
              <button style={styles.deleteBtn} onClick={() => handleDelete(p.id, p.path)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  signOutBtn: { padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', background: 'white', cursor: 'pointer' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20 },
  uploadBtn: {
    padding: '10px 16px',
    borderRadius: 6,
    background: '#2563eb',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },
  select: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  card: { border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fafafa' },
  img: { width: '100%', height: 160, objectFit: 'cover', display: 'block', background: '#ddd' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  deleteBtn: { fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' },
};
