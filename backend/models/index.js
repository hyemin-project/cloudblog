const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// Import your models here
const Post = require('./post');
const Comment = require('./comment');
const User = require('./user');
const Like = require('./like');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Post = Post;
db.Comment = Comment;
db.User = User;
db.Like = Like;

// Set up associations
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parentComment' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Association for Likes, with proper alias consistency
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// Optionally add other associations here (already declared above, so no need to duplicate)
// User.hasMany(Comment, { foreignKey: 'userId' }); // Already declared
// Comment.belongsTo(User, { foreignKey: 'userId' }); // Already declared

module.exports = db;
