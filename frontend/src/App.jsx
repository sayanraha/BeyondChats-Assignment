import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Article Card Component
function ArticleCard({ article }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: article.is_updated ? '6px solid #10b981' : '6px solid #3b82f6'
    }}>
      <div style={{ padding: '20px', flexGrow: 1 }}>
        <div style={{ 
            display: 'inline-block', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            backgroundColor: article.is_updated ? '#d1fae5' : '#dbeafe',
            color: article.is_updated ? '#065f46' : '#1e40af',
            marginBottom: '10px'
        }}>
          {article.is_updated ? '✨ AI Enhanced' : '📄 Original'}
        </div>
        
        <h2 style={{ margin: '10px 0', fontSize: '1.5rem', color: '#1f2937' }}>{article.title}</h2>
        <div 
          style={{ 
            color: '#4b5563', 
            lineHeight: '1.6', 
            maxHeight: isExpanded ? 'none' : '100px', 
            overflow: 'hidden', 
            marginBottom: '15px',
            position: 'relative',
            transition: 'max-height 0.3s ease'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '0',
                fontSize: '14px'
            }}
        >
            {isExpanded ? 'Show Less ▲' : 'Read More ▼'}
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {article.id}</span>
            {article.is_updated && (
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>Has Citations</span>
            )}
        </div>
      </div>
    </div>
  );
}

// App Component
function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/articles')
      .then(response => {
        // We sort the articles so the "Original" and "AI Version" stick together.
        const sortedArticles = response.data.sort((a, b) => {
            if (a.source_url < b.source_url) return -1;
            if (a.source_url > b.source_url) return 1;
            return a.id - b.id;
        });

        setArticles(sortedArticles);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>
      BeyondChats Assignment Dashboard
      </h1>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading articles...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;