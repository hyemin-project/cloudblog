const express = require('express');
const router = express.Router();
const { Comment, Like, User } = require('../models');


// Route to get all comments for a post, including likes and replies
router.get('/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.query.userId;

    const comments = await Comment.findAll({
      where: { postId, parentId: null },
      order: [['createdAt', 'ASC']],
      include: [
        { 
          model: Comment, 
          as: 'replies', 
          include: [
            { model: Like, as: 'likes' },
            { model: User, as: 'user', attributes: ['id', 'username'] }
          ],
          separate: true,
          order: [['createdAt', 'ASC']]
        },
        { model: Like, as: 'likes' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    const processComments = (comments) => {
      return comments.map((comment) => {
        const commentJSON = comment.toJSON();
        const likedUsers = comment.likes.map((like) => like.userId);
        const isLikedByCurrentUser = likedUsers.includes(parseInt(userId, 10));
        
        return {
          ...commentJSON,
          likedUsers,
          likeCount: likedUsers.length || 0,
          isLikedByCurrentUser,
          replies: comment.replies ? processComments(comment.replies) : []
        };
      });
    };

    const commentsWithLikes = processComments(comments);

    res.json(commentsWithLikes);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to create a new comment or reply
router.post('/', async (req, res) => {
  try {
    const { postId, content, parentId, userId } = req.body;

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({ postId, content, parentId, userId });
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username'],
    });

    const commentWithUser = {
      ...comment.toJSON(),
      user: {
        id: user.id,
        username: user.username,
      },
      likeCount: 0,
      isLikedByCurrentUser: false,
      replies: []
    };

    res.json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to like/unlike a comment
router.post('/like', async (req, res) => {
  try {
    const { commentId, userId, isLiked } = req.body;
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user already liked the comment
    const existingLike = await Like.findOne({ where: { commentId, userId } });

    if (isLiked && existingLike) {
      // If the user is unliking the comment, delete the like entry
      await Like.destroy({ where: { commentId, userId } });
    } else if (!isLiked && !existingLike) {
      // If the user is liking the comment, create a new like entry
      await Like.create({ commentId, userId });
    }

    // Calculate the new like count
    const likeCount = await Like.count({ where: { commentId } });
    res.json({ commentId, likeCount });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete a comment
router.delete('/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  console.log(`Attempting to delete comment with ID: ${commentId} by user: ${userId}`); // Log for debugging
  
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      console.log('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      console.log('User does not have permission to delete this comment');
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'An error occurred while deleting the comment' });
  }
});

// Route to edit a comment or reply
router.put('/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content, userId } = req.body;

  console.log(`Attempting to edit comment with ID: ${commentId} by user: ${userId}`); // Log for debugging
  
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      console.log('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      console.log('User does not have permission to edit this comment');
      return res.status(403).json({ error: 'You do not have permission to edit this comment' });
    }

    comment.content = content;
    await comment.save();

    // Fetch the updated comment with user information
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: {
        ...updatedComment.toJSON(),
        user: {
          id: updatedComment.user.id,
          username: updatedComment.user.username
        }
      }
    });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ error: 'An error occurred while editing the comment' });
  }
});

module.exports = router;
