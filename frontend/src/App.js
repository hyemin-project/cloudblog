import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import PostPage from './components/PostPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import Header from './components/Header';
import NewPostPage from './components/NewPostPage';
import EditPostPage from './components/EditPostPage';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user data from localStorage
    localStorage.removeItem('token'); // Remove the token on logout
  };

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/post/:id" element={<PostPage user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/post/edit/:id" element={<EditPostPage />} />
          <Route path="/admin/post/new" element={<NewPostPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
