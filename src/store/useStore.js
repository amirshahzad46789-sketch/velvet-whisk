import { create } from 'zustand';
import { products as initialProducts, reviews as initialReviews } from '../data/mockData';
import { idbSaveImage, idbDeleteImage } from '../utils/imageDB';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

// ── helpers ───────────────────────────────────────────────────────────────────
const isBase64   = (s) => typeof s === 'string' && s.startsWith('data:');
const isLocalRef = (s) => typeof s === 'string' && s.startsWith('__local__');
const refId      = (s) => s.replace('__local__', '');

/**
 * Resolve the real display URL for a product.
 * Pass `localImages` from the store state.
 *   resolveImage(product, localImages)
 */
export const resolveImage = (product, localImages = {}) => {
  if (!product?.image) return '';
  if (isLocalRef(product.image)) {
    return localImages[refId(product.image)] || '';
  }
  return product.image;
};

// ── store ─────────────────────────────────────────────────────────────────────
const useStore = create((set) => ({

  cart:        [],
  isCartOpen:  false,
  theme:       localStorage.getItem('bakery-theme') || 'dark-gold',
  localImages: {},   // { productId: base64String }  — loaded from IndexedDB on boot

  // Kitchen Status
  kitchenStatus: 'auto',  // 'auto' | 'mixing' | 'baking' | 'decorating'

  products: initialProducts,
  reviews:  initialReviews,
  orders: [],

  initFromAPI: async () => {
    // 1. Try Firebase if configured
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "bakery", "data");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          set({
            products: data.products && data.products.length > 0 ? data.products : initialProducts,
            reviews: data.reviews && data.reviews.length > 0 ? data.reviews : initialReviews,
            orders: data.orders || [],
            kitchenStatus: data.kitchenStatus || 'auto',
            localImages: data.localImages || {} 
          });
          console.log('✅ Loaded data from Firebase');
          return;
        }
      } catch (e) {
        console.warn('Firebase load failed, falling back to local API', e);
      }
    }

    // 2. Fallback to Local Dev API
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        set({
          products: data.products && data.products.length > 0 ? data.products : initialProducts,
          reviews: data.reviews && data.reviews.length > 0 ? data.reviews : initialReviews,
          orders: data.orders || [],
          kitchenStatus: data.kitchenStatus || 'auto',
          localImages: data.localImages || {} 
        });
        console.log('📂 Loaded data from Local API');
      }
    } catch (e) {
      console.error('Failed to load from local DB', e);
    }
  },

  syncToFirebase: async () => {
    if (!isFirebaseConfigured) return;
    const { products, reviews, orders, kitchenStatus } = useStore.getState();
    try {
      await setDoc(doc(db, "bakery", "data"), {
        products, reviews, orders, kitchenStatus,
        lastUpdated: new Date().toISOString()
      });
      console.log('☁️ Synced to Firebase');
    } catch (e) {
      console.error('Firebase sync failed', e);
    }
  },

  // Called once from App.jsx after IndexedDB loads all images
  setLocalImages: (images) => set({ localImages: images }),

  // ── kitchen status ────────────────────────────────────────────────────────
  setKitchenStatus: (status) => set({ kitchenStatus: status }),

  // ── theme ─────────────────────────────────────────────────────────────────
  setTheme: (theme) => {
    localStorage.setItem('bakery-theme', theme);
    document.body.setAttribute('data-theme', theme);
    set({ theme });
  },

  // ── cart ──────────────────────────────────────────────────────────────────
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

  addToCart: (product, quantity = 1, options = {}) => set((s) => {
    const idx = s.cart.findIndex(
      (i) => i.id === product.id && JSON.stringify(i.options) === JSON.stringify(options)
    );
    if (idx >= 0) {
      const c = [...s.cart]; c[idx].quantity += quantity; return { cart: c };
    }
    return { cart: [...s.cart, { ...product, quantity, options }] };
  }),

  removeFromCart: (index) => set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),

  updateQuantity: (index, amount) => set((s) => {
    const c = [...s.cart]; c[index].quantity += amount;
    if (c[index].quantity <= 0) return { cart: s.cart.filter((_, i) => i !== index) };
    return { cart: c };
  }),

  clearCart: () => set({ cart: [] }),

  // ── products (admin) ──────────────────────────────────────────────────────
  addProduct: (product) => set((s) => {
    const id = Date.now();
    const newProducts = [...s.products, { ...product, id, isHidden: false }];
    return { products: newProducts };
  }),

  updateProduct: (id, updatedProduct) => set((s) => {
    const newProducts = s.products.map(p =>
      p.id === id ? { ...p, ...updatedProduct } : p
    );
    return { products: newProducts };
  }),

  deleteProduct: (id) => set((s) => {
    const newProducts = s.products.filter(p => p.id !== id);
    return { products: newProducts };
  }),

  toggleProductVisibility: (id) => set((s) => {
    const newProducts = s.products.map(p =>
      p.id === id ? { ...p, isHidden: !p.isHidden } : p
    );
    return { products: newProducts };
  }),

  // ── reviews ───────────────────────────────────────────────────────────────
  addReview: (review) => set((state) => {
    const newReviews = [review, ...state.reviews];
    return { reviews: newReviews };
  }),
  updateReview: (id, data) => set((state) => {
    const newReviews = state.reviews.map(r => r.id === id ? { ...r, ...data } : r);
    return { reviews: newReviews };
  }),
  deleteReview: (id) => set((state) => {
    const r = state.reviews.filter(r => r.id !== id);
    return { reviews: r };
  }),

  // ── orders ────────────────────────────────────────────────────────────────
  addOrder: (order) => set((s) => {
    const newOrders = [order, ...s.orders];
    return { orders: newOrders };
  }),
  deleteOrder: (id) => set((s) => {
    const newOrders = s.orders.filter(o => o.id !== id);
    return { orders: newOrders };
  }),
  updateOrderStatus: (id, status) => set((s) => {
    const newOrders = s.orders.map(o => o.id === id ? { ...o, status } : o);
    return { orders: newOrders };
  }),
}));

export default useStore;
