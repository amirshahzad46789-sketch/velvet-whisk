import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AddReviewFloating from './components/AddReviewFloating';
import useStore from './store/useStore';
import { idbLoadAll } from './utils/imageDB';

const App = () => {
  const { theme, setLocalImages } = useStore();
  const navigate = React.useMemo(() => {
    // We need a way to navigate inside useEffect
    return (path) => { window.location.pathname = path; };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Secret Shortcut: Shift + Alt + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.altKey && e.code === 'KeyA') {
        window.location.href = '/admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Init store from API and setup auto-sync
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { initFromAPI } = useStore();

  useEffect(() => {
    initFromAPI().then(() => setIsLoaded(true));

    // Subscribe to store changes to auto-sync back to backend
    let timeout;
    const unsub = useStore.subscribe((state, prevState) => {
      if (
        state.products !== prevState.products || 
        state.reviews !== prevState.reviews || 
        state.orders !== prevState.orders || 
        state.kitchenStatus !== prevState.kitchenStatus
      ) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          // Try Firebase sync first
          useStore.getState().syncToFirebase();

          // Also try local dev API sync for local persistence
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products: state.products,
              reviews: state.reviews,
              orders: state.orders,
              kitchenStatus: state.kitchenStatus
            })
          }).catch(e => console.log('Local auto-sync skipped (not in dev mode)'));
        }, 800);
      }
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  if (!isLoaded) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2 className="text-gold">Loading Velvet Whisk...</h2></div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <CartDrawer />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <FloatingWhatsApp />
        <AddReviewFloating />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
