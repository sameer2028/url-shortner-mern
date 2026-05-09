import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import '../App.css';

const UrlForm = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);

  const [analyticsId, setAnalyticsId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  // Check if user is logged in by looking for a token in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);
const navigate = useNavigate(); // <-- Add this
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload(); // Refresh to reset state
  };

  const handleShortenSubmit = async (e) => {
    e.preventDefault();
    setIsShortening(true);
    try {
    const API_URL = import.meta.env.VITE_API_URL;
   const response = await axios.post(`${API_URL}/url`, { url: longUrl });
      setShortUrl(`http://localhost:5000/${response.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setIsShortening(false);
    }
  };

  const handleAnalyticsSubmit = async (e) => {
    if (!isLoggedIn) return; // Extra safety check
    e.preventDefault();
    setIsFetchingAnalytics(true);
    const cleanId = analyticsId.split('/').pop();

    try {
      const response = await axios.get(`http://localhost:5000/url/analytics/${cleanId}`);
      setAnalyticsData(response.data);
    } catch (err) {
      alert('Could not find analytics for that ID.');
    } finally {
      setIsFetchingAnalytics(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "shortly-qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <nav className="top-nav">
        <h1 className="brand">Short<span>.ly</span></h1>
        <div className="nav-links">
          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
          ) : (
            <>
              {/* Note: We will hook these up to React Router in the next step */}
              <button className="btn btn-outline" onClick={() => navigate('/login')}>Log In</button>
                <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      <main className="dashboard-container">
        
        {/* Left Side: Shorten Link (Public) */}
        <div className="feature-card">
          <h2>Create a Short Link</h2>
          <p className="card-desc">Paste your long, messy link below to generate a clean, shareable short URL.</p>
          
          <form onSubmit={handleShortenSubmit} className="form-row">
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com/your-very-long-link..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={isShortening}>
              {isShortening ? '...' : 'Shorten'}
            </button>
          </form>

          {/* --- NEW: Try an example link --- */}
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have a link right now?{' '}
            <button 
              type="button" 
              onClick={() => setLongUrl('https://en.wikipedia.org/wiki/URL_shortening#Additional_layer_of_complexity')}
              style={{ 
                background: 'none', border: 'none', color: 'var(--accent)', 
                cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' 
              }}
            >
              Try an example
            </button>
          </div>
          {/* -------------------------------- */}

         
          {shortUrl && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="result-box">
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="shortened-link">
                  {shortUrl}
                </a>
                <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(shortUrl)}>
                  Copy
                </button>
              </div>

              {/* LOCK SECTION: QR Code */}
              <div className="qr-container">
                {isLoggedIn ? (
                  <>
                    <div className="qr-wrapper">
                      <QRCodeCanvas id="qr-gen" value={shortUrl} size={160} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={downloadQRCode}>Download QR Code</button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>🔒 Login to unlock QR Codes for your links.</p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>Log in to Unlock</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Analytics (Protected) */}
        <div className="feature-card">
          <h2>Track Performance</h2>
          <p className="card-desc">Enter your short link ID to see real-time click analytics and visitor history.</p>
          
          {/* LOCK SECTION: Analytics Form */}
          {!isLoggedIn ? (
            <div style={{ 
              marginTop: '2rem', 
              padding: '2rem', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ marginTop: 0 }}>Analytics Locked 🔒</h3>
              <p className="card-desc">Create a free account to track total engagements and detailed visitor timestamps.</p>
             <button className="btn btn-primary" onClick={() => navigate('/login')}>Log In Now</button>
            </div>
          ) : (
            // The original Analytics UI if logged in
            <>
              <form onSubmit={handleAnalyticsSubmit} className="form-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter Short ID (e.g. bJjyQt)"
                  value={analyticsId}
                  onChange={(e) => setAnalyticsId(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={isFetchingAnalytics}>
                  {isFetchingAnalytics ? '...' : 'Track'}
                </button>
              </form>

              {/* ... Rest of your existing analytics display logic (Total Clicks, Timestamp array) goes here ... */}
               {analyticsData && (
                <>
                  <div className="stats-container">
                    <p className="card-desc" style={{ marginBottom: 0 }}>Total Engagements</p>
                    <p className="click-count">{analyticsData.totalClicks}</p>
                  </div>
    
                  {analyticsData.totalClicks > 0 && (
                    <div className="visitor-log">
                      <p className="log-header">Recent Visitor Timestamps</p>
                      <ul className="log-list">
                        {analyticsData.analytics.slice().reverse().map((visit, index) => (
                          <li key={index} className="log-item">
                            <span className="log-index">Click #{analyticsData.totalClicks - index}</span>
                            <span className="log-time">
                              {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                              <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.8rem' }}>
                                {new Date(visit.timestamp).toLocaleDateString()}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

      </main>
    </>
  );
};

export default UrlForm;