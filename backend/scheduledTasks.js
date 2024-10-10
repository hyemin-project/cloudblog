const cron = require('node-cron');
const { Post } = require('./models');
const { Op } = require('sequelize');

const publishScheduledPosts = async () => {
  try {
    const now = new Date();
    const scheduledPosts = await Post.findAll({
      where: {
        status: 'Scheduled',
        scheduledPublishDate: {
          [Op.lte]: now
        }
      }
    });

    for (const post of scheduledPosts) {
      await post.update({
        status: 'Published',
        createdAt: post.scheduledPublishDate, // Set createdAt to the scheduled date
        scheduledPublishDate: null
      });
      console.log(`Post ${post.id} published at ${now}, createdAt set to ${post.scheduledPublishDate}`);
    }
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
  }
};

// Run the task every minute
cron.schedule('0 * * * *', publishScheduledPosts);

module.exports = { publishScheduledPosts };