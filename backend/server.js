const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const { Op } = require('sequelize');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const Comment = require('./models/comment');
const Like = require('./models/like');
const Post = require('./models/post');
const User = require('./models/user');
const { authenticate } = require('./middleware/auth');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

// Import the scheduled tasks
require('./scheduledTasks');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', authenticate, adminRoutes);

// Test auth route
app.get('/api/test-auth', authenticate, (req, res) => {
  console.log('Test auth route - req.user:', req.user);
  res.json({ user: req.user });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Handle new WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinPost', (postId) => {
    socket.join(postId);
  });

  socket.on('leavePost', (postId) => {
    socket.leave(postId);
  });

  socket.on('createComment', async (commentData) => {
    const { postId, content, parentId, userId } = commentData;
    console.log('Received createComment:', commentData);

    if (!content || !userId || !postId) {
      console.error('Invalid comment data');
      return;
    }

    try {
      const newComment = await Comment.create({
        content,
        postId,
        parentId,
        userId,
      });

      const user = await User.findByPk(userId, {
        attributes: ['id', 'username']
      });

      const commentWithDetails = {
        ...newComment.toJSON(),
        user: {
          id: user.id,
          username: user.username
        },
        likeCount: 0,
        isLikedByCurrentUser: false,
        replies: []
      };

      console.log('Emitting newComment:', commentWithDetails);
      io.to(postId).emit('newComment', commentWithDetails);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  });

  socket.on('likeComment', async ({ commentId, isLiked, userId }) => {
    console.log(`Received likeComment: commentId=${commentId}, isLiked=${isLiked}, userId=${userId}`);
    
    try {
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        console.error('Comment not found');
        return;
      }
    
      const existingLike = await Like.findOne({ where: { commentId, userId } });
      
      if (isLiked) {
        if (existingLike) {
          await Like.destroy({ where: { commentId, userId } });
        }
      } else {
        if (!existingLike) {
          await Like.create({ commentId, userId });
        }
      }
      
      const likeCount = await Like.count({ where: { commentId } });
      io.to(comment.postId).emit('updateLike', { commentId, likeCount });
    } catch (error) {
      console.error('Error handling like:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/api/comments/:postId', authenticate, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const comments = await Comment.findAll({
      where: { postId },
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
      ],
      order: [['createdAt', 'ASC']],
    });

    const processComments = (comments, parentId = null) => {
      return comments
        .filter(comment => comment.parentId === parentId)
        .map((comment) => {
          const likedUsers = comment.likes.map((like) => like.userId);
          const isLikedByCurrentUser = likedUsers.includes(userId);

          return {
            ...comment.toJSON(),
            likedUsers,
            likeCount: likedUsers.length || 0,
            isLikedByCurrentUser,
            username: comment.user.username,
            replies: processComments(comments, comment.id)
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

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Post.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        category: {
          [Op.ne]: null
        },
        status : 'Published'
      },
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { title, content, status, scheduledPublishDate, category } = req.body;
    const userId = req.user.id;

    const newPost = await Post.create({
      title,
      content,
      status,
      userId,
      scheduledPublishDate: status === 'Scheduled' ? scheduledPublishDate : null,
      category
    });

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username']
    });

    const postWithUser = {
      ...newPost.toJSON(),
      User: user
    };

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start the server
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
});