/**
 * imageDB.js
 * Stores product images in IndexedDB (no size limit, fully persistent).
 * localStorage is only used for small product metadata.
 */

const DB_NAME    = 'velvet-whisk-images';
const STORE_NAME = 'product-images';
const DB_VERSION = 1;

let _db = null;

const openDB = () => {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = (e) => reject(e.target.error);
  });
};

/** Save a base64 image under a string key */
export const idbSaveImage = async (id, base64) => {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(base64, String(id));
      tx.oncomplete = resolve;
      tx.onerror    = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    console.error('imageDB save failed:', e);
    return false;
  }
};

/** Load one image by id  — returns base64 string or null */
export const idbLoadImage = async (id) => {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE_NAME, 'readonly')
                    .objectStore(STORE_NAME)
                    .get(String(id));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/** Load ALL images — returns { id: base64, … } */
export const idbLoadAll = async () => {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const result = {};
      const req = db.transaction(STORE_NAME, 'readonly')
                    .objectStore(STORE_NAME)
                    .openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) { result[cursor.key] = cursor.value; cursor.continue(); }
        else resolve(result);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
};

/** Delete one image */
export const idbDeleteImage = async (id) => {
  try {
    const db = await openDB();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(String(id));
      tx.oncomplete = resolve;
    });
  } catch {/* ignore */}
};
