import React, { useState } from 'react';
import { resolveImage } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../data/mockData';
import useStore from '../store/useStore';
import { ShoppingBag, Star, PlayCircle, X, Check, Edit3, Upload, Save } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // ── Quick-Edit state ──────────────────────────────────────────────
  const [qeProduct, setQeProduct]   = useState(null);  // product being edited
  const [qeStep, setQeStep]         = useState('pass'); // 'pass' | 'edit'
  const [qePassword, setQePassword] = useState('');
  const [qeError, setQeError]       = useState('');
  const [qeForm, setQeForm]         = useState({ image: '', price: '', name: '', urduName: '' });

  // Process Video Modal State
  const [activeProcessVideo, setActiveProcessVideo] = useState(null);

  // Gift Option State
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Kitchen Manual Edit State
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [ksPassword, setKsPassword] = useState('');
  const [ksError, setKsError] = useState('');
  const [ksStep, setKsStep] = useState('pass'); // 'pass' | 'select'

  const { products, reviews, addToCart, updateProduct, localImages, kitchenStatus, setKitchenStatus } = useStore();

  // Kitchen Status - Auto rotates every 30 minutes when set to 'auto'
  const kitchenStatuses = ['mixing', 'baking', 'decorating'];
  const getAutoStatus = () => {
    const minutesSinceMidnight = new Date().getHours() * 60 + new Date().getMinutes();
    const idx = Math.floor(minutesSinceMidnight / 30) % 3;
    return kitchenStatuses[idx];
  };
  const [autoStatus, setAutoStatus] = useState(getAutoStatus);

  React.useEffect(() => {
    if (kitchenStatus !== 'auto') return;
    const interval = setInterval(() => {
      setAutoStatus(getAutoStatus());
    }, 30 * 1000); // check every 30 seconds for smoother transitions
    return () => clearInterval(interval);
  }, [kitchenStatus]);

  // The actual displayed status
  const activeKitchenStatus = kitchenStatus === 'auto' ? autoStatus : kitchenStatus;

  // Body scroll lock
  React.useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  const activeProducts = products.filter(p => !p.isHidden);

  const filteredProducts = activeCategory === 'all' 
    ? activeProducts 
    : activeProducts.filter(p => p.category === activeCategory);

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedSizeIndex(0);
    setSelectedAddons([]);
    setIsGift(false);
    setGiftMessage('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const size = selectedProduct.sizes && selectedProduct.sizes[selectedSizeIndex] ? selectedProduct.sizes[selectedSizeIndex] : { price: 0 };
    const basePrice = (selectedProduct.price || 0) + (size.price || 0);
    const addonsTotal = (selectedAddons || []).reduce((sum, a) => sum + (a.price || 0), 0);
    
    const finalPrice = basePrice + addonsTotal + (isGift ? 150 : 0); // Adding small fee for gift wrap
    
    const options = {
      size: size.size,
      addons: selectedAddons,
      isGift,
      giftMessage: isGift ? giftMessage : ''
    };

    // Pre-resolve image → cart item always has actual base64 or URL (never __local__ ref)
    // This ensures PDF and bill generation work correctly
    const resolvedImg = resolveImage(selectedProduct, localImages) || selectedProduct.image;

    addToCart({ ...selectedProduct, price: finalPrice, image: resolvedImg }, 1, options);
    closeModal();
  };


  // ── Quick-Edit handlers ───────────────────────────────────────────
  const startQE = (product, e) => {
    e.stopPropagation();
    setQeProduct(product);
    setQeStep('pass');
    setQePassword('');
    setQeError('');
  };

  const submitQePass = (e) => {
    e.preventDefault();
    if (qePassword === 'rima@123') {
      setQeForm({
        image: resolveImage(qeProduct, localImages),
        price: qeProduct.price,
        name: qeProduct.name,
        urduName: qeProduct.urduName,
      });
      setQeStep('edit');
      setQeError('');
    } else {
      setQeError('❌ Wrong password!');
    }
    setQePassword('');
  };

  const handleQeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      const compressed = c.toDataURL('image/jpeg', 0.72);
      URL.revokeObjectURL(url);
      
      // 1. Try Firebase Upload First
      if (isFirebaseConfigured) {
        const storageRef = ref(storage, `uploads/img_${Date.now()}.jpg`);
        fetch(compressed)
          .then(res => res.blob())
          .then(blob => uploadBytes(storageRef, blob))
          .then(snapshot => getDownloadURL(snapshot.ref))
          .then(downloadURL => {
            setQeForm(prev => ({ ...prev, image: downloadURL }));
            console.log('✅ Image uploaded to Firebase');
          })
          .catch(err => {
            console.warn('Firebase upload failed, using local base64', err);
            setQeForm(prev => ({ ...prev, image: compressed }));
          });
      } else {
        setQeForm(prev => ({ ...prev, image: compressed }));
      }
    };
    img.src = url;
  };

  const saveQE = () => {
    updateProduct(qeProduct.id, {
      ...qeProduct,
      image: qeForm.image,
      price: Number(qeForm.price),
      name: qeForm.name,
      urduName: qeForm.urduName,
    });
    setQeProduct(null);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
        textAlign: 'center', padding: '4rem 0'
      }}>
        <div className="container glass-panel" style={{ padding: '3rem 2rem', maxWidth: '1000px', border: '1px solid rgba(212,175,55,0.2)' }}>
          {/* Featured Video in Foreground */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            style={{ 
              width: '100%', maxWidth: '800px', margin: '0 auto 2.5rem auto', 
              borderRadius: '24px', overflow: 'hidden', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.2)',
              border: '4px solid rgba(212,175,55,0.1)',
              position: 'relative'
            }}
          >
            <video 
              autoPlay loop muted playsInline controls
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            >
              <source src="/welcome bakery.mp4" type="video/mp4" />
            </video>
            {/* Soft gold glow behind video */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="title-large text-gold" style={{ marginBottom: '1rem', fontSize: '3.5rem' }}
          >
            Velvet Whisk Home Bakery
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="urdu-text" style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-main)', display: 'block', direction: 'rtl', textAlign: 'center', width: '100%' }}
          >
            گھر کی بنی ہوئی تازہ اور پریمیم بیکری آئٹمز، خاص آپ کے لیے۔
          </motion.p>

          <motion.a 
            href="#menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', gap: '1rem' }}
          >
            Explore Menu 
            <span className="urdu-text" style={{ fontSize: '1.3rem', marginTop: '-4px' }}>
              مینو دیکھیں
            </span>
          </motion.a>
        </div>
      </section>

      {/* Live Kitchen Status Bar */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(212,175,55,0.1)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '10px', height: '10px', background: '#38a169', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', inset: -4, border: '2px solid #38a169', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#38a169', letterSpacing: '1px' }}>KITCHEN LIVE</span>
          </div>
          
          <div 
            style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setIsKitchenModalOpen(true)}
            title="Click to update status (Admin Only)"
          >
            {[
              { id: 'mixing', label: 'Mixing', icon: '🥣', urdu: 'مکسنگ' },
              { id: 'baking', label: 'Baking', icon: '🔥', urdu: 'بیکنگ' },
              { id: 'decorating', label: 'Decorating', icon: '✨', urdu: 'ڈیکوریشن' }
            ].map(step => (
              <div key={step.id} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                opacity: activeKitchenStatus === step.id ? 1 : 0.3,
                transition: 'all 0.5s ease',
                transform: activeKitchenStatus === step.id ? 'scale(1.1)' : 'scale(1)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: activeKitchenStatus === step.id ? 'var(--primary)' : 'white' }}>{step.label}</span>
                  <span className="urdu-text" style={{ fontSize: '0.7rem', marginTop: '-3px' }}>{step.urdu}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Video Highlights Section */}
      <section className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="title-medium text-gold" style={{ marginBottom: 0 }}>Our Process</h2>
              <span className="urdu-text" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '-10px' }}>ہمارا طریقہ</span>
            </div>
            <p className="urdu-text" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>انتہائی صاف ستھرے ماحول میں تیاری۔</p>
          </div>
          
            <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
              {[
                { video: "/v1.mp4", title: "Hygiene & Baking", urdu: "صفائی اور بیکنگ" },
                { video: "/v2.mp4", title: "Cake Decoration", urdu: "کیک ڈیکوریشن" },
                { video: "/v3.mp4", title: "Safe Delivery", urdu: "محفوظ ڈیلیوری" }
              ].map((vid, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveProcessVideo(vid)}
                  className="glass-card" 
                  style={{ 
                    position: 'relative', 
                    aspectRatio: '16/9', 
                    overflow: 'hidden', 
                    borderRadius: '20px', 
                    background: '#000',
                    cursor: 'pointer',
                    border: '1px solid rgba(212,175,55,0.2)'
                  }}
                >
                  <video 
                    src={vid.video} 
                    autoPlay loop muted playsInline
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'cover', opacity: 1,
                      transform: 'scale(1.05)', // Slight scale to crop edge artifacts from video files
                    }}
                  />
                  <div className="video-overlay" style={{ 
                    position: 'absolute', inset: 0, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    background: 'rgba(0,0,0,0.3)', 
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none' // Allow clicks to pass through to the parent motion.div
                  }}>
                    <div style={{ 
                      background: 'rgba(212,175,55,0.2)', 
                      borderRadius: '50%', 
                      padding: '1rem', 
                      backdropFilter: 'blur(4px)',
                      border: '1px solid var(--primary)',
                      boxShadow: '0 0 20px rgba(212,175,55,0.3)'
                    }}>
                      <PlayCircle size={32} color="var(--primary)" />
                    </div>
                  </div>
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '0.85rem' }}>{vid.title}</span>
                      <span className="urdu-text" style={{ color: '#fff', fontSize: '0.8rem', opacity: 0.8, marginTop: '-5px' }}>{vid.urdu}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>
      
      {/* ── Process Video Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {activeProcessVideo && (
          <div className="overlay" onClick={() => setActiveProcessVideo(null)} style={{ zIndex: 2000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="modal" style={{ width: '95%', maxWidth: '900px', padding: 0, overflow: 'hidden', background: '#000' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                <video 
                  src={activeProcessVideo.video} 
                  autoPlay controls 
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
                <button 
                  onClick={() => setActiveProcessVideo(null)} 
                  style={{ 
                    position: 'absolute', top: '15px', right: '15px', 
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', 
                    color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 
                  }}
                >
                  <X size={20} />
                </button>
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  pointerEvents: 'none'
                }}>
                  <h3 className="text-gold" style={{ margin: 0, fontSize: '1.5rem' }}>{activeProcessVideo.title}</h3>
                  <p className="urdu-text" style={{ margin: 0, color: 'white', fontSize: '1.2rem', opacity: 0.9 }}>{activeProcessVideo.urdu}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gluten-Free Dedicated Section */}
      <section id="gluten-free" className="section-padding" style={{ 
        background: 'linear-gradient(rgba(56, 161, 105, 0.05), transparent)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-gluten-free" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Special Category</span>
            <h2 className="title-medium text-gold" style={{ marginBottom: 0 }}>Gluten-Free Specialties</h2>
            <p className="urdu-text" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '-15px', marginBottom: '0.5rem' }}>گلوٹن فری اشیاء</p>
            <p className="urdu-text" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>صحت اور ذائقہ ایک ساتھ۔</p>
          </div>

          <div className="grid-cols-4">
            {products.filter(p => p.category === 'gluten-free').slice(0, 4).map(product => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', background: '#000' }}>
                  <img src={resolveImage(product, localImages)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  <button onClick={(e) => startQE(product, e)} className="qe-btn" title="Quick Edit" style={{ position:'absolute', top:'7px', left:'7px', background:'rgba(0,0,0,0.65)', border:'1px solid rgba(212,175,55,0.5)', color:'var(--primary)', borderRadius:'6px', padding:'4px 6px', cursor:'pointer', display:'flex', alignItems:'center', zIndex:5, opacity:0, transition:'opacity 0.2s' }}><Edit3 size={13}/></button>
                </div>
                <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{product.name}</h3>
                      <p className="urdu-text" style={{ fontSize: '0.9rem', color: 'var(--primary)', margin: 0 }}>{product.urduName}</p>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Rs. {product.price}</span>
                  </div>
                  <div style={{ marginBottom: '0.5rem', flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem', lineHeight: '1.2' }}>{product.description}</p>
                    <p className="urdu-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{product.urduDescription}</p>
                  </div>
                  <button onClick={() => openModal(product)} className="btn btn-primary" style={{ width: '100%', padding: '0.3rem', fontSize: '0.75rem', marginTop: 'auto' }}>Select</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="title-medium text-gold" style={{ marginBottom: 0 }}>Premium Menu</h2>
              <span className="urdu-text" style={{ fontSize: '2.8rem', color: 'var(--primary)', marginTop: '-15px' }}>پریمیم مینو</span>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '2.5rem', flexWrap: 'wrap', padding: '0.5rem' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  padding: '0.3rem 0.6rem', fontSize: '0.7rem', whiteSpace: 'nowrap', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  flex: '0 1 auto', minWidth: '100px'
                }}
              >
                {cat.name.split(' / ')[0]} <span className="urdu-text" style={{ fontSize: '0.8rem', marginTop: '-2px' }}>{cat.name.split(' / ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid-cols-4">
            <AnimatePresence>
              {filteredProducts.filter(p => p.category !== 'gluten-free').map(product => (
                <motion.div 
                  layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', background: '#000' }}>
                    <img src={resolveImage(product, localImages)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.5s' }} className="product-img" />
                    <button onClick={(e) => startQE(product, e)} className="qe-btn" title="Quick Edit" style={{ position:'absolute', top:'7px', left:'7px', background:'rgba(0,0,0,0.65)', border:'1px solid rgba(212,175,55,0.5)', color:'var(--primary)', borderRadius:'6px', padding:'4px 6px', cursor:'pointer', display:'flex', alignItems:'center', zIndex:5, opacity:0, transition:'opacity 0.2s' }}><Edit3 size={13}/></button>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {product.badges.map(badge => (
                        <span key={badge} className={`badge badge-${badge}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          {badge === 'gluten-free' ? 'Gluten Free' : badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                      <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{product.name}</h3>
                        <p className="urdu-text" style={{ fontSize: '0.9rem', color: 'var(--primary)', margin: 0 }}>{product.urduName}</p>
                      </div>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Rs. {product.price}</span>
                    </div>
                    <div style={{ marginBottom: '0.5rem', flex: 1 }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem', lineHeight: '1.2' }}>{product.description}</p>
                      <p className="urdu-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{product.urduDescription}</p>
                    </div>
                    <button 
                      onClick={() => openModal(product)}
                      className="btn btn-primary" style={{ width: '100%', padding: '0.3rem', fontSize: '0.75rem', marginTop: 'auto' }}
                    >
                      Select
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="overlay" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="modal" style={{ width: '90%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}
            >
              <div style={{ position: 'relative', height: '200px', background: '#000' }}>
                <img src={resolveImage(selectedProduct, localImages)} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
              
              <div style={{ padding: '1.2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h2 className="text-gold" style={{ marginBottom: '0.2rem', fontSize: '1.3rem' }}>{selectedProduct.name}</h2>
                  <h3 className="urdu-text" style={{ marginBottom: '0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{selectedProduct.urduName}</h3>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h4 className="urdu-text" style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Select Size / سائز</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {selectedProduct.sizes.map((size, index) => (
                      <button 
                        key={index}
                        onClick={() => setSelectedSizeIndex(index)}
                        className={`btn ${selectedSizeIndex === index ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', flex: '1 1 calc(50% - 0.6rem)', minWidth: '140px' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>{size.size}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {size.price > 0 ? `+Rs. ${size.price}` : 'Base Price'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="urdu-text" style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Add-ons / اضافی اشیاء</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedProduct.addons.map((addon, index) => {
                        const isSelected = selectedAddons.find(a => a.name === addon.name);
                        return (
                          <div 
                            key={index} 
                            onClick={() => toggleAddon(addon)}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                              border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                              background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${isSelected ? 'var(--primary)' : '#666'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isSelected && <Check size={12} color="var(--primary)" />}
                              </div>
                              <span style={{ color: 'var(--text-main)' }}>{addon.name}</span>
                            </div>
                            <span style={{ color: 'var(--primary)' }}>+Rs. {addon.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gift Option Section */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.3)' }}>
                  <div 
                    onClick={() => setIsGift(!isGift)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: isGift ? '10px' : 0 }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isGift ? 'var(--primary)' : 'transparent' }}>
                      {isGift && <Check size={14} color="black" />}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Make it a Gift (+Rs. 150)</span>
                      <p className="urdu-text" style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>اسے تحفہ بنائیں (اضافی 150 روپے)</p>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isGift && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <textarea 
                          placeholder="Write your gift message here... (e.g. Happy Birthday!)"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          dir="auto"
                          style={{ 
                            width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.3)', 
                            border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                            color: 'white', padding: '10px', fontSize: '1rem', marginTop: '5px',
                            fontFamily: "'Outfit', 'Jameel Noori Nastaleeq', sans-serif",
                            outline: 'none', textAlign: 'left', lineHeight: '1.5'
                          }}
                        />
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>* Includes premium gift wrap & a handwritten note.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}
                >
                  <ShoppingBag size={18} /> Add (Rs. {selectedProduct.price + (selectedProduct.sizes?.[selectedSizeIndex]?.price || 0) + (selectedAddons || []).reduce((sum, a) => sum + a.price, 0)})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reviews Section */}
      <section id="reviews" className="section-padding" style={{ overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <h2 className="title-medium text-gold" style={{ marginBottom: 0, fontSize: '1.8rem' }}>Customer Reviews</h2>
            <span className="urdu-text" style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '-8px' }}>کسٹمرز کی رائے</span>
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          padding: '0.5rem 0',
        }}>
          {/* Fade edges */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to right, var(--bg-dark, #0a0a0a), transparent)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to left, var(--bg-dark, #0a0a0a), transparent)',
            pointerEvents: 'none'
          }} />

          <div
            className="reviews-track"
            style={{
              display: 'flex',
              gap: '1rem',
              width: 'max-content',
              animation: 'reviewsScroll 55s linear infinite',
            }}
          >
            {[...reviews, ...reviews].map((review, idx) => (
              <div
                key={idx}
                className="review-card-compact"
                style={{
                  width: '280px',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.18)',
                  borderRadius: '14px',
                  padding: '1rem',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', color: 'var(--primary)', justifyContent: 'center', marginBottom: '0.2rem', gap: '2px' }}>
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="var(--primary)" />)}
                </div>

                {/* Review text handling */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  {/* English Version (if not urdu-only) */}
                  {(review.lang !== 'ur' || review.text && !review.text.match(/[\u0600-\u06FF]/)) && (
                    <p
                      style={{
                        fontStyle: 'italic',
                        color: '#CBD5E1',
                        fontSize: '0.72rem',
                        lineHeight: '1.4',
                        textAlign: 'center',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      "{review.text}"
                    </p>
                  )}

                  {/* Urdu Version (if exists as urduText or lang is ur) */}
                  {(review.urduText || (review.lang === 'ur' && review.text.match(/[\u0600-\u06FF]/))) && (
                    <p
                      className="urdu-text"
                      style={{
                        color: '#CBD5E1',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        textAlign: 'center',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        direction: 'rtl'
                      }}
                    >
                      "{review.urduText || review.text}"
                    </p>
                  )}
                </div>

                {/* Name - Centered at Bottom */}
                <p style={{
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                  paddingTop: '0.5rem',
                  margin: 0,
                  textAlign: 'center'
                }}>— {review.name}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes reviewsScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .reviews-track:hover { animation-play-state: paused !important; }
          .review-card-compact:hover {
            border-color: rgba(212,175,55,0.5) !important;
            background: rgba(212,175,55,0.07) !important;
            transition: border-color 0.3s, background 0.3s;
          }
          .glass-card:hover .qe-btn { opacity: 1 !important; }
          .qe-btn:hover { background: rgba(212,175,55,0.25) !important; }
        `}</style>
      </section>
      {/* ── Quick-Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {qeProduct && (
          <div className="overlay" onClick={() => setQeProduct(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
              className="modal"
              style={{ width: '90%', maxWidth: '380px', padding: '1.6rem', overflowY: 'auto', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
                <div>
                  <h3 className="text-gold" style={{ margin:0, fontSize:'1.1rem' }}>Quick Edit</h3>
                  <p style={{ margin:0, fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px' }}>{qeProduct.name}</p>
                </div>
                <button onClick={() => setQeProduct(null)} style={{ background:'none', border:'none', color:'white', cursor:'pointer' }}><X size={20}/></button>
              </div>

              {/* STEP 1 – Password */}
              {qeStep === 'pass' && (
                <form onSubmit={submitQePass}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Password</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span className="urdu-text" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ایڈمن پاس ورڈ</span>
                  </label>
                  <input
                    type="password" autoFocus
                    value={qePassword} onChange={e => setQePassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width:'100%', marginBottom:'0.8rem', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-en)' }}
                  />
                  {qeError && <p style={{ color:'#ef233c', fontSize:'0.78rem', marginBottom:'0.6rem' }}>{qeError}</p>}
                  <button className="btn btn-primary" style={{ width:'100%', padding:'0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>UNLOCK</span>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-3px' }}>کھولیں</span>
                  </button>
                </form>
              )}

              {/* STEP 2 – Edit */}
              {qeStep === 'edit' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                  {/* Image preview */}
                  <div style={{ textAlign:'center' }}>
                    <div style={{ width:'100%', height:'160px', borderRadius:'10px', overflow:'hidden', background:'#111', marginBottom:'0.6rem' }}>
                      {qeForm.image
                        ? <img src={qeForm.image} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}><Upload size={30}/></div>
                      }
                    </div>
                    <label className="btn btn-outline" style={{ fontSize:'0.75rem', cursor:'pointer', display:'inline-flex', gap:'6px', alignItems:'center', padding:'0.45rem 1rem' }}>
                      <Upload size={14}/> Upload New Picture
                      <input type="file" accept="image/*" onChange={handleQeUpload} style={{ display:'none' }}/>
                    </label>
                    <input
                      type="text" value={qeForm.image} onChange={e => setQeForm(p => ({ ...p, image: e.target.value }))}
                      placeholder="Or paste image URL"
                      style={{ width:'100%', marginTop:'0.5rem', fontSize:'0.75rem' }}
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label style={{ fontSize:'0.75rem', color:'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Name (English)</label>
                    <input 
                      type="text" value={qeForm.name} onChange={e => setQeForm(p => ({ ...p, name: e.target.value }))} 
                      style={{ width:'100%', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="urdu-text" style={{ fontSize:'1rem', color:'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>نام (اردو)</label>
                    <input 
                      type="text" value={qeForm.urduName} onChange={e => setQeForm(p => ({ ...p, urduName: e.target.value }))} 
                      className="urdu-text" 
                      style={{ width:'100%', outline: 'none', fontSize: '1.2rem' }}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Price (Rs)</label>
                    <input type="number" value={qeForm.price} onChange={e => setQeForm(p => ({ ...p, price: e.target.value }))} style={{ width:'100%' }}/>
                  </div>

                  <button onClick={saveQE} className="btn btn-primary" style={{ width:'100%', padding:'0.8rem', display:'flex', justifyContent:'center', gap:'8px', alignItems:'center' }}>
                    <Save size={16}/> Save Changes / محفوظ کریں
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Kitchen Status Admin Modal */}
      <AnimatePresence>
        {isKitchenModalOpen && (
          <div className="overlay" style={{ zIndex: 3000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel"
              style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="text-gold">Kitchen Control</h3>
                <button 
                  onClick={() => {
                    setIsKitchenModalOpen(false);
                    setKsStep('pass');
                    setKsPassword('');
                    setKsError('');
                  }} 
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {ksStep === 'pass' ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (ksPassword === 'rima@123') {
                    setKsStep('select');
                    setKsError('');
                  } else {
                    setKsError('Incorrect Password!');
                  }
                }}>
                  <p className="urdu-text" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>ایڈمن پاس ورڈ درج کریں</p>
                  <input 
                    type="password" 
                    value={ksPassword} 
                    onChange={(e) => setKsPassword(e.target.value)} 
                    placeholder="Admin Password"
                    autoFocus
                    style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}
                  />
                  {ksError && <p style={{ color: '#ef233c', fontSize: '0.8rem', marginBottom: '1rem' }}>{ksError}</p>}
                  <button className="btn btn-primary" style={{ width: '100%' }}>Verify</button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p className="urdu-text" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>سٹیٹس تبدیل کریں</p>
                  {[
                    { id: 'auto', label: 'Auto Rotate (Default)', urdu: 'خودکار' },
                    { id: 'mixing', label: 'Mixing', urdu: 'مکسنگ' },
                    { id: 'baking', label: 'Baking', urdu: 'بیکنگ' },
                    { id: 'decorating', label: 'Decorating', urdu: 'ڈیکوریشن' }
                  ].map(status => (
                    <button 
                      key={status.id}
                      onClick={() => {
                        setKitchenStatus(status.id);
                        setIsKitchenModalOpen(false);
                        setKsStep('pass');
                        setKsPassword('');
                      }}
                      className={kitchenStatus === status.id ? "btn btn-primary" : "btn btn-outline"}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>{status.label}</span>
                      <span className="urdu-text" style={{ fontSize: '0.9rem' }}>{status.urdu}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
