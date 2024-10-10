const sequelize = require('./config/database');
const Post = require('./models/post');

const seedDatabase = async () => {
  await sequelize.sync({ force: true }); // This will drop existing tables and recreate them
  await Post.create({
    title: 'How to Deploy a Flask App to AWS Lambda with Zappa',
    content: 'Real-time commenting systems are a great way to engage with your audience...',
    imageUrl: 'https://example.com/image1.jpg',
    readCount: 10,
  });
  await Post.create({
    title: 'The Ultimate Guide to AWS Glue',
    content: 'Real-time commenting systems are a great way to engage with your audience...',
    imageUrl: 'https://example.com/image2.jpg',
    readCount: 10,
  });
  await Post.create({
    title: 'A Practical Guide to Kubernetes Admission Controllers',
    content: 'Real-time commenting systems are a great way to engage with your audience...',
    imageUrl: 'https://example.com/image3.jpg',
    readCount: 10,
  });
  await Post.create({
    title: 'How to Create a CI/CD Pipeline for a Node.js Application',
    content: 'Real-time commenting systems are a great way to engage with your audience...',
    imageUrl: 'https://example.com/image4.jpg',
    readCount: 10,
  });
};

seedDatabase().then(() => {
  console.log('Database seeded!');
  sequelize.close();
});
