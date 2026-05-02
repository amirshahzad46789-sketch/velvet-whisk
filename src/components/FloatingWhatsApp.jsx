import React from 'react';
import useStore from '../store/useStore';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
  const { theme } = useStore();
  
  // WhatsApp Link - Using the number from Footer (assuming it's correct or placeholders are fine)
  const whatsappNumber = "96597526173"; 
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <a 
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        top: '60%', // Positioned within Hero area range
        right: '2rem',
        zIndex: 99,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary)',
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3), 0 0 20px var(--shadow-glow)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        textDecoration: 'none'
      }}
      className="whatsapp-float"
    >
      <MessageCircle size={32} />
      <style>{`
        .whatsapp-float:hover {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.4), 0 0 30px var(--shadow-glow);
        }
        @keyframes pulse-whatsapp {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        .whatsapp-float {
          animation: pulse-whatsapp 2s infinite;
        }
      `}</style>
    </a>
  );
};

export default FloatingWhatsApp;
