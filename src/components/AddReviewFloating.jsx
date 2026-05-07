import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, MessageSquare } from 'lucide-react';
import useStore from '../store/useStore';

const AddReviewFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addReview } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: '',
    urduText: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addReview({
      ...formData,
      id: Date.now()
    });
    setIsOpen(false);
    setFormData({ name: '', rating: 5, text: '', urduText: '' });
    alert('Thank you! Your review has been added. / شکریہ! آپ کا ریویو شامل کر دیا گیا ہے۔');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--primary)',
          padding: hovered ? '12px 20px' : '15px',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: 'black'
        }}
      >
        <Star size={24} fill={hovered ? "black" : "none"} />
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              Write a Review
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="overlay" style={{ zIndex: 1000 }}>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="modal glass-panel"
              style={{ maxWidth: '500px', width: '90%', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)' }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 className="title-medium text-gold" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Share Your Experience</h2>
                <p className="urdu-text" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>اپنی رائے کا اظہار کریں</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ color: 'var(--primary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>Your Name /</span>
                    <span className="urdu-text" style={{ fontSize: '1.3rem', fontFamily: "'Jameel Noori Nastaleeq', serif", lineHeight: '2' }}>آپ کا نام</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>Rating /</span>
                    <span className="urdu-text" style={{ fontSize: '1.3rem', fontFamily: "'Jameel Noori Nastaleeq', serif", lineHeight: '2' }}>ریٹنگ</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={30}
                        cursor="pointer"
                        fill={star <= formData.rating ? "var(--primary)" : "none"}
                        color="var(--primary)"
                        onClick={() => setFormData({...formData, rating: star})}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ color: 'var(--primary)', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Review (English)</label>
                  <textarea 
                    required 
                    rows="2"
                    placeholder="How was the taste?"
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  ></textarea>
                </div>

                <div>
                  <label style={{ color: 'var(--primary)', marginBottom: '5px', display: 'block', fontFamily: "'Jameel Noori Nastaleeq', serif", fontSize: '1.5rem', lineHeight: '2.2', textAlign: 'right', direction: 'rtl' }}>تبصرہ (اردو)</label>
                  <textarea 
                    required 
                    rows="2"
                    placeholder="ذائقہ کیسا تھا؟"
                    value={formData.urduText}
                    onChange={(e) => setFormData({...formData, urduText: e.target.value})}
                    className="urdu-text"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.3rem', fontFamily: "'Jameel Noori Nastaleeq', serif", direction: 'rtl' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}
                >
                  <Send size={18} />
                  <span style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '1px' }}>SUBMIT REVIEW /</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', serif", fontSize: '1.4rem', lineHeight: '1.8', fontWeight: 'normal', letterSpacing: 'normal', textTransform: 'none' }}>ریویو بھیجیں</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddReviewFloating;
