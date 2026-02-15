import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, BrowserRouter as Router } from 'react-router-dom';
import { auth } from './firebase'; 
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Admin from './Admin';
import Men from './Men';
import Women from './Women';
import './App.css';

// SVG Icons
const IconLocation = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const IconAdmin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

// --- HOMEPAGE COMPONENT ---
function HomePage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      navigate('/admin');
    } catch (err) {
      setError('Invalid Admin Credentials');
    }
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="header-content">
          <div className="logo-container">
            <img src="logo.png" alt="Logo" className="site-logo" onClick={() => navigate('/')} />
          </div>
          <div className="header-links">
            <span onClick={() => navigate('/men')}>MEN</span>
            <span onClick={() => navigate('/women')}>WOMEN</span>
          </div>
        </div>
      </header>

      <main className="main-display">
        <div 
          className={`photo-box men-bg ${hovered === 'men' ? 'expand' : ''}`} 
          onMouseEnter={() => setHovered('men')} 
          onMouseLeave={() => setHovered(null)}
        >
          <div className="photo-label">
            <h2>MEN</h2>
            <button className="view-btn" onClick={() => navigate('/men')}>VIEW COLLECTION</button>
          </div>
          <div className="photo-overlay"></div>
        </div>

        <div 
          className={`photo-box women-bg ${hovered === 'women' ? 'expand' : ''}`} 
          onMouseEnter={() => setHovered('women')} 
          onMouseLeave={() => setHovered(null)}
        >
          <div className="photo-label">
            <h2>WOMEN</h2>
            <button className="view-btn" onClick={() => navigate('/women')}>VIEW COLLECTION</button>
          </div>
          <div className="photo-overlay"></div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-contact-row">
            <div className="footer-item"><IconLocation /> <span>Liberty Market, Lahore, Pakistan</span></div>
            <div className="footer-item"><IconPhone /> <span>+92 300 1234567</span></div>
          </div>
          <div className="footer-button-row">
            <button className="admin-footer-btn" onClick={() => setShowLogin(true)}>
              <IconAdmin /> <span>ADMIN PANEL</span>
            </button>
          </div>
        </div>
      </footer>

      {showLogin && (
        <div className="login-overlay">
          <div className="login-modal animate-in">
            <h3>Admin Access</h3>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Admin Email" required onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" required onChange={e => setPassword(e.target.value)} />
              {error && <p className="login-error">{error}</p>}
              <div className="login-actions">
                <button type="button" onClick={() => setShowLogin(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="login-btn">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/admin" element={user ? <Admin /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}