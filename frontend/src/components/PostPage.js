import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import DOMPurify from 'dompurify';
import './css/PostPage.css';

const PostPage = ({ user }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost(id);
  }, [id]);

  useEffect(() => {
    fetchRecentPosts(currentPage);
  }, [currentPage]);

  const fetchPost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchRecentPosts = async (page) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/recent?page=${page}&limit=5`);
      const data = await response.json();
      setRecentPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="loading-message">Loading...</div>;

  return (
    <div className="post-page-container">
      <div className="back-arrow" onClick={() => navigate('/')}>
        ← Back
      </div>

      <div className="post-page">
      <aside className="sidebar">
        <h2 className="sidebar-title">Recent Posts</h2>
        <ul className="recent-posts-list">
          {recentPosts.map((recentPost) => (
            <li
              key={recentPost.id}
              className={parseInt(id) === recentPost.id ? 'active recent-post-item' : 'recent-post-item'}
            >
              <Link to={`/post/${recentPost.id}`} className="recent-post-link">
                {recentPost.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-indicator">{currentPage} / {totalPages}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </aside>

        <div className="post-content">
          <div className="post-category">
            {post.category && <p>{post.category}</p>}
          </div>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="view-count">👁 {post.readCount || 0} views</p>
          {post.imageUrl && (
            <div className="post-image-container">
              <img src={post.imageUrl} alt={post.title} className="post-image" />
            </div>
          )}
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content),
            }}
            className="post-text-content"
          />
          <CommentSection postId={id} user={user} />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
