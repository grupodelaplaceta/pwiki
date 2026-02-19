import React, { useState, useMemo, useEffect } from 'react';
import { Article, ARTICLE_ICONS, ActivityLevel } from './types';
import { INITIAL_ARTICLES } from './constants';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';

const getEnvVar = (key: string): string => {
  try {
    return (window as any).process?.env?.[key] || "";
  } catch (e) {
    return "";
  }
};

const db = {
  save: async (articles: Article[]) => {
    try {
      localStorage.setItem('wiki_placeta_db', JSON.stringify(articles));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  load: async (): Promise<Article[]> => {
    try {
      const saved = localStorage.getItem('wiki_placeta_db');
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch (e) {
      return INITIAL_ARTICLES;
    }
  }
};

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentArticleId, setCurrentArticleId] = useState<string>('inicio');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'edit' | null>(null);

  useEffect(() => {
    db.load().then(data => {
      setArticles(data);
      const exists = data.find(a => a.id === 'inicio');
      setCurrentArticleId(exists ? 'inicio' : (data[0]?.id || 'inicio'));
      setLoading(false);
    });
  }, []);

  const handleSave = async (newArticle: Article) => {
    const newArticles = [...articles];
    const idx = newArticles.findIndex(a => a.id === newArticle.id);
    if (idx > -1) {
      newArticles[idx] = newArticle;
    } else {
      newArticles.push(newArticle);
    }
    setArticles(newArticles);
    await db.save(newArticles);
    setCurrentArticleId(newArticle.id);
    setIsEditing(false);
    setIsCreating(false);
    setSidebarOpen(false);
  };

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [articles]);

  const currentArticle = useMemo(() => 
    articles.find(a => a.id === currentArticleId) || articles[0] || INITIAL_ARTICLES[0],
    [articles, currentArticleId]
  );

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return articles.filter(a => 
      a.title?.toLowerCase().includes(q) || 
      a.metadata?.lawCode?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [articles, searchQuery]);

  const handleAuthAttempt = (e?: React.FormEvent) => {
    e?.preventDefault();
    const correctPassword = getEnvVar('PASSWORD');
    if (!correctPassword || passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError(false);
      setPasswordInput('');
      if (pendingAction === 'create') setIsCreating(true);
      else if (pendingAction === 'edit') setIsEditing(true);
      setPendingAction(null);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const startProtectedAction = (type: 'create' | 'edit') => {
    if (isAuthenticated) {
      if (type === 'create') setIsCreating(true);
      if (type === 'edit') setIsEditing(true);
    } else {
      setPendingAction(type);
      setShowAuthModal(true);
    }
    setSidebarOpen(false);
  };

  const renderNavTree = (parentId?: string, depth = 0) => {
    const children = sortedArticles.filter(a => a.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <ul className={`${depth > 0 ? 'ml-4 border-l border-slate-100 pl-2' : ''} space-y-1`}>
        {children.map(child => (
          <li key={child.id}>
            <button
              onClick={() => {
                setCurrentArticleId(child.id);
                setIsEditing(false);
                setIsCreating(false);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                currentArticleId === child.id 
                  ? 'bg-emerald-50 text-emerald-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${ARTICLE_ICONS[child.type]} text-[10px] opacity-40`}></i>
              <span className="truncate">{child.title}</span>
            </button>
            {renderNavTree(child.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-sm overflow-hidden relative animate-fade-in">
            <div className="p-8 text-center">
              <h2 className="heading-font text-xl font-black mb-6">Acceso Administrador</h2>
              <form onSubmit={handleAuthAttempt} className="space-y-4">
                <input 
                  autoFocus type="password" placeholder="Contraseña..." value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-center outline-none ${authError ? 'border-red-200' : 'focus:border-emerald-500'}`}
                />
                <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs">VALIDAR</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <header className="no-print h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-[100]">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500"><i className="fas fa-bars-staggered"></i></button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentArticleId('inicio'); setIsEditing(false); }}>
            <img src="https://i.postimg.cc/dtyQ0jYV/WIKI.png" alt="Placeta Logo" className="h-10 w-auto" />
          </div>
        </div>
        <div className="hidden md:block flex-1 max-w-xl mx-8 relative">
          <input 
            type="text" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 rounded-full py-2 px-6 text-sm outline-none"
          />
        </div>
        <button onClick={() => startProtectedAction('create')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black">NUEVO</button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`bg-white border-r border-slate-200 w-72 transition-all fixed lg:relative h-full z-[120] ${isSidebarOpen ? 'left-0' : '-left-72 lg:left-0'}`}>
          <div className="p-4 overflow-y-auto h-full custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jerarquía</h3>
            {renderNavTree(undefined)}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-12">
          {isCreating ? (
            <ArticleEditor allArticles={articles} article={{}} onSave={handleSave} onCancel={() => setIsCreating(false)} />
          ) : isEditing ? (
            <ArticleEditor allArticles={articles} article={currentArticle} onSave={handleSave} onCancel={() => setIsEditing(false)} />
          ) : (
            <ArticleView article={currentArticle} allArticles={articles} onEdit={() => startProtectedAction('edit')} onNavigate={setCurrentArticleId} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;