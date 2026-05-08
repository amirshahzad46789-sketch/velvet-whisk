import React, { useState } from 'react';
import useStore from '../store/useStore';
import { resolveImage } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Lock, LogOut, Package, MessageSquare, Save, X, Edit3, Upload, Star } from 'lucide-react';
import { categories } from '../data/mockData';
import { idbLoadAll } from '../utils/imageDB';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
const Admin = () => {
  const { 
    products, reviews, orders,
    addProduct, updateProduct, deleteProduct, toggleProductVisibility, 
    addReview, updateReview, deleteReview, 
    deleteOrder, updateOrderStatus,
    localImages, kitchenStatus, setKitchenStatus 
  } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  
  // Form States
  const [productForm, setProductForm] = useState({
    name: '', urduName: '', price: '', category: 'cakes', image: '', description: '', urduDescription: '', badges: [], sizes: [], addons: []
  });
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '', urduText: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'rima@123') setIsLoggedIn(true);
    else alert('Incorrect Password!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      // Compress: max 400x400, quality 0.72
      const MAX = 400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.72);
      URL.revokeObjectURL(objectUrl);
      
      // 1. Try Firebase Upload First
      if (isFirebaseConfigured) {
        try {
          const storageRef = ref(storage, `uploads/img_${Date.now()}.jpg`);
          const blob = await (await fetch(compressed)).blob();
          const snapshot = await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(snapshot.ref);
          setProductForm(prev => ({ ...prev, image: downloadURL }));
          console.log('✅ Image uploaded to Firebase Storage');
          return;
        } catch (err) {
          console.warn('Firebase Storage upload failed', err);
        }
      }

      // 2. Fallback to Local API
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: compressed, id: Date.now() })
        });
        if (res.ok) {
          const data = await res.json();
          setProductForm(prev => ({ ...prev, image: data.path }));
          console.log('📂 Image uploaded to Local Server');
        } else {
          alert('Failed to upload image');
        }
      } catch (err) {
        console.error('Upload error', err);
        alert('Failed to upload image');
      }
    };
    img.src = objectUrl;
  };

  const onSaveProduct = (e) => {
    e.preventDefault();
    const data = { 
      ...productForm, 
      price: Number(productForm.price),
      sizes: productForm.sizes && productForm.sizes.length > 0 ? productForm.sizes : [{ size: 'Default', price: 0 }],
      addons: productForm.addons || []
    };
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, data);
      } else {
        addProduct(data);
      }
      closeProductModal();
    } catch (err) {
      alert('⚠️ Save failed: Storage is full. Try using an Image URL instead of uploading a file.');
      console.error('Save error:', err);
    }
  };

  const onSaveReview = (e) => {
    e.preventDefault();
    if (editingReview) {
      updateReview(editingReview.id, reviewForm);
    } else {
      addReview({ ...reviewForm, id: Date.now() });
    }
    closeReviewModal();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    // Resolve any __local__ image reference back to its actual base64 before showing in form
    const resolvedImage = resolveImage(product, localImages);
    setProductForm({ ...product, image: resolvedImage });
    setIsProductModalOpen(true);
  };

  const openEditReviewModal = (review) => {
    setEditingReview(review);
    setReviewForm({ name: review.name, rating: review.rating, text: review.text, urduText: review.urduText || '' });
    setIsReviewModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: '', urduName: '', price: '', category: 'cakes', image: '', description: '', urduDescription: '', badges: [], sizes: [], addons: []
    });
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setEditingReview(null);
    setReviewForm({ name: '', rating: 5, text: '', urduText: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', padding: '0.5rem', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
            title="Close Admin Panel"
          >
            <X size={20} />
          </button>
          <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock color="black" size={30} />
          </div>
          <h2 className="title-medium text-gold" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Admin Login</h2>
          <p className="urdu-text" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>ایڈمن لاگ ان</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }} />
            <button className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn-icon"
                style={{ background: 'rgba(239, 35, 60, 0.1)', border: '1px solid rgba(239, 35, 60, 0.3)', color: '#ef233c', borderRadius: '50%', padding: '0.5rem' }}
                title="Close Admin Panel"
              >
                <X size={24} />
              </button>
              <h1 className="title-medium text-gold" style={{ margin: 0 }}>Admin Dashboard</h1>
            </div>
            <p className="urdu-text" style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: '0 0 0 3.5rem' }}>ایڈمن کنٹرول پینل</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeTab === 'products' ? (
              <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary"><Plus size={20} /> Add Item</button>
            ) : (
              <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary"><Plus size={20} /> Add Review</button>
            )}
            <button onClick={() => setIsLoggedIn(false)} className="btn btn-outline"><LogOut size={20} /> Logout</button>
          </div>
        </div>

        {/* Kitchen Status Control (New) */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 className="text-gold" style={{ fontSize: '1.2rem' }}>Kitchen Status Control</h3>
            <p className="urdu-text" style={{ fontSize: '1.1rem', color: 'var(--primary)', marginTop: '-5px' }}>کچن سٹیٹس کنٹرول</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'auto', label: 'Auto Rotate', urdu: 'خودکار' },
              { id: 'mixing', label: 'Mixing', urdu: 'مکسنگ' },
              { id: 'baking', label: 'Baking', urdu: 'بیکنگ' },
              { id: 'decorating', label: 'Decorating', urdu: 'ڈیکوریشن' }
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => setKitchenStatus(s.id)}
                className={kitchenStatus === s.id ? "btn btn-primary" : "btn btn-outline"}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <span>{s.label}</span>
                <span className="urdu-text" style={{ fontSize: '0.9rem' }}>{s.urdu}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', color: activeTab === 'products' ? 'var(--primary)' : 'white', padding: '1rem 0', fontSize: '1.1rem', cursor: 'pointer', borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : 'none' }}>
            Products ({products.length})
          </button>
          <button onClick={() => setActiveTab('reviews')} style={{ background: 'none', border: 'none', color: activeTab === 'reviews' ? 'var(--primary)' : 'white', padding: '1rem 0', fontSize: '1.1rem', cursor: 'pointer', borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : 'none' }}>
            Reviews ({reviews.length})
          </button>
          <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? 'var(--primary)' : 'white', padding: '1rem 0', fontSize: '1.1rem', cursor: 'pointer', borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none' }}>
            Orders ({orders.length})
          </button>
        </div>

        {/* Orders Table (New) */}
        {activeTab === 'orders' && (
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.5rem' }}>Order Date</th>
                  <th style={{ padding: '1.5rem' }}>Customer</th>
                  <th style={{ padding: '1.5rem' }}>Items</th>
                  <th style={{ padding: '1.5rem' }}>Total</th>
                  <th style={{ padding: '1.5rem' }}>Status</th>
                  <th style={{ padding: '1.5rem' }}>Quick Reply</th>
                  <th style={{ padding: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>No orders yet.</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: order.status === 'delivered' ? 0.6 : 1 }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>{new Date(order.date).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(order.date).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{order.customerPhone || 'No Phone'}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{order.customerAddress || 'No Address'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.85rem' }}>
                          {order.items.map(item => (
                            <div key={item.id}>{item.name} (x{item.quantity})</div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Rs. {order.total}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: order.status === 'delivered' ? 'rgba(76,175,80,0.2)' : 'rgba(255,193,7,0.2)',
                          color: order.status === 'delivered' ? '#4CAF50' : '#FFC107'
                        }}>
                          {order.status === 'delivered' ? 'DELIVERED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '150px' }}>
                          {[
                            { label: '1h', msg: 'Your order will be delivered in 1 hour. Thanks! \u{1F9C1}' },
                            { label: '2h', msg: 'Your order will be delivered in 2 hours. Thanks! \u{1F9C1}' },
                            { label: '3h', msg: 'Your order will be delivered in 3 hours. Thanks! \u{1F9C1}' },
                            { label: 'Bye', msg: 'Your order is on the way! Thank you for choosing Velvet Whisk. Regards! \u{1F64F}\u{2728}' }
                          ].map(btn => (
                            <button 
                              key={btn.label}
                              onClick={() => {
                                if (!order.customerPhone) return alert('No phone number available!');
                                const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
                                const waPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
                                window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(btn.msg)}`, '_blank');
                              }}
                              className="btn-icon" 
                              style={{ fontSize: '0.65rem', padding: '4px 8px', width: 'auto', height: 'auto' }}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {order.status !== 'delivered' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'delivered')} 
                              className="btn-icon" 
                              style={{ color: '#4CAF50' }} 
                              title="Mark as Delivered"
                            >
                              <Save size={18} />
                            </button>
                          )}
                          <button onClick={() => deleteOrder(order.id)} className="btn-icon text-red" title="Delete Order"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Products Table */}
        {activeTab === 'products' && (
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.5rem' }}>Item</th>
                  <th style={{ padding: '1.5rem' }}>Category</th>
                  <th style={{ padding: '1.5rem' }}>Price</th>
                  <th style={{ padding: '1.5rem' }}>Status</th>
                  <th style={{ padding: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: p.isHidden ? 0.5 : 1 }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={resolveImage(p, localImages)} alt="" style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="urdu-text" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.urduName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>Rs. {p.price}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{p.isHidden ? '❌ Hidden' : '✅ Visible'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditModal(p)} className="btn-icon" title="Edit"><Edit3 size={18} /></button>
                        <button onClick={() => toggleProductVisibility(p.id)} className="btn-icon" title={p.isHidden ? "Show" : "Hide"}>
                          {p.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="btn-icon text-red" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews Grid */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {reviews.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditReviewModal(r)} className="btn-icon" title="Edit"><Edit3 size={18} /></button>
                  <button onClick={() => deleteReview(r.id)} className="btn-icon text-red" title="Delete"><Trash2 size={18} /></button>
                </div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{r.name}</h4>
                <div style={{ color: '#FFD700', marginBottom: '1rem', display: 'flex' }}>{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < r.rating ? "#FFD700" : "none"} />)}</div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>"{r.text}"</p>
                <p className="urdu-text" style={{ fontSize: '1rem', opacity: 0.8 }}>"{r.urduText}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Backup & Reset Section */}
        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <h3 className="text-gold" style={{ marginBottom: '1rem' }}>
            System Management / <span className="urdu-text">سسٹم مینجمنٹ</span>
          </h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                const data = {
                  products: useStore.getState().products,
                  reviews: useStore.getState().reviews,
                  orders: useStore.getState().orders,
                  localImages: useStore.getState().localImages
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bakery-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                alert('Backup file downloaded! Please send this file to me (the AI) if you want to make these changes permanent in the code.');
              }}
              className="btn btn-outline"
              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
            >
              <Save size={18} /> Export Permanent Backup
            </button>

            <button 
              onClick={() => {
                if (confirm('Are you sure? This will reset all your custom changes and load the latest images from the code.')) {
                  fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: [], reviews: [], orders: [], kitchenStatus: 'auto' })
                  }).then(() => window.location.reload());
                }
              }}
              className="btn btn-outline"
              style={{ borderColor: '#ef233c', color: '#ef233c' }}
            >
              Reset to Factory Defaults
            </button>

            <button 
              onClick={async () => {
                if (confirm('Attempt to recover data from browser memory?')) {
                  try {
                    const localProducts = JSON.parse(localStorage.getItem('bakery-products')) || [];
                    const localReviews = JSON.parse(localStorage.getItem('bakery-reviews')) || [];
                    const localOrders = JSON.parse(localStorage.getItem('bakery-orders')) || [];
                    const kitchenStat = localStorage.getItem('bakery-kitchen-status') || 'auto';
                    const localImgs = await idbLoadAll();
                    
                    alert('Recovering data... Please wait.');
                    const res = await fetch('/api/data', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        products: localProducts,
                        reviews: localReviews,
                        orders: localOrders,
                        kitchenStatus: kitchenStat,
                        localImages: localImgs
                      })
                    });
                    
                    if (res.ok) {
                      alert('Data recovered successfully! Images converted to files.');
                      window.location.reload();
                    } else {
                      alert('Failed to save recovered data.');
                    }
                  } catch (e) {
                    alert('Error recovering data.');
                    console.error(e);
                  }
                }
              }}
              className="btn btn-outline"
              style={{ borderColor: '#FF9800', color: '#FF9800' }}
            >
              <Save size={18} /> Recover Browser Data
            </button>

            <label className="btn btn-outline" style={{ borderColor: '#2196F3', color: '#2196F3', cursor: 'pointer' }}>
              <Upload size={18} /> Restore Backup
              <input 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const data = JSON.parse(event.target.result);
                      alert('Uploading and converting backup... Please wait.');
                      const res = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });
                      if (res.ok) {
                        alert('Backup restored successfully! All images have been converted to local files.');
                        window.location.reload();
                      } else {
                        alert('Failed to restore backup.');
                      }
                    } catch (err) {
                      alert('Invalid backup file.');
                      console.error(err);
                    }
                  };
                  reader.readAsText(file);
                }} 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Product Modal (Add/Edit) */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="overlay" style={{ padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: '700px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gold urdu-text">{editingProduct ? 'Edit Item / آئٹم ایڈٹ کریں' : 'Add New Item / نئی آئٹم'}</h2>
                <button onClick={closeProductModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
              </div>
              <form onSubmit={onSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                  <div style={{ width: '120px', height: '120px', margin: '0 auto 1rem', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                    {productForm.image ? <img src={productForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={30} opacity={0.3} />}
                  </div>
                  <label className="btn btn-outline" style={{ display: 'inline-flex', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} /> Upload Picture / تصویر اپ لوڈ کریں
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <input type="text" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="Or enter Image URL" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label>Name (English)</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label>Name (Urdu)</label>
                  <input type="text" required value={productForm.urduName} onChange={e => setProductForm({...productForm, urduName: e.target.value})} className="urdu-text" style={{ width: '100%' }} />
                </div>
                <div>
                  <label>Price (Rs)</label>
                  <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label>Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} style={{ width: '100%' }}>
                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="gluten-free">Gluten Free</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Description (English)</label>
                  <textarea rows="2" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} style={{ width: '100%' }}></textarea>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Description (Urdu)</label>
                  <textarea rows="2" value={productForm.urduDescription} onChange={e => setProductForm({...productForm, urduDescription: e.target.value})} className="urdu-text" style={{ width: '100%' }}></textarea>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}><Save size={20} /> Save Product / محفوظ کریں</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="overlay" style={{ padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gold urdu-text">{editingReview ? 'Edit Review / ریویو ایڈٹ کریں' : 'Add Review / ریویو شامل کریں'}</h2>
                <button onClick={closeReviewModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
              </div>
              <form onSubmit={onSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label>Customer Name</label>
                  <input type="text" required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label>Rating (1-5)</label>
                  <select value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} style={{ width: '100%' }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label>Review (English)</label>
                  <textarea required rows="2" value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} style={{ width: '100%' }}></textarea>
                </div>
                <div>
                  <label>Review (Urdu)</label>
                  <textarea required rows="2" value={reviewForm.urduText} onChange={e => setReviewForm({...reviewForm, urduText: e.target.value})} className="urdu-text" style={{ width: '100%' }}></textarea>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}><Save size={20} /> Add Review</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
