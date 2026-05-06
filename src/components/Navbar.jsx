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
                boxShadow: theme === t.id ? `0 0 10px ${t
