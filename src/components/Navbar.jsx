import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';

const Navbar = () => {
  const { toggleCart, cart, theme, setTheme } = useStore();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPST = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const themes = [
    { id: 'dark-gold', color: '#D4AF37', label: 'Gold' },
    { id: 'light-rose', color: '#D67D81', label: 'Rose' },
    { id: 'dark-royal', color: '#9D50BB', label: 'Royal' },
    { id: 'light-mint', color: '#38A169', label: 'Mint' }
  ];

  return (
    <nav className="glass-panel" style={{
      position: 'sticky', top: '1rem', zIndex: 100, padding: '0.6rem 1.5rem', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(10, 12, 20, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      margin: '0 1rem', borderRadius: '50px'
    }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 className="title-medium text-gold" style={{ margin: 0, fontSize: '1.4rem' }}>Velvet Whisk</h1>
        
        {/* Live Clock */}
        <div className="desktop-only-flex" style={{ 
          alignItems: 'center', gap: '0.4rem', 
          background: 'rgba(212,175,55,0.08)', padding: '4px 12px', 
          borderRadius: '15px', border: '1px solid rgba(212,175,55,0.15)',
          marginLeft: '0.5rem'
        }}>
          <Clock size={12} className="text-gold" />
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: 'var(--primary)', 
            letterSpacing: '0.5px',
            fontVariantNumeric: 'tabular-nums',
            minWidth: '90px',
            display: 'inline-block',
            textAlign: 'center'
          }}>
            {formatPST(currentTime)} <span style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: '2px', color: 'var(--primary)' }}>PST</span>
          </span>
        </div>

        {/* Theme Switcher */}
        <div className="desktop-only-flex" style={{ gap: '0.4rem', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginLeft: '0.5rem' }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                width: '18px', height: '18px', borderRadius: '50%', background: t.color,
                border: theme === t.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', padding: 0, transition: 'all 0.3s ease',
                boxShadow: theme === t.id ? `0 0 10px ${t.color}` : 'none'
              }}
              title={t.label}
            />
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <ul className="nav-links">
          <li><a href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Home</a></li>
          <li><a href="#menu" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Menu</a></li>
          <li><a href="#gluten-free" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>Gluten Free</a></li>
          <li><a href="/admin" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Admin</a></li>
        </ul>

        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="btn-outline mobile-only-flex" 
          style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={20} />
        </button>

        <button 
          onClick={toggleCart}
          className="btn-outline" 
          style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ShoppingBag size={20} />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              backgroundColor: '#ef233c', color: 'white',
              borderRadius: '50%', width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(239,35,60,0.5)'
            }}>
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay mobile-only-flex">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={30} />
          </button>
          <a href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</a>
          <a href="#gluten-free" onClick={() => setIsMobileMenuOpen(false)}>Gluten Free</a>
          <a href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</a>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '20px' }}>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setIsMobileMenuOpen(false); }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', background: t.color,
                  border: theme === t.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', padding: 0
                }}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
