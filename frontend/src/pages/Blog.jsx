import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1>Blog</h1>
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {blogs.map((blog) => (
            <article key={blog.id} className="card">
              <h2>{blog.title}</h2>
              <p style={{ color: '#666', marginBottom: '15px' }}>{blog.summary}</p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                By {blog.author} • {new Date(blog.publishedAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;

