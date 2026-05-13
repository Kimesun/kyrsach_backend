import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';

const EntryDetail = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await API.get(`/entries/${id}`);
      setEntry(response.data);
    } catch (err) {
      alert('Запись не найдена');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!entry) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <Link to="/dashboard" style={{ color: '#667eea' }}>← Назад</Link>
      <h1>{entry.title}</h1>
      <p style={{ color: '#888' }}>{new Date(entry.created_at).toLocaleDateString()}</p>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{entry.content}</div>
      <div style={{ marginTop: '30px' }}>
        <Link to={`/edit/${entry.id}`} style={{ color: '#667eea' }}>✏️ Редактировать</Link>
      </div>
    </div>
  );
};

export default EntryDetail;