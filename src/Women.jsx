import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Women.css';

// --- FIXED SVG ICONS ---
const IconBack = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const IconBag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export default function Women() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bag, setBag] = useState([]);
  const [showSizeModal, setShowSizeModal] = useState(null); 
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ name: '', phone: '', address: '' });
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchWomenProducts();
    const savedBag = JSON.parse(localStorage.getItem('boutique_bag')) || [];
    setBag(savedBag);
  }, []);

  async function fetchWomenProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('category', 'Women');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  }

  const addToBag = (size) => {
    const newItem = { ...showSizeModal, selectedSize: size, tempId: Date.now() };
    const updatedBag = [...bag, newItem];
    setBag(updatedBag);
    localStorage.setItem('boutique_bag', JSON.stringify(updatedBag));
    setShowSizeModal(null);
  };

  const removeFromBag = (tempId) => {
    const updatedBag = bag.filter(item => item.tempId !== tempId);
    setBag(updatedBag);
    localStorage.setItem('boutique_bag', JSON.stringify(updatedBag));
    if (updatedBag.length === 0) setShowCheckout(false);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const orderRows = bag.map(item => ({
        product_id: item.product_id,
        customer_name: orderInfo.name,
        phone: orderInfo.phone,
        address: orderInfo.address,
        size: item.selectedSize,
        status: 'pending'
      }));

      const { error } = await supabase.from('orders').insert(orderRows);
      if (error) throw error;

      alert("Order Placed Successfully!");
      setBag([]);
      localStorage.removeItem('boutique_bag');
      setShowCheckout(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateTotal = () => bag.reduce((acc, item) => acc + parseInt(item.price), 0);

  return (
    <div className="women-page">
      <nav className="collection-nav">
        <button className="back-circle-btn" onClick={() => navigate('/')}>
          <IconBack />
        </button>
        <h1 className="collection-logo">Thread and Hanger <span>WOMEN</span></h1>
        
        <div className="bag-container" onClick={() => bag.length > 0 && setShowCheckout(true)}>
          <IconBag />
          {bag.length > 0 && <span className="bag-count">{bag.length}</span>}
        </div>
      </nav>

      <main className="collection-container">
        {loading ? (
          <div className="loading-state"><div className="shimmer"></div><p>Curating Collection...</p></div>
        ) : (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((item) => (
                <div key={item.product_id} className="product-card">
                  <div className="image-frame">
                    <img src={item.image_url} alt={item.name} loading="lazy" />
                    <div className="hover-overlay">
                      <button className="quick-add" onClick={() => setShowSizeModal(item)}>ADD TO BAG</button>
                    </div>
                  </div>
                  <div className="product-meta">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">PKR {parseInt(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h2>Women's Collection Coming Soon</h2>
                <p>We are currently updating our seasonal inventory.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SIZE MODAL */}
      {showSizeModal && (
        <div className="modal-overlay" onClick={() => setShowSizeModal(null)}>
          <div className="modal-content size-modal animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-inner">
              <h3>Select Size</h3>
              <p className="item-subname">{showSizeModal.name}</p>
              <div className="size-options">
                {showSizeModal.sizes?.map(size => (
                  <button key={size} onClick={() => addToBag(size)}>{size}</button>
                ))}
              </div>
              <button className="cancel-text-btn" onClick={() => setShowSizeModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(null)}>
          <div className="modal-content checkout-modal animate-pop" onClick={e => e.stopPropagation()}>
            <h2>Your Bag</h2>
            <div className="bag-summary">
              {bag.map(item => (
                <div key={item.tempId} className="summary-item">
                  <div className="item-details">
                    <span className="summary-name">{item.name}</span>
                    <span className="summary-size">Size: {item.selectedSize}</span>
                  </div>
                  <div className="item-actions">
                    <span className="summary-price">PKR {item.price}</span>
                    <button className="bag-del-btn" onClick={() => removeFromBag(item.tempId)}><IconTrash /></button>
                  </div>
                </div>
              ))}
              <div className="total-row">
                <strong>Total:</strong>
                <strong>PKR {calculateTotal().toLocaleString()}</strong>
              </div>
            </div>
            <form onSubmit={handleCheckout} className="checkout-form">
              <input type="text" placeholder="Full Name" required onChange={e => setOrderInfo({...orderInfo, name: e.target.value})} />
              <input type="tel" placeholder="Phone Number" required onChange={e => setOrderInfo({...orderInfo, phone: e.target.value})} />
              <textarea placeholder="Delivery Address" required onChange={e => setOrderInfo({...orderInfo, address: e.target.value})} />
              <button type="submit" className="confirm-btn" disabled={orderLoading}>
                {orderLoading ? "Processing..." : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}