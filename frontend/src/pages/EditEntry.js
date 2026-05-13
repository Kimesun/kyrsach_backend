import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import API from '../api';

const EditEntry = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [publishedDate, setPublishedDate] = useState('');
  const [journalId, setJournalId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [journals, setJournals] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchEntry(),
      fetchJournals(),
      fetchTags()
    ]);
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await API.get(`/entries/${id}`);
      const entry = response.data;
      setTitle(entry.title);
      setContent(entry.content);
      setIsPublic(entry.is_public);
      setPublishedDate(entry.published_date ? entry.published_date.split('T')[0] : '');
      setJournalId(entry.journal_id || '');
      setTags(entry.tags?.map(t => t.name) || []);
    } catch (err) {
      alert('Запись не найдена');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
    
    try {
      await API.put(`/entries/${id}`, {
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
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', padding: '40px 20px' }}>
        <div className="card fade-in" style={{ padding: '40px' }}>
          <Link to="/dashboard" style={{ color: '#667eea', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
            ← Назад к записям
          </Link>
          
          <h1 style={{ fontSize: '32px', marginBottom: '30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✏️ Редактирование
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label>Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label>Содержание</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label>Дата публикации</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label>Журнал/Раздел</label>
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
                  fontSize: '14px'
                }}>
                  + Управление
                </Link>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label>Теги</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  placeholder="Введите тег"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => addTag()} style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '0 20px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}>
                  + Добавить
                </button>
              </div>
              
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span>Публичная запись</span>
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Сохранение...' : '💾 Сохранить изменения'}
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

export default EditEntry;