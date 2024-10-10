import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/AdminPage.css';

const AdminPage = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Draft');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setPosts(data);
      console.log('Fetched posts:', data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewPost = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: 'New Draft Post',
          content: 'Start writing your post here...',
          author: 'Admin',
          status: 'Draft'  // Changed to match the database
        })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const newPost = await response.json();
      setPosts([...posts, newPost]);
      setActiveTab('Draft');  // Changed to match the database
    } catch (error) {
      setError(error.message);
    }
  };

  const filteredPosts = posts
  .filter((post) => post.status === activeTab)
  .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a, b) => {
    if (activeTab === 'Scheduled') {
      return new Date(a.scheduledPublishDate) - new Date(b.scheduledPublishDate);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderPostDate = (post) => {
    if (post.status === 'Scheduled' && post.scheduledPublishDate) {
      return (
        <p>Scheduled for: {new Date(post.scheduledPublishDate).toLocaleString()}</p>
      );
    }
    return <p>Created: {new Date(post.createdAt).toLocaleString()}</p>;
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="admin-page">
      <div className="header">
        <h1>Posts</h1>
        <Link to="/admin/post/new">
          <button className="new-post-button">New Post</button>
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="tabs">
        {['Draft', 'Published', 'Scheduled'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab + (tab === 'Draft' ? 's' : '')}
          </button>
        ))}
      </div>

      <div className="post-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-item">
              <div
                className="post-thumbnail"
                style={{ backgroundImage: `url(${post.imageUrl || '/default-thumbnail.png'})` }}
              ></div>
              <div className="post-content">
                <h3>{post.title}</h3>
                {renderPostDate(post)}
                {post.status === 'Published' && (
                  <p>{post.readCount || 0} views</p>
                )}
                <p>Status: {post.status}</p>
                <Link to={`/admin/post/edit/${post.id}`}>
                  <button>Edit</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found for {activeTab + (activeTab === 'Draft' ? 's' : '')}.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;