import React from 'react';
import { Link } from 'react-router-dom';

const EntryCard = ({ entry, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="card fade-in" style={{ position: 'relative' }}>
      {/* Цветная полоска сверху */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: entry.is_public 
          ? 'linear-gradient(90deg, #48bb78, #38a169)'
          : 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '20px 20px 0 0'
      }} />
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{
          fontSize: '22px',
          color: '#333',
          margin: 0,
          flex: 1
        }}>
          {entry.title}
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            background: entry.is_public ? '#c6f6d5' : '#e9d8fd',
            color: entry.is_public ? '#22543d' : '#553c9a',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {entry.is_public ? '🌍 Публичная' : '🔒 Приватная'}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#888', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📅 {formatDate(entry.published_date || entry.created_at)}
        </span>
        
        {entry.journal && (
          <span style={{
            background: entry.journal.color + '20',
            color: entry.journal.color,
            padding: '2px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {entry.journal.icon || '📁'} {entry.journal.name}
          </span>
        )}
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {entry.tags.map(tag => (
            <span key={tag.id} style={{
              background: tag.color + '15',
              color: tag.color,
              padding: '4px 10px',
              borderRadius: '15px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <p style={{
        color: '#555',
        lineHeight: '1.6',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        {entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        borderTop: '1px solid #eee',
        paddingTop: '16px'
      }}>
        <Link to={`/entry/${entry.id}`} style={{
          color: '#667eea',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          📖 Читать полностью →
        </Link>
        <Link to={`/edit/${entry.id}`} style={{
          color: '#38a169',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ✏️ Редактировать
        </Link>
        <button onClick={() => onDelete(entry.id)} style={{
          background: 'none',
          border: 'none',
          color: '#e53e3e',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
};

export default EntryCard;