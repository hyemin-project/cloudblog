import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solidThumbsUp, faTrash, faEllipsisV, faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './css/Comment.css';

const CommentItem = ({ comment, onReply, onLike, onDelete, onEdit, user, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const menuRef = useRef(null);
  const userId = user?.userId || null;

  const isLikedByCurrentUser = comment.isLikedByCurrentUser;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikeClick = () => {
    if (userId) {
      onLike(comment.id, isLikedByCurrentUser);
    } else {
      alert('Please log in to like this comment.');
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    console.log("reply");
    if (userId && replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    } else if (!userId) {
      alert('Please log in to reply.');
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu((prevState) => !prevState);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSubmit = () => {
    onEdit(comment.id, editedContent);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const getUsername = () => {
    return comment.user?.username || comment.username || 'Anonymous';
  };

  const avatarInitial = getUsername().charAt(0).toUpperCase();

  const generateColor = (username) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#7986CB', '#F06292', '#9575CD', '#4DB6AC', '#FFF176'];
    
    const hash = username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const formatCommentTime = (createdAt) => {
    const now = new Date();
    const commentTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return commentTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const formattedTime = formatCommentTime(comment.createdAt);

  return (
    <div className="comment-container">
      <div className="comment">
        <div
          className="comment-avatar"
          style={{ backgroundColor: generateColor(getUsername()) }}
        >
          <span className="avatar-initial">{avatarInitial}</span>
        </div>
        <div className="comment-content">
          <strong>{getUsername()}</strong>
          <span className="comment-time">{formattedTime}</span>
          {isEditing ? (
            <div className="edit-form">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="edit-textarea"
              />
              <div className="edit-actions">
                <button onClick={handleEditSubmit} className="save-button">
                  <FontAwesomeIcon icon={faPencilAlt} /> Save
                </button>
                <button onClick={handleEditCancel} className="cancel-button">
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p>{comment.content}</p>
          )}
          <div className="comment-actions">
            <span
              className={`like-button ${isLikedByCurrentUser ? 'liked' : ''}`}
              onClick={handleLikeClick}
            >
              <FontAwesomeIcon icon={solidThumbsUp} /> {comment.likeCount || 0}
            </span>
            {!isReply && (
              <span className="reply-text" onClick={() => setShowReplyForm(!showReplyForm)} disabled={!userId}>
                Reply
              </span>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="reply-form">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
              />
              <button type="submit">Post</button>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="replies">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  user={user}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>

        {comment.userId === userId && (
          <div className="menu-container" ref={menuRef}>
            <span className="menu-icon" onClick={handleMenuToggle}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </span>
            {showMenu && (
              <div className="dropdown-menu">
                <div className="menu-item" onClick={handleEditClick}>
                  Edit
                </div>
                <div className="menu-item delete" onClick={handleDeleteClick}>
                  Delete
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;