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
      localStorage.setItem('wiki_placeta_db_modern', JSON.stringify(articles));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  load: async (): Promise<Article[]> => {
    try {
      const saved = localStorage.getItem('wiki_placeta_db_modern');
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
      <ul className={`${depth > 0 ? 'ml-4 border-l border-slate-100 pl-2' : ''} space-y-1 mt-1`}>
        {children.map(child => (
          <li key={child.id}>
            <button
              onClick={() => {
                setCurrentArticleId(child.id);
                setIsEditing(false);
                setIsCreating(false);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-3 ${
                currentArticleId === child.id 
                  ? 'bg-emerald-50 text-emerald-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${ARTICLE_ICONS[child.type]} text-[10px] ${currentArticleId === child.id ? 'opacity-100' : 'opacity-30'}`}></i>
              <span className="truncate">{child.title}</span>
            </button>
            {renderNavTree(child.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#fcfcfc] text-slate-900">
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-fade-in border border-slate-100">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-lock text-slate-300 text-xl"></i>
              </div>
              <h2 className="heading-font text-xl font-black mb-2">Acceso Editor</h2>
              <p className="text-xs text-slate-400 mb-8">Introduce la clave para realizar cambios</p>
              <form onSubmit={handleAuthAttempt} className="space-y-4">
                <input 
                  autoFocus type="password" placeholder="••••••••" value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-center outline-none transition-all ${authError ? 'border-red-200' : 'focus:border-emerald-500 border-slate-50'}`}
                />
                <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs hover:bg-emerald-600 transition-colors">AUTENTICAR</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HEADER MODERNO */}
      <header className="no-print h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 z-[100] sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-3 bg-slate-50 rounded-xl text-slate-500"><i className="fas fa-bars-staggered"></i></button>
          <div className="flex items-center cursor-pointer" onClick={() => { setCurrentArticleId('inicio'); setIsEditing(false); setIsCreating(false); }}>
            <img src="https://i.postimg.cc/xd6DTcFQ/faviwiki.png" alt="WikiGov Logo" className="h-10 w-auto" />
          </div>
        </div>
        
        <div className="hidden md:block flex-1 max-w-lg mx-12 relative no-print">
          <div className="relative group">
            <input 
              type="text" placeholder="¿Qué estás buscando hoy?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/50 border-2 border-transparent rounded-2xl py-3 pl-6 pr-12 text-sm focus:bg-white focus:border-emerald-100 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              <i className="fas fa-search"></i>
            </div>
          </div>
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-[120] overflow-hidden">
              {filteredResults.length > 0 ? filteredResults.map(res => (
                <button 
                  key={res.id} 
                  onClick={() => { setCurrentArticleId(res.id); setSearchQuery(''); }}
                  className="w-full text-left px-6 py-4 hover:bg-emerald-50/50 transition-colors border-b border-slate-50 flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                    <i className={`fas ${ARTICLE_ICONS[res.type]}`}></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{res.title}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">{res.type}</div>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-slate-400 italic text-sm">No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => startProtectedAction('create')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95">NUEVO</button>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
             <i className="fas fa-user-circle"></i>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR MODERNO */}
        <aside className={`no-print bg-white border-r border-slate-50 w-80 transition-all fixed lg:relative h-full z-[120] flex flex-col ${isSidebarOpen ? 'left-0 shadow-2xl' : '-left-80 lg:left-0'}`}>
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Navegación</h3>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setCurrentArticleId('inicio'); setIsEditing(false); setIsCreating(false); setSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 ${currentArticleId === 'inicio' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <i className="fas fa-home-alt text-[10px]"></i>
                  Portada Principal
                </button>
                <button className="w-full text-left px-4 py-3 rounded-2xl text-sm text-slate-400 hover:bg-slate-50 transition-all flex items-center gap-3">
                  <i className="fas fa-random text-[10px]"></i>
                  Exploración Libre
                </button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Departamentos</h3>
              {renderNavTree(undefined)}
            </div>
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
             <div className={`p-4 rounded-2xl flex items-center gap-3 ${isAuthenticated ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <div className="w-2 h-2 rounded-full animate-pulse bg-current"></div>
                <div className="text-[10px] font-black uppercase tracking-widest">{isAuthenticated ? 'Edición Habilitada' : 'Modo Consulta'}</div>
             </div>
             {isAuthenticated && (
               <button onClick={() => setIsAuthenticated(false)} className="mt-4 w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-center">Finalizar Sesión</button>
             )}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-16 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {isCreating ? (
              <ArticleEditor allArticles={articles} article={{}} onSave={handleSave} onCancel={() => setIsCreating(false)} />
            ) : isEditing ? (
              <ArticleEditor allArticles={articles} article={currentArticle} onSave={handleSave} onCancel={() => setIsEditing(false)} />
            ) : (
              <ArticleView article={currentArticle} allArticles={articles} onEdit={() => startProtectedAction('edit')} onNavigate={setCurrentArticleId} />
            )}
          </div>
        </main>
      </div>
      
      <footer className="no-print h-14 bg-white border-t border-slate-50 flex items-center justify-between px-8 text-[11px] text-slate-400 font-medium">
        <div className="flex gap-6">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacidad</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Sistema</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Soporte</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <span>WikiGov Institucional &copy; 2024</span>
        </div>
      </footer>
    </div>
  );
};

export default App;