import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import API from '../api';

const ManageJournals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#667eea',
    icon: '📁'
  });
  const navigate = useNavigate();

  const iconOptions = ['📁', '📘', '📖', '✏️', '💭', '⭐', '❤️', '🎯', '💡', '🎨', '🏠', '💼', '🎓', '🏃', '🍕'];

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await API.get('/journals/');
      setJournals(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Введите название журнала');
      return;
    }

    try {
      if (editingId) {
        await API.put(`/journals/${editingId}`, formData);
      } else {
        await API.post('/journals/', formData);
      }
      setFormData({ name: '', description: '', color: '#667eea', icon: '📁' });
      setShowForm(false);
      setEditingId(null);
      fetchJournals();
    } catch (err) {
      alert('Ошибка при сохранении журнала');
    }
  };

  const handleEdit = (journal) => {
    setFormData({
      name: journal.name,
      description: journal.description || '',
      color: journal.color,
      icon: journal.icon || '📁'
    });
    setEditingId(journal.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Удалить журнал "${name}"? Записи из этого журнала останутся без категории.`)) {
      try {
        await API.delete(`/journals/${id}`);
        fetchJournals();
      } catch (err) {
        alert('Ошибка при удалении');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', color: '#667eea', icon: '📁' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
        <div className="card fade-in" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <Link to="/dashboard" style={{ color: '#667eea', textDecoration: 'none', display: 'inline-block', marginBottom: '10px' }}>
                ← Назад к записям
              </Link>
              <h1 style={{ fontSize: '32px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📚 Журналы и разделы
              </h1>
              <p style={{ color: '#666', marginTop: '8px' }}>
                Организуйте записи по тематическим разделам
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                + Создать журнал
              </button>
            )}
          </div>

          {/* Форма создания/редактирования */}
          {showForm && (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '30px',
              animation: 'fadeInUp 0.3s ease'
            }}>
              <h3 style={{ marginBottom: '20px' }}>
                {editingId ? '✏️ Редактировать журнал' : '📝 Новый журнал'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label>Название *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: Личный дневник, Рабочие заметки"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание журнала..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label>Цвет</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ width: '60px', height: '50px', padding: '5px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      Выберите цвет для оформления
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label>Иконка</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        style={{
                          fontSize: '28px',
                          padding: '10px',
                          width: '55px',
                          height: '55px',
                          border: formData.icon === icon ? `3px solid ${formData.color}` : '2px solid #e0e0e0',
                          borderRadius: '12px',
                          background: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary">
                    {editingId ? '💾 Сохранить' : '✨ Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      background: '#f0f0f0',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Список журналов */}
          {journals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: '#f8f9fa',
              borderRadius: '20px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                У вас пока нет журналов
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Создать первый журнал
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {journals.map(journal => (
                <div
                  key={journal.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${journal.color}30`,
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Цветная полоска */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '5px',
                    background: journal.color
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '32px' }}>{journal.icon || '📁'}</span>
                        <h3 style={{ fontSize: '20px', color: '#333', margin: 0 }}>{journal.name}</h3>
                      </div>
                      {journal.description && (
                        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>{journal.description}</p>
                      )}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '15px' }}>
                        <span style={{
                          background: journal.color + '15',
                          color: journal.color,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          📝 {journal.entries?.length || 0} записей
                        </span>
                        <span style={{ fontSize: '12px', color: '#aaa' }}>
                          Создан: {new Date(journal.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleEdit(journal)}
                        style={{
                          background: '#f0f0f0',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(journal.id, journal.name)}
                        style={{
                          background: '#fee',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          color: '#e53e3e',
                          fontSize: '14px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageJournals;