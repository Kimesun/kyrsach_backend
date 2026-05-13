import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const CreateEntry = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [publishedDate, setPublishedDate] = useState('');
  const [journalId, setJournalId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [journals, setJournals] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJournals();
    fetchTags();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await API.get('/journals/');
      setJournals(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await API.get('/tags/');
      setExistingTags(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.length > 0) {
      const matches = existingTags
        .filter(tag => tag.name.toLowerCase().includes(value.toLowerCase()))
        .map(tag => tag.name);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagName) => {
    const nameToAdd = tagName || tagInput.trim();
    if (nameToAdd && !tags.includes(nameToAdd)) {
      setTags([...tags, nameToAdd]);
      setTagInput('');
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post('/entries/', {
        title,
        content,
        is_public: isPublic,
        published_date: publishedDate || null,
        journal_id: journalId || null,
        tag_names: tags
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', padding: '40px 20px' }}>
        <div className="card fade-in" style={{ padding: '40px' }}>
          <Link to="/dashboard" style={{ color: '#667eea', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
            ← Назад к записям
          </Link>
          
          <h1 style={{ fontSize: '32px', marginBottom: '30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✍️ Новая запись
          </h1>
          
          <form onSubmit={handleSubmit}>
            {/* Заголовок */}
            <div style={{ marginBottom: '24px' }}>
              <label>Заголовок <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Придумайте заголовок..."
                required
              />
            </div>
            
            {/* Содержание */}
            <div style={{ marginBottom: '24px' }}>
              <label>Содержание <span style={{ color: '#e53e3e' }}>*</span></label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Напишите что-нибудь..."
                rows={12}
                required
              />
            </div>
            
            {/* Дата публикации */}
            <div style={{ marginBottom: '24px' }}>
              <label>📅 Дата публикации</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </div>
            
            {/* Журнал */}
            <div style={{ marginBottom: '24px' }}>
              <label>📚 Журнал/Раздел</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={journalId}
                  onChange={(e) => setJournalId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Без журнала</option>
                  {journals.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.icon || '📁'} {j.name}
                    </option>
                  ))}
                </select>
                <Link to="/journals" style={{
                  background: '#f0f0f0',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#333',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}>
                  + Управление
                </Link>
              </div>
            </div>
            
            {/* Теги */}
            <div style={{ marginBottom: '24px' }}>
              <label>🏷️ Теги</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  placeholder="Введите тег и нажмите Enter или +"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  style={{ flex: 1 }}
                  list="tag-suggestions"
                />
                <datalist id="tag-suggestions">
                  {suggestions.map(s => <option key={s} value={s} />)}
                </datalist>
                <button
                  type="button"
                  onClick={() => addTag()}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '0 20px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  + Добавить
                </button>
              </div>
              
              {/* Список тегов */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        color: '#667eea',
                        padding: '6px 14px',
                        borderRadius: '25px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ✕
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                💡 Нажмите на тег, чтобы удалить его
              </p>
            </div>
            
            {/* Приватность */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span>🌍 Сделать запись публичной (доступна по ссылке)</span>
              </label>
            </div>
            
            {/* Кнопки */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : '📝 Сохранить запись'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEntry;