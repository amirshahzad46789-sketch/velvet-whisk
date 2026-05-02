import React, { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Clock } from 'lucide-react';

const TopBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const whatsappNumber = "96597526173";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      {/* Golden Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #D4AF37 0%, #F1D279 50%, #D4AF37 100%)',
        color: '#000',
        padding: '0.3rem 0',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1003,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <div className="announcement-scroll" style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: 'scrollText 25s linear infinite'
        }}>
          ✨ FREE DELIVERY ON ORDERS ABOVE RS. 2500! | 🍰 FRESH BATCH OF LOTUS CHEESECAKES READY BY 4 PM! | 🎁 SURPRISE GIFT ON EVERY FIRST ORDER! | ✨ پریمیم کوالٹی بیکری - آپ کے گھر تک!
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0.4rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-main)',
        zIndex: 1002,
        position: 'sticky',
        top: 0
      }}>
      {/* Left: Address */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={14} className="text-gold" />
        <span>K block, House 233, Model Town, Lahore</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span className="urdu-text" style={{ fontSize: '0.85rem' }}>کے بلاک، ہاؤس 233، ماڈل ٹاؤن، لاہور</span>
      </div>

      {/* Middle: Live PST Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.1)', padding: '2px 10px', borderRadius: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
        <Clock size={14} className="text-gold" />
        <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>{formatPST(currentTime)}</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>PST</span>
      </div>

      {/* Right: WhatsApp */}
      <a 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          textDecoration: 'none', 
          color: 'var(--primary)',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        className="topbar-whatsapp"
      >
        <MessageCircle size={16} />
        <span>WhatsApp Chat</span>
        <span className="urdu-text" style={{ fontSize: '0.85rem' }}>(واٹس ایپ)</span>
      </a>

      <style>{`
        .topbar-whatsapp:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        @keyframes scrollText {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </>
  );
};

export default TopBar;
