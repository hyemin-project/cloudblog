import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './css/Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        {/* Conditionally render the Manage tab if the user is an admin */}
        {user && user.role === 'admin' && (
          <a href="/admin">Manage</a>
        )}
        <a href="/">Blog</a>
      </div>
      <nav className="header-nav">
        <Link to="/" className="logo">
          Cloud Blog
        </Link>
      </nav>
      <div className="header-right">
        {user ? (
          <>
            <span className="username">{user.username}</span>
            <button onClick={onLogout} className="button button-secondary">Log out</button>
          </>
        ) : (
          <>
            <button className="button button-secondary" onClick={() => navigate('/login')}>Log in</button>
            <button className="button button-primary" onClick={() => navigate('/register')}>Sign up</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
