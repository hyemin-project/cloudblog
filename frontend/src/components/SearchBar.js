import React, { useState, useEffect, useRef } from 'react';
import './css/SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    fetchSuggestions('');
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      let url = 'http://localhost:5000/api/posts';
      if (query.length > 2) {
        url += `/search?searchTerm=${encodeURIComponent(query)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(data.map(post => post.title));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length === 0 || query.length > 2) {
      fetchSuggestions(query);
    }
    setShowSuggestions(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <h2 className="search-title">FIND</h2>
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          <button className="close-suggestions" onClick={closeSuggestions}>×</button>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;