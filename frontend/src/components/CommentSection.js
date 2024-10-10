import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import CommentItem from './CommentItem';
import './css/Comment.css';

const CommentSection = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const userId = user?.userId || null;
  const username = user?.username || 'Anonymous';
  const socketRef = useRef();

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${postId}?userId=${userId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [postId, userId]);

  const handleDelete = async (commentId) => {
    console.log(`Attempting to delete comment with ID: ${commentId}`);
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
  
      if (response.ok) {
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      } else {
        console.error('Failed to delete the comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent, userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to edit comment');
      }
      
      const result = await response.json();
      console.log(result.message);

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: newContent };
          }
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, content: newContent } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleCommentSubmit = (e, parentId = null, replyText = null) => {
    e.preventDefault();
    
    const commentContent = replyText || newComment;
    
    if (commentContent.trim() && userId) {
      const tempId = 'temp-' + Math.random().toString(36).substr(2, 9);

      console.log('Submitting comment:', { postId, content: commentContent, parentId, userId, username, tempId });

      socketRef.current.emit('createComment', {
        postId,
        content: commentContent,
        parentId,
        userId,
        username,
        tempId
      });

      if (!replyText) {
        setNewComment('');
      }
    } else if (!userId) {
      alert('Please log in to comment.');
    }
  };

  const handleReply = (parentId, replyText) => {
    handleCommentSubmit({ preventDefault: () => {} }, parentId, replyText);
  };

  const handleLike = (commentId, isLiked) => {
    if (!userId) {
      alert('Please log in to like a comment.');
      return;
    }

    socketRef.current.emit('likeComment', { commentId, isLiked, userId });

    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
            isLikedByCurrentUser: !isLiked
          };
        }

        const updatedReplies = comment.replies.map((reply) =>
          reply.id === commentId
            ? {
                ...reply,
                likeCount: isLiked ? reply.likeCount - 1 : reply.likeCount + 1,
                isLikedByCurrentUser: !isLiked
              }
            : reply
        );
        return { ...comment, replies: updatedReplies };
      })
    );
  };

  useEffect(() => {
    fetchComments();
  
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinPost', postId);
  
    const handleNewComment = (comment) => {
      console.log('Received new comment:', comment);
      setComments((prevComments) => {
        const commentExists = prevComments.some(c => c.id === comment.id || c.id === comment.tempId);
        if (commentExists) {
          return prevComments.map(c => 
            (c.id === comment.tempId || c.id === comment.id) ? { ...comment, id: comment.id } : c
          );
        }

        if (comment.parentId) {
          return prevComments.map(parentComment =>
            parentComment.id === comment.parentId
              ? { ...parentComment, replies: [...(parentComment.replies || []), comment] }
              : parentComment
          );
        }

        return [...prevComments, comment];
      });
    };

    const handleUpdateLike = (updatedComment) => {
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment.id === updatedComment.commentId) {
            return { ...comment, likeCount: updatedComment.likeCount ?? 0, isLikedByCurrentUser: updatedComment.isLikedByCurrentUser };
          }
    
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === updatedComment.commentId 
              ? { ...reply, likeCount: updatedComment.likeCount ?? 0, isLikedByCurrentUser: updatedComment.isLikedByCurrentUser } 
              : reply
          );
          return { ...comment, replies: updatedReplies };
        });
      });
    };

    const handleEditComment = (editedComment) => {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === editedComment.id) {
            return { ...comment, ...editedComment };
          }
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === editedComment.id ? { ...reply, ...editedComment } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
    };

    socketRef.current.on('newComment', handleNewComment);
    socketRef.current.on('updateLike', handleUpdateLike);
    socketRef.current.on('editComment', handleEditComment);
    
    return () => {
      socketRef.current.emit('leavePost', postId);
      socketRef.current.off('newComment', handleNewComment);
      socketRef.current.off('updateLike', handleUpdateLike);
      socketRef.current.off('editComment', handleEditComment);
      socketRef.current.disconnect();
    };
  }, [postId, userId, fetchComments]);

  return (
    <div className="comment-section">
      <h2>Comments</h2>
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
              user={user}
            />
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </ul>
      <form onSubmit={(e) => handleCommentSubmit(e)}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          disabled={!userId}
        />
        <button type="submit" disabled={!userId}>Post</button>
      </form>
    </div>
  );
};

export default CommentSection;