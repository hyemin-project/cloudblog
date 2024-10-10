import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/PostList.css';

const PostList = ({ selectedCategory, searchTerm, user }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let url = `http://localhost:5000/api/posts?page=${currentPage}&limit=${postsPerPage}`;

      if (searchTerm) {
        url = `http://localhost:5000/api/posts/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${postsPerPage}`;
      } else if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched posts:', data);

      let publishedPosts = [];
      if (Array.isArray(data)) {
        publishedPosts = data.filter(post => post.status === 'Published');
      } else if (data && Array.isArray(data.posts)) {
        publishedPosts = data.posts.filter(post => post.status === 'Published');
      }

      setPosts(publishedPosts);
      setTotalPages(Math.ceil(publishedPosts.length / postsPerPage));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
      setPosts([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadMoreClick = (postId, postTitle) => {
    navigate(`/post/${postId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  console.log('Rendering published posts:', posts);

  return (
    <div className="post-list-container">
      <div className="post-list">
        {posts.length === 0 ? (
          <p className="no-posts">No published posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                <div className="post-footer">
                  <span className="view-count">👁 {post.readCount || 0} views</span>
                  <button
                    className="read-more-btn"
                    onClick={() => handleReadMoreClick(post.id, post.title)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;