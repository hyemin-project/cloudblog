import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import ReactQuill from 'react-quill';
import "react-datepicker/dist/react-datepicker.css";
import 'react-quill/dist/quill.snow.css';
import './css/PostForm.css';

const EditPostPage = () => {
  const [post, setPost] = useState({ title: '', content: '', status: '', category: '' });
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef();

  const categories = ['Technology', 'Programming', 'Cloud', 'DevOps', 'AI/ML', 'Other'];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data);
      if (data.status === 'Scheduled' && data.scheduledPublishDate) {
        setScheduledDate(new Date(data.scheduledPublishDate));
      }
      if (!categories.includes(data.category)) {
        setCustomCategory(data.category || '');
      }
    } catch (error) {
      setError('Error fetching post: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    if (date < new Date()) {
      setError('Scheduled date must be in the future');
    } else {
      setError('');
      setScheduledDate(date);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prevPost => ({ ...prevPost, [name]: value }));

    if (name === 'status' && value === 'Scheduled') {
      setScheduledDate(scheduledDate || new Date());
    } else if (name === 'status' && value !== 'Scheduled') {
      setScheduledDate(null);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setPost(prevPost => ({ ...prevPost, category: customCategory }));
    } else {
      setPost(prevPost => ({ ...prevPost, category: value }));
      setCustomCategory('');
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setPost(prevPost => ({ ...prevPost, category: value }));
  };

  const handleContentChange = (content) => {
    setPost(prevPost => ({ ...prevPost, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          status: post.status,
          category: post.category,
          scheduledPublishDate: post.status === 'Scheduled' ? scheduledDate.toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      
      alert('Post updated successfully!');
      navigate('/admin');

    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="post-form-page">
      <h1>Edit Post</h1>
      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={categories.includes(post.category) ? post.category : 'custom'}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
            <option value="custom">Custom Category</option>
          </select>
        </div>
        {!categories.includes(post.category) && (
          <div className="form-group">
            <label htmlFor="customCategory">Custom Category:</label>
            <input
              type="text"
              id="customCategory"
              name="customCategory"
              value={customCategory}
              onChange={handleCustomCategoryChange}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={post.content || ''}
            onChange={handleContentChange}
            modules={{
              toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{size: []}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, 
                 {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image', 'video'],
                ['clean']
              ],
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={post.status || ''}
            onChange={handleInputChange}
            required
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
        {post.status === 'Scheduled' && (
          <div className="form-group">
            <label htmlFor="scheduledDate">Scheduled Publish Date (Your Local Time):</label>
            <DatePicker
              selected={scheduledDate}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy HH:mm"
              className="form-control"
              minDate={new Date()}
              aria-label="Select date and time for scheduled publishing"
            />
            <div></div>
            <small className="form-text text-muted">
              Select the future date and time when you want this post to be automatically published.
            </small>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
};

export default EditPostPage;