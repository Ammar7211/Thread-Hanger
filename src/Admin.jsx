import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Admin.css';

// Icons
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeModal, setActiveModal] = useState(null); 
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Men', sizes: [] });
  const [imageFile, setImageFile] = useState(null);

  const availableSizes = ['XS', 'S', 'M', 'L'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/'); 
      else {
        setCheckingAuth(false);
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setProducts(prodData || []);
    setOrders(ordData || []);
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const deleteProduct = async (idToDelete) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('product_id', idToDelete);
      if (error) throw error;
      fetchData();
    } catch (err) { alert("Delete failed: " + err.message); }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order record permanently?")) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      fetchData();
    } catch (err) { alert("Delete failed: " + err.message); }
  };

  const completeOrder = async (id) => {
    const { error } = await supabase.from('orders').update({ status: 'verified' }).eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Select an image!");
    if (formData.sizes.length === 0) return alert("Select at least one size!");
    setLoading(true);

    try {
      const fileName = `${Date.now()}_${imageFile.name}`;
      await supabase.storage.from('product-images').upload(fileName, imageFile);
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from('products').insert([{ 
        name: formData.name, 
        price: parseInt(formData.price), 
        category: formData.category, 
        sizes: formData.sizes,
        image_url: urlData.publicUrl 
      }]);
      if (dbErr) throw dbErr;

      alert("Synced to Boutique!");
      setFormData({ name: '', price: '', category: 'Men', sizes: [] });
      setImageFile(null);
      fetchData();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (checkingAuth) return null;

  return (
    <div className="admin-container">
      <nav className="admin-nav"><h1 className="nav-logo">Dashboard</h1></nav>

      <main className="admin-main">
        <section className="stats-grid">
          <div className="stat-card" onClick={() => setActiveModal('inventory')}>
            <h3>Inventory Items</h3>
            <p className="stat-value">{products.length}</p>
          </div>
          <div className="stat-card" onClick={() => setActiveModal('pending')}>
            <h3>Pending Orders</h3>
            <p className="stat-value highlight">{orders.filter(o => o.status === 'pending').length}</p>
          </div>
          <div className="stat-card" onClick={() => setActiveModal('completed')}>
            <h3>Completed</h3>
            <p className="stat-value success">{orders.filter(o => o.status === 'verified').length}</p>
          </div>
        </section>

        <section className="upload-section">
          <div className="upload-card">
            <div className="card-header"><IconPlus /> <h2>Inventory Entry</h2></div>
            <form className="modern-form" onSubmit={handleUpload}>
              <div className="input-group">
                <input type="text" placeholder="Product Title" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Men">Men's Collection</option>
                  <option value="Women">Women's Collection</option>
                </select>
              </div>
              
              <div className="size-selector">
                <p>Available Sizes:</p>
                <div className="size-chips">
                  {availableSizes.map(size => (
                    <button key={size} type="button" className={`size-chip ${formData.sizes.includes(size) ? 'active' : ''}`} onClick={() => handleSizeToggle(size)}>{size}</button>
                  ))}
                </div>
              </div>

              <input type="number" placeholder="Price (PKR)" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <div className="file-box"><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Syncing..." : "Sync to Boutique"}</button>
            </form>
          </div>
        </section>

        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{activeModal.toUpperCase()}</h2>
                <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
              </div>
              <div className="modal-body">
                {activeModal === 'inventory' ? (
                  <div className="inventory-manager">
                    {['Men', 'Women'].map(cat => (
                      <div key={cat} className="cat-section">
                        <h3 className="cat-title">{cat}'s Section</h3>
                        {products.filter(p => p.category === cat).map(p => (
                          <div key={p.product_id} className="item-row">
                            <img src={p.image_url} alt="" />
                            <div className="item-meta">
                              <p className="p-name">{p.name}</p>
                              <p className="p-id">ID: {p.product_id} | Sizes: {Array.isArray(p.sizes) ? p.sizes.join(', ') : 'N/A'}</p>
                            </div>
                            <p className="p-price">PKR {p.price}</p>
                            <button className="del-btn" onClick={() => deleteProduct(p.product_id)}><IconTrash /></button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="orders-manager">
                    {orders.filter(o => activeModal === 'pending' ? o.status === 'pending' : o.status === 'verified').map(o => (
                      <div key={o.id} className="order-rectangle">
                        <div className="order-main-info">
                          <p className="customer-tag"><strong>{o.customer_name}</strong> | {o.phone}</p>
                          <p className="address-tag">{o.address}</p>
                        </div>
                        <div className="order-sub-info">
                          <p>Prod ID: {o.product_id}</p>
                          <p>Size: {o.size}</p>
                          <p className={`status-pill ${o.status}`}>{o.status}</p>
                        </div>
                        <div className="order-actions">
                          {o.status === 'pending' && (
                            <button className="done-btn" onClick={() => completeOrder(o.id)}><IconCheck /> Complete</button>
                          )}
                          <button className="order-del-btn" onClick={() => deleteOrder(o.id)}><IconTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="admin-sidebar-bottom">
          <button className="logout-btn-red" onClick={() => signOut(auth)}><IconLogout /> <span>LOGOUT</span></button>
        </div>
      </main>
    </div>
  );
}