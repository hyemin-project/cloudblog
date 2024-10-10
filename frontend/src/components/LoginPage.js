import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/LoginPage.css';
import jwt_decode from 'jwt-decode';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log('Sending login request with:', { email, password });
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      console.log(response.body);
      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const decoded = jwt_decode(data.token);
        localStorage.setItem('user', JSON.stringify(decoded));
        onLogin(decoded);
        navigate('/');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">Log In</button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LoginPage;