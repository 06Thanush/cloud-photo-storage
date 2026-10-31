import { supabase } from './supabaseClient';

// Resize an image file client-side using Canvas -> returns a Blob (JPEG, max 800px edge)
function makeThumbnail(file, maxEdge = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxEdge) {
          height = Math.round((height * maxEdge) / width);
          width = maxEdge;
        } else if (height > maxEdge) {
          width = Math.round((width * maxEdge) / height);
          height = maxEdge;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadPhoto(file, caption = '') {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user.id;

  const fileName = `${Date.now()}-${file.name}`;
  const path = `${userId}/${fileName}`;

  // 1. Upload original (private bucket)
  const { error: origErr } = await supabase.storage.from('originals').upload(path, file, {
    contentType: file.type,
  });
  if (origErr) throw origErr;

  // 2. Generate + upload thumbnail (public bucket) — done in the browser, no server needed
  const thumbBlob = await makeThumbnail(file);
  const { error: thumbErr } = await supabase.storage
    .from('thumbnails')
    .upload(path, thumbBlob, { contentType: 'image/jpeg' });
  if (thumbErr) throw thumbErr;

  // 3. Write metadata row
  const { error: dbErr } = await supabase.from('photos').insert({
    user_id: userId,
    path,
    caption,
    size: file.size,
  });
  if (dbErr) throw dbErr;

  return path;
}

export async function listPhotos(sortBy = 'uploaded_at') {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order(sortBy, { ascending: false });
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    path: row.path,
    caption: row.caption,
    size: row.size,
    uploadedAt: row.uploaded_at,
    thumbUrl: supabase.storage.from('thumbnails').getPublicUrl(row.path).data.publicUrl,
  }));
}

export async function deletePhoto(id, path) {
  await supabase.storage.from('originals').remove([path]);
  await supabase.storage.from('thumbnails').remove([path]);
  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) throw error;
}
