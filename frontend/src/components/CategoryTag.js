import React from 'react';
import './css/CategoryTag.css';

const CategoryTag = ({ category, onClick }) => {
  return (
    <div className="category-tag" onClick={onClick}>
      <a>{category}</a>
    </div>
  );
};

export default CategoryTag;
