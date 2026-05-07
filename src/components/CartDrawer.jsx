import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { resolveImage } from '../store/useStore';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, setHours, setMinutes, format } from 'date-fns';

const CartDrawer = () => {
  const { 
    cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, clearCart, localImages, addOrder 
  } = useStore();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('jazzcash'); // jazzcash, easypaisa, cod
  
  const [step, setStep] = useState(1); // Step 1: Cart, Step 2: Details
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [receiptImage, setReceiptImage] = useState('');

  // Mobile Tabs Logic
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeMobileTab, setActiveMobileTab] = useState(1);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Body scroll lock
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1); // Reset to step 1 when opened
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = paymentMethod === 'cod' ? 100 : 0;
  const totalAmount = subtotal + deliveryFee;
  const minDate = addDays(new Date(), 1);


  // Fetch Jameel Noori Nastaleeq as base64 so mobile can use it without CDN
  const fetchFontAsBase64 = async () => {
    const urls = [
      'https://cdn.jsdelivr.net/gh/mushfiq/urdo-webfont@master/JameelNooriNastaleeq/JameelNooriNastaleeq.woff2',
      'https://cdn.jsdelivr.net/gh/mushfiq/urdo-webfont@master/JameelNooriNastaleeq/JameelNooriNastaleeq.woff',
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        const mime = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
        return `data:${mime};base64,${b64}`;
      } catch (_) { continue; }
    }
    return null;
  };

  const generateReceipt = async () => {
    const element = document.getElementById('receipt-template');
    if (!element) return;

    // Inject font as base64 into receipt style so mobile doesn't need CDN
    try {
      const fontDataUrl = await fetchFontAsBase64();
      if (fontDataUrl) {
        const existingStyle = element.querySelector('#jameel-font-inline');
        if (existingStyle) existingStyle.remove();
        const style = document.createElement('style');
        style.id = 'jameel-font-inline';
        style.textContent = `
          @font-face {
            font-family: 'Jameel Noori Nastaleeq';
            src: url('${fontDataUrl}') format('${fontDataUrl.includes('woff2') ? 'woff2' : 'woff'}');
            font-weight: normal;
            font-style: normal;
          }
        `;
        element.prepend(style);
      }
    } catch (_) {}

    // Wait for React state to update the receipt template values
    await new Promise(r => setTimeout(r, 1200));
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Extra wait for font to actually render after injection
    await new Promise(r => setTimeout(r, 500));

    // Wait for ALL images inside receipt to finish loading
    const imgEls = Array.from(element.querySelectorAll('img'));
    await Promise.all(imgEls.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => { img.onload = res; img.onerror = res; setTimeout(res, 3000); })
    ));

    try {
      const canvas = await window.html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 1.5,
        backgroundColor: '#0B0F19',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure font style is also in cloned document for html2canvas
          const clonedEl = clonedDoc.getElementById('receipt-template');
          if (clonedEl) {
            const existing = clonedEl.querySelector('#jameel-font-inline');
            if (!existing) {
              const s = clonedDoc.createElement('style');
              s.textContent = element.querySelector('#jameel-font-inline')?.textContent || '';
              clonedEl.prepend(s);
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.7);

      // 1. Save as PDF
      if (window.jspdf && window.jspdf.jsPDF) {
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`VelvetWhisk_Bill_${Date.now()}.pdf`);
      } else {
        console.warn('jsPDF not loaded — PDF skipped');
      }

      // 2. Save as JPG
      const link = document.createElement('a');
      link.download = `Receipt_${Date.now()}.jpg`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3. Copy PNG to clipboard (for WhatsApp paste)
      try {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
          console.log('✅ Bill copied to clipboard!');
        }
      } catch (clipErr) {
        console.warn('Clipboard write failed:', clipErr);
      }

      return imgData;

    } catch (error) {
      console.error('Receipt Generation Error:', error);
      return null;
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (!customerName || !deliveryDate) {
      alert("Please enter your name and select a delivery date/time.");
      return;
    }

    // Show success/processing animation immediately
    setShowSuccess(true);
    setReceiptImage('');

    // Generate both PDF and Image
    const generatedImg = await generateReceipt();
    if (generatedImg) setReceiptImage(generatedImg);

    // Save Order to Admin Panel / Global Store
    addOrder({
      id: Date.now(),
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      customerAddress,
      deliveryDate: deliveryDate.toISOString(),
      status: 'pending',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options
      })),
      total: totalAmount,
      subtotal,
      deliveryFee,
      paymentMethod
    });

    const adminWhatsApp = "96597526173";

    // Build emoji symbols at runtime from code points
    const E = (/** @type {number[]} */ ...codes) => String.fromCodePoint(...codes);
    const flag     = E(0x1F1F5, 0x1F1F0); // Pakistan flag
    const scroll   = E(0x1F4DC);           // Scroll
    const person   = E(0x1F464);           // Person silhouette
    const pin      = E(0x1F4CD);           // Pin / location
    const cal      = E(0x1F4C5);           // Calendar
    const pkg      = E(0x1F4E6);           // Package
    const star     = E(0x2B50);            // Star
    const money    = E(0x1F4B0);           // Money bag
    const dollar   = E(0x1F4B5);           // Dollar
    const truck    = E(0x1F69A);           // Truck
    const ccard    = E(0x1F4B3);           // Credit card
    const gem      = E(0x1F48E);           // Gem
    const folded   = E(0x1F64F);           // Folded hands
    const speech   = E(0x1F4AC);           // Speech bubble
    const gift     = E(0x1F381);           // Gift box
    const check    = E(0x2705);            // Check mark

    // Build the message
    const lines = [];
    const twoFlags = flag.repeat(2);
    lines.push(twoFlags + ' *VELVET WHISK HOME BAKERY* ' + twoFlags);
    lines.push('');
    lines.push(scroll + ' *NEW PREMIUM ORDER* ' + scroll);
    lines.push('');
    lines.push(person + ' *Customer:* ' + customerName);
    if (customerPhone) lines.push('\u{1F4F1}' + ' *Phone:* ' + customerPhone);
    if (customerAddress) lines.push(pin + ' *Address:* ' + customerAddress);
    lines.push(cal + ' *Delivery:* ' + format(deliveryDate, 'PPpp'));
    lines.push('');
    lines.push(pkg + ' *ORDER DETAILS:*');
    lines.push('---------------------------');

    cart.forEach((item, index) => {
      lines.push('');
      lines.push((index + 1) + '. *' + item.name + '* (x' + item.quantity + ')');
      if (item.options?.size) lines.push('   ' + check + ' Size: ' + item.options.size);
      if (item.options?.isGift) {
        lines.push('   ' + gift + ' *--- GIFT OPTION ---* ' + gift);
        if (item.options.giftMessage) lines.push('   ' + speech + ' Msg: "' + item.options.giftMessage + '"');
      }
      lines.push('   ' + money + ' Price: Rs. ' + (item.price * item.quantity));
    });

    lines.push('');
    lines.push('---------------------------');
    lines.push(dollar + ' *Subtotal:* Rs. ' + subtotal);
    if (deliveryFee > 0) lines.push(truck + ' *COD Fee:* Rs. ' + deliveryFee);
    lines.push(ccard + ' *Payment:* ' + paymentMethod.toUpperCase());
    lines.push('');
    lines.push(gem + ' *TOTAL AMOUNT:* *Rs. ' + totalAmount + '* ' + gem);
    lines.push('---------------------------');
    lines.push('');
    lines.push(folded + ' *Thank you for choosing Velvet Whisk!*');
    lines.push('');
    lines.push('---------------------------');
    lines.push('⚠️ *Note:* Please Press (Ctrl+V) or Paste to send the Bill Image also.');


    const message = lines.join('\n');

    // Use api.whatsapp.com with URLSearchParams for proper UTF-8 encoding
    const params = new URLSearchParams();
    params.set('phone', adminWhatsApp);
    params.set('text', message);
    const finalUrl = 'https://api.whatsapp.com/send?' + params.toString();
    setCheckoutUrl(finalUrl);
    
    // Do not automatically redirect so user can copy the image
    // window.open(finalUrl, '_blank');
    
    // Clear cart but keep success overlay visible
    clearCart();
  };

  const openWhatsAppDirectly = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {showSuccess && (
        <SuccessOverlay 
          onClose={() => { setShowSuccess(false); setCheckoutUrl(''); setReceiptImage(''); toggleCart(); }} 
          onRetry={openWhatsAppDirectly}
          isProcessing={!checkoutUrl}
          receiptImage={receiptImage}
        />
      )}
      <div className="overlay" onClick={toggleCart} style={{ zIndex: 1000 }} />
      
      {/* Hidden Receipt Template for PDF Generation */}
      <div id="receipt-template" style={{ 
        position: 'fixed', left: '-10000px', top: 0,
        width: '180mm', background: '#0B0F19', color: '#D4AF37', padding: '30px',
        fontFamily: "'Outfit', Arial, sans-serif", border: '10px solid #D4AF37',
        zIndex: -1
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          @font-face {
            font-family: 'Jameel Noori Nastaleeq';
            src: url('https://cdn.jsdelivr.net/gh/mushfiq/urdo-webfont@master/JameelNooriNastaleeq/JameelNooriNastaleeq.woff2') format('woff2');
          }
        `}</style>
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '24px', letterSpacing: '2px', fontFamily: "'Outfit', sans-serif" }}>VELVET WHISK HOME BAKERY</h2>
          <p style={{ color: 'white', fontSize: '22px', margin: '2px 0', fontFamily: "'Jameel Noori Nastaleeq', serif" }}>بہترین ذائقہ، بہترین معیار</p>
          <div style={{ fontSize: '10px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Outfit', sans-serif", opacity: 0.8 }}>Official Order Receipt</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ color: '#D4AF37', marginBottom: '4px', fontWeight: 'bold', fontSize: '11px', fontFamily: "'Outfit', 'Jameel Noori Nastaleeq', sans-serif", textTransform: 'uppercase' }}>CUSTOMER / کسٹمر</div>
            <div style={{ fontFamily: "'Outfit', 'Jameel Noori Nastaleeq', sans-serif", fontSize: '20px', lineHeight: '1.2', color: '#D4AF37' }}>{customerName || 'Guest'}</div>
            <div style={{ color: '#D4AF37', fontSize: '12px', marginTop: '5px', fontFamily: "'Outfit', sans-serif", opacity: 0.8 }}>ID: #VW-{Date.now().toString().slice(-6)}</div>
          </div>
          <div style={{ textAlign: 'right', color: '#D4AF37' }}>
            <div style={{ color: '#D4AF37', marginBottom: '4px', fontWeight: 'bold', fontSize: '11px', fontFamily: "'Outfit', 'Jameel Noori Nastaleeq', sans-serif", textTransform: 'uppercase' }}>DATE & TIME / وقت</div>
            <div style={{ fontSize: '16px', fontFamily: "'Outfit', sans-serif", lineHeight: '1.4' }}>{deliveryDate ? deliveryDate.toLocaleDateString() : 'TBD'}</div>
            <div style={{ fontSize: '16px', fontFamily: "'Outfit', sans-serif", lineHeight: '1.4' }}>{deliveryDate ? deliveryDate.toLocaleTimeString() : ''}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', color: '#D4AF37' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #D4AF37', fontSize: '12px' }}>
              <th style={{ padding: '10px 5px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#D4AF37', fontFamily: "system-ui, sans-serif", fontWeight: 'bold' }}>ITEM DESCRIPTION</div>
              </th>
              <th style={{ padding: '10px 5px', textAlign: 'center', fontWeight: 'bold', color: '#D4AF37' }}>QTY</th>
              <th style={{ padding: '10px 5px', textAlign: 'right', fontWeight: 'bold', color: '#D4AF37' }}>PRICE</th>
              <th style={{ padding: '10px 5px', textAlign: 'right', fontWeight: 'bold', color: '#D4AF37' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', fontSize: '13px', color: '#D4AF37' }}>
                <td style={{ padding: '10px 5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={resolveImage(item, localImages) || item.image}
                      alt=""
                      crossOrigin="anonymous"
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ color: '#D4AF37' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ color: '#D4AF37', fontSize: '14px', fontFamily: "'Jameel Noori Nastaleeq', serif" }}>{item.urduName}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 5px', textAlign: 'center', color: '#D4AF37' }}>{item.quantity}</td>
                <td style={{ padding: '10px 5px', textAlign: 'right', color: '#D4AF37' }}>{item.price}</td>
                <td style={{ padding: '10px 5px', textAlign: 'right', fontWeight: 'bold', color: '#D4AF37' }}>{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: 'auto', width: '250px', borderTop: '2px solid #D4AF37', paddingTop: '15px', fontSize: '13px', color: '#D4AF37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <span>Rs. {subtotal}</span>
          </div>
          {deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>COD Fee:</span>
              <span>Rs. {deliveryFee}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', color: '#D4AF37', fontFamily: "'Outfit', sans-serif" }}>
            <span>Payment Method:</span>
            <span style={{ textTransform: 'uppercase' }}>{paymentMethod}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'white', borderTop: '1px solid rgba(212,175,55,0.3)', paddingTop: '10px', fontFamily: "'Outfit', sans-serif" }}>
            <span>Total:</span>
            <span>Rs. {totalAmount}</span>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', color: 'white', fontSize: '10px' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <span>Thank you for choosing Velvet Whisk Home Bakery!</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ fontFamily: "'Jameel Noori Nastaleeq', serif", fontSize: '14px' }}>آپ کی پسند کا شکریہ</span>
          </p>
        </div>
      </div>
      
      {/* Master Checkout Modal */}
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="modal" 
          style={{ 
            width: '95%', maxWidth: '1200px', maxHeight: '95vh',
            background: 'var(--bg-main)', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            overflowY: 'auto', fontFamily: 'var(--font-en)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShoppingCart className="text-gold" />
              <h2 className="text-gold" style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-en)' }}>Secure Checkout</span>
                <span style={{ fontSize: '0.8em', opacity: 0.5 }}>/</span>
                <span className="urdu-text" style={{ fontSize: '1.6rem', marginTop: '-5px' }}>آرڈر مکمل کریں</span>
              </h2>
            </div>
            <button onClick={toggleCart} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <ShoppingCart size={80} color="rgba(212,175,55,0.2)" />
              <p className="urdu-text" style={{ fontSize: '1.8rem', marginTop: '1rem' }}>آپ کا کارٹ خالی ہے!</p>
              <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={toggleCart}>Start Shopping</button>
            </div>
          ) : (
            <>
              {isMobile && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  <button onClick={() => setActiveMobileTab(1)} style={{ flex: 1, padding: '0.5rem', background: activeMobileTab === 1 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: activeMobileTab === 1 ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: activeMobileTab === 1 ? 'var(--primary)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-en)', fontWeight: 600, fontSize: '0.8rem' }}>Order</button>
                  <button onClick={() => setActiveMobileTab(2)} style={{ flex: 1, padding: '0.5rem', background: activeMobileTab === 2 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: activeMobileTab === 2 ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: activeMobileTab === 2 ? 'var(--primary)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-en)', fontWeight: 600, fontSize: '0.8rem' }}>Date</button>
                  <button onClick={() => setActiveMobileTab(3)} style={{ flex: 1, padding: '0.5rem', background: activeMobileTab === 3 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: activeMobileTab === 3 ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: activeMobileTab === 3 ? 'var(--primary)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-en)', fontWeight: 600, fontSize: '0.8rem' }}>Details</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1.2fr', gap: '1.5rem', flex: 1, minHeight: 0 }} className="checkout-master-grid">
                
                {/* Column 1: Order Summary (Items List) */}
                {(!isMobile || activeMobileTab === 1) && (
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingRight: isMobile ? '0' : '0.8rem' }}>
                    <h4 className="text-gold" style={{ marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.85rem' }}>1. Your Order</span>
                      <span style={{ opacity: 0.5 }}>/</span>
                      <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-3px' }}>آرڈر</span>
                    </h4>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.3rem', maxHeight: '350px' }}>
                      {cart.map((item, index) => (
                        <div key={index} className="glass-card" style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', alignItems: 'center' }}>
                          <img src={resolveImage(item, localImages)} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)' }}>{item.name}</h5>
                            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 'bold' }}>Rs. {item.price} x {item.quantity}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <button onClick={() => updateQuantity(index, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', width: '18px', height: '18px', fontSize: '10px' }}>-</button>
                            <button onClick={() => updateQuantity(index, 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', width: '18px', height: '18px', fontSize: '10px' }}>+</button>
                            <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: '#ef233c', cursor: 'pointer', marginLeft: '2px' }}><X size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 2: Delivery Details */}
                {(!isMobile || activeMobileTab === 3) && (
                  <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingRight: isMobile ? '0' : '0.8rem' }}>
                    <h4 className="text-gold" style={{ marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.85rem' }}>2. Details</span>
                      <span style={{ opacity: 0.5 }}>/</span>
                      <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-3px' }}>تفصیلات</span>
                    </h4>

                    <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.75rem' }}>Name</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-4px' }}>نام</span>
                  </label>
                  <input 
                    type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    className="checkout-input"
                    dir="auto"
                    style={{ width: '100%', padding: '6px 10px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', outline: 'none', textAlign: 'left' }}
                  />
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.75rem' }}>Address (Optional)</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-4px' }}>گھر کا پتہ</span>
                  </label>
                  <input 
                    type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
                    className="checkout-input"
                    dir="auto"
                    style={{ width: '100%', padding: '6px 10px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', outline: 'none', textAlign: 'left' }}
                  />
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.75rem' }}>Phone Number</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-4px' }}>فون نمبر</span>
                  </label>
                  <input 
                    type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="03xx xxxxxxx"
                    className="checkout-input"
                    style={{ width: '100%', padding: '6px 10px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', outline: 'none', textAlign: 'left' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.75rem' }}>Payment Method</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span className="urdu-text" style={{ fontSize: '1rem', marginTop: '-2px' }}>طریقہ ادائیگی</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
                    {['jazzcash', 'easypaisa', 'cod'].map(method => (
                      <button 
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{ 
                          padding: '0.4rem', borderRadius: '6px', border: '1px solid',
                          borderColor: paymentMethod === method ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          background: paymentMethod === method ? 'rgba(212,175,55,0.1)' : 'transparent',
                          color: paymentMethod === method ? 'var(--primary)' : 'white',
                          cursor: 'pointer', fontSize: '0.6rem', fontWeight: 'bold'
                        }}
                      >
                        {method === 'cod' ? 'COD' : method.toUpperCase()}
                        {method === 'cod' && <div style={{ fontSize: '8px', opacity: 0.7 }}>+100</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '0.8rem', background: 'rgba(212,175,55,0.05)', border: '1px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: 'var(--primary)', fontSize: '0.8rem' }}>
                      <span>COD Fee:</span>
                      <span>Rs. {deliveryFee}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
                    <span className="text-gold">Total:</span>
                    <span>Rs. {totalAmount}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                  onClick={handleWhatsAppCheckout}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WA" style={{ width: '18px' }}/>
                  Order via WhatsApp
                </button>
              </div>
            )}

            {/* Column 3: Calendar */}
            {(!isMobile || activeMobileTab === 2) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 className="text-gold" style={{ marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%', textAlign: 'center', paddingBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <span style={{ fontFamily: 'var(--font-en)', fontSize: '0.85rem' }}>3. Delivery Time</span>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span className="urdu-text" style={{ fontSize: '1.2rem', marginTop: '-3px' }}>وقت</span>
                </h4>
                <style>{`
                  .react-datepicker--time-only,
                  .react-datepicker__month-container { display: inline-block !important; }
                  .react-datepicker__time-container {
                    float: right !important;
                    display: inline-block !important;
                    border-left: 1px solid rgba(255,255,255,0.1) !important;
                    width: 80px !important;
                  }
                  .react-datepicker {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: nowrap !important;
                    align-items: flex-start !important;
                  }
                `}</style>
                <div style={{ transform: isMobile ? 'scale(0.82)' : 'scale(0.9)', transformOrigin: 'top center' }}>
                  <DatePicker
                    selected={deliveryDate} onChange={(date) => setDeliveryDate(date)}
                    showTimeSelect timeFormat="HH:mm" timeIntervals={30} timeCaption="Time"
                    dateFormat="MMM d, h:mm aa" minDate={minDate}
                    minTime={setHours(setMinutes(new Date(), 0), 9)} maxTime={setHours(setMinutes(new Date(), 0), 20)}
                    placeholderText="Select Date & Time"
                    inline
                  />
                </div>
              </div>
            )}

            </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

const SuccessOverlay = ({ onClose, onRetry, isProcessing, receiptImage }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    style={{ 
      position: 'fixed', inset: 0, zIndex: 2000, 
      background: 'rgba(11, 15, 25, 0.98)', display: 'flex', 
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      backdropFilter: 'blur(15px)', textAlign: 'center',
      overflowY: 'auto', WebkitOverflowScrolling: 'touch'
    }}
  >
    <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto', padding: '2rem 1.5rem' }}>
    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
      <motion.div 
        animate={isProcessing ? { rotate: 360 } : { rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }} 
        transition={isProcessing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { repeat: Infinity, duration: 2 }}
        style={{ fontSize: '80px', zIndex: 2 }}
      >
        {isProcessing ? '🥣' : '🍰'}
      </motion.div>
      <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
      {!isProcessing && <div style={{ position: 'absolute', inset: -20, border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>}
    </div>

    <h2 className="text-gold" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
      {isProcessing ? 'Preparing Your Bill...' : 'Order Ready!'}
    </h2>
    <p className="urdu-text" style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem' }}>
      {isProcessing ? 'بل تیار ہو رہا ہے...' : 'آرڈر تیار ہے!'}
    </p>

    {receiptImage && !isProcessing && (
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none', WebkitUserSelect: 'none' }}>
          📋 Long Press to Copy
        </span>
        <div style={{
          width: '90px', height: '120px',
          border: '2px solid var(--primary)',
          borderRadius: '8px',
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'default',
          cursor: 'pointer'
        }}>
          <img
            src={receiptImage}
            alt="Receipt"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block',
              pointerEvents: 'auto',
              WebkitTouchCallout: 'default',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </div>
        <a
          href={receiptImage}
          download={`VelvetWhisk_Receipt_${Date.now()}.jpg`}
          style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}
        >
          ⬇️ Save Image
        </a>
      </div>
    )}
    
    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', fontSize: '0.9rem' }}>
      {isProcessing 
        ? 'Please wait while we generate your premium receipt...' 
        : 'Your delicious treats are just one step away! After clicking below, press Ctrl+V in WhatsApp to send your receipt.'
      }
    </p>

    {!isProcessing && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <button 
          onClick={onRetry}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'none', letterSpacing: '0' }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WA" style={{ width: '20px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Proceed to WhatsApp</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span className="urdu-text" style={{ fontSize: '1.1rem', marginTop: '-3px' }}>آرڈر مکمل کریں</span>
          </div>
        </button>
        
        <button 
          onClick={onClose}
          className="btn btn-outline" 
          style={{ width: '100%', padding: '0.6rem', opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>Close</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span className="urdu-text" style={{ fontSize: '1rem', marginTop: '-2px' }}>بند کریں</span>
        </button>
      </div>
    )}

    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
      @keyframes pulse { 
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.2); opacity: 0; }
      }
    `}</style>
    </div>
  </motion.div>
);

export default CartDrawer;
