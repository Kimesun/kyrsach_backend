import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EntryCard from '../components/EntryCard';
import Loader from '../components/Loader';
import API from '../api';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    privacy: 'all',
    journalId: '',
    tagId: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, entries]);

  const fetchData = async () => {
    try {
      const [entriesRes, journalsRes, tagsRes] = await Promise.all([
        API.get('/entries/'),
        API.get('/journals/'),
        API.get('/tags/')
      ]);
      setEntries(entriesRes.data);
      setJournals(journalsRes.data);
      setAllTags(tagsRes.data);
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

  const applyFilters = () => {
    let filtered = [...entries];
    
    if (filters.privacy === 'public') {
      filtered = filtered.filter(e => e.is_public);
    } else if (filters.privacy === 'private') {
      filtered = filtered.filter(e => !e.is_public);
    }
    
    if (filters.journalId) {
      filtered = filtered.filter(e => e.journal_id === parseInt(filters.journalId));
    }
    
    if (filters.tagId) {
      filtered = filtered.filter(e => e.tags?.some(t => t.id === parseInt(filters.tagId)));
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        e.content.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(e => new Date(e.published_date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(e => new Date(e.published_date) <= new Date(filters.endDate));
    }
    
    setFilteredEntries(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await API.delete(`/entries/${id}`);
        fetchData();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      privacy: 'all',
      journalId: '',
      tagId: '',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) return <Loader />;

  const stats = {
    total: entries.length,
    public: entries.filter(e => e.is_public).length,
    private: entries.filter(e => !e.is_public).length
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '30px 20px' }}>
        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px' }}>📝</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Всего записей</div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px' }}>🌍</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>{stats.public}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Публичных</div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px' }}>🔒</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e' }}>{stats.private}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Приватных</div>
          </div>
        </div>

        {/* Кнопка фильтров */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary"
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🔍 {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>

        {/* Фильтры */}
        {showFilters && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '30px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Фильтры и поиск</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <input
                type="text"
                placeholder="🔎 Поиск по записям..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              
              <select
                value={filters.privacy}
                onChange={(e) => setFilters({ ...filters, privacy: e.target.value })}
              >
                <option value="all">📋 Все записи</option>
                <option value="public">🌍 Публичные</option>
                <option value="private">🔒 Приватные</option>
              </select>
              
              <select
                value={filters.journalId}
                onChange={(e) => setFilters({ ...filters, journalId: e.target.value })}
              >
                <option value="">📚 Все журналы</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>{j.icon} {j.name}</option>
                ))}
              </select>
              
              <select
                value={filters.tagId}
                onChange={(e) => setFilters({ ...filters, tagId: e.target.value })}
              >
                <option value="">🏷️ Все теги</option>
                {allTags.map(t => (
                  <option key={t.id} value={t.id}>#{t.name}</option>
                ))}
              </select>
              
              <input
                type="date"
                placeholder="С даты"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              
              <input
                type="date"
                placeholder="По дату"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            
            <button
              onClick={resetFilters}
              style={{
                marginTop: '20px',
                background: '#f0f0f0',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Список записей */}
        {filteredEntries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'white',
            borderRadius: '24px',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              {entries.length === 0 ? 'У вас пока нет записей' : 'Нет записей по выбранным фильтрам'}
            </p>
            {entries.length === 0 && (
              <button onClick={() => navigate('/create')} className="btn-primary">
                Создать первую запись
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))
        )}
      </div>
    </>
  );
};

export default Dashboard;