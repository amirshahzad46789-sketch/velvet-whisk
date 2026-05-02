import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-panel" style={{ padding: '1rem 1rem', marginTop: '2rem', borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', background: 'rgba(20, 20, 20, 0.95)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center' }}>
        
        {/* Row 1: Brand, Tagline, and Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <h2 className="text-gold" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Velvet Whisk Home Bakery</h2>
            <span style={{ color: 'var(--primary)', fontSize: '1rem', opacity: 0.5 }}>|</span>
            <span className="urdu-text text-gold" style={{ fontSize: '1rem', opacity: 0.9 }}>بہترین ذائقہ، بہترین معیار</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {[
              { href: "#", en: "Home", ur: "ہوم" },
              { href: "#menu", en: "Menu", ur: "مینو" },
              { href: "#reviews", en: "Reviews", ur: "ریویوز" },
              { href: "/admin", en: "Admin", ur: "ایڈمن", isRoute: true }
            ].map((link, idx) => (
              link.isRoute ? (
                <Link key={idx} to={link.href} className="text-gold footer-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '500' }}>
                  {link.en} <span className="urdu-text" style={{ fontSize: '0.9rem' }}>({link.ur})</span>
                </Link>
              ) : (
                <a key={idx} href={link.href} className="text-gold footer-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '500' }}>
                  {link.en} <span className="urdu-text" style={{ fontSize: '0.9rem' }}>({link.ur})</span>
                </a>
              )
            ))}
          </div>
        </div>

        {/* Row 2: WhatsApp, Copyright, and Address */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--primary)', opacity: 0.7 }}>
          <span className="text-gold">WhatsApp: +965 9752 6173</span>
          <span className="text-gold">&copy; {new Date().getFullYear()}</span>
          <span className="text-gold">K block, House 233, Model Town, Lahore, Pakistan</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
