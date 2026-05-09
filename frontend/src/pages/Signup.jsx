import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/signup', { email, password });
      alert('Account created successfully! Please log in.');
      navigate('/login'); // Redirect to login page on success
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="feature-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Join Short.ly</h2>
        <p className="card-desc" style={{ textAlign: 'center' }}>Create a free account to unlock analytics.</p>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            className="input-field"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;