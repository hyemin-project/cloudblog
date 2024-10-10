import React, { useState, useEffect,useRef } from 'react';
import { Link } from 'react-router-dom';
import CategoryTag from './CategoryTag';
import PostList from './PostList';
import SearchBar from './SearchBar';
import Footer from './Footer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './css/HomePage.css';

const HomePage = ({ user, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [latestPosts, setLatestPosts] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const findSectionRef = useRef(null);

  useEffect(() => {
    // Fetch categories and latest posts
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchLatestPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts?limit=10');
        const data = await response.json();
        const publishedPosts = data.filter(post => post.status === 'Published');
        setLatestPosts(publishedPosts);
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      }
    };

    fetchCategories();
    fetchLatestPosts();

    // Handle responsive slider
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setSlidesToShow(3);
      } else if (window.innerWidth > 768) {
        setSlidesToShow(3);
      } else if (window.innerWidth > 480) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Run on initial load

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSelectedCategory(null);
  };

  const handleGetStarted = () => {
    findSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };


  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="home-page">
      <div className="banner">
        <div className="highlight-banner">Over 1 million tech insights and articles!</div>
        <h1 className="page-title">The world's destination<br />for tech insights and innovation</h1>
        <p className="page-subtitle">Discover the latest trends, guides, and expert opinions in software development, cloud computing, and beyond.</p>
        <button onClick={handleGetStarted} className="cta-button">Get started</button>
      </div>

      <div className="latest-posts-slider">
        <Slider {...sliderSettings}>
          {latestPosts.map((post, index) => (
            <div key={index} className="post-slide">
              <div className="slide-image-container">
                <img src={post.imageUrl} alt={post.title} className="slide-image" />
                <div className="slide-overlay">
                  <div className="slide-title">{post.title}</div>
                  <Link to={`/post/${post.id}`} className="read-more">Read More</Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="content-wrapper" ref={findSectionRef}>
        <h2 className="find-title"></h2>
        <SearchBar onSearch={handleSearch} />
        <div className="main-content">
          <section className="posts-section">
            <PostList selectedCategory={selectedCategory} searchTerm={searchTerm} />
          </section>
          <aside className="categories-sidebar">
            <div className="categories-container">
              <h2 className="categories-title">Categories</h2>
              <div className="categories-list">
                {categories.map((category, index) => (
                  <CategoryTag
                    key={index}
                    category={category}
                    onClick={() => handleCategoryClick(category)}
                    isSelected={selectedCategory === category}
                  />
                ))}
              </div>
            </div>
            <div className="marketing-card">
              <h3 className="marketing-title">Marketing Home</h3>
              <p>Have a marketing request?</p>
              <a href="/social-media-request" className="marketing-link">Social media request</a>
              <a href="/email-request" className="marketing-link">Email request</a>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;