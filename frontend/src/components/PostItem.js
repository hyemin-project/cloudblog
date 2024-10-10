import React from 'react';
import './css/PostItem.css';

const PostItem = ({ title, time, imageUrl }) => {
  return (
    <div className="post-item">
      <img src={imageUrl} alt={title} className="post-image" />
      <div className="post-details">
        <h3 className="post-title">{title}</h3>
        <p className="post-time">{time}</p>
        <button className="read-more-btn">Read More</button>
      </div>
    </div>
  );
};

export default PostItem;
