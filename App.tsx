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
      a.metadata?.lawCode?.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
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
      <ul className={`${depth > 0 ? 'ml-3 border-l border-slate-200 pl-2' : ''} space-y-0.5 mt-1`}>
        {children.map(child => (
          <li key={child.id}>
            <button
              onClick={() => {
                setCurrentArticleId(child.id);
                setIsEditing(false);
                setIsCreating(false);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-2 py-1 text-xs transition-colors flex items-center gap-2 ${
                currentArticleId === child.id 
                  ? 'text-emerald-700 font-bold bg-emerald-50' 
                  : 'text-[#3366cc] hover:underline'
              }`}
            >
              <i className={`fas ${ARTICLE_ICONS[child.type]} text-[9px] opacity-30`}></i>
              <span className="truncate">{child.title}</span>
            </button>
            {renderNavTree(child.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900">
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-sm overflow-hidden relative animate-fade-in">
            <div className="p-6 text-center">
              <h2 className="heading-font text-lg font-bold mb-4">Acceso Restringido</h2>
              <form onSubmit={handleAuthAttempt} className="space-y-4">
                <input 
                  autoFocus type="password" placeholder="Contraseña de edición..." value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-300 px-4 py-3 text-center outline-none ${authError ? 'border-red-500' : 'focus:border-emerald-500'}`}
                />
                <button type="submit" className="w-full bg-[#36c] text-white py-2 font-bold text-sm hover:bg-[#447ff5]">Acceder</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HEADER TIPO WIKIPEDIA REALISTA */}
      <header className="no-print h-14 bg-white border-b border-[#a2a9b1] flex items-center justify-between px-4 lg:px-6 z-[100] sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500"><i className="fas fa-bars"></i></button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentArticleId('inicio'); setIsEditing(false); setIsCreating(false); }}>
            <img src="https://i.postimg.cc/xd6DTcFQ/faviwiki.png" alt="Placeta Logo" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <div className="font-serif italic text-lg leading-none">WikiGov</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-tight">La Placeta Institutional</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-6 relative no-print">
          <div className="relative group">
            <input 
              type="text" placeholder="Buscar en WikiGov..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#a2a9b1] py-1.5 pl-4 pr-10 text-sm focus:border-[#36c] outline-none transition-colors"
            />
            <button className="absolute right-0 top-0 bottom-0 px-3 text-slate-400 hover:text-[#36c]"><i className="fas fa-search"></i></button>
          </div>
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-[#a2a9b1] shadow-lg z-[120]">
              {filteredResults.length > 0 ? filteredResults.map(res => (
                <button 
                  key={res.id} 
                  onClick={() => { setCurrentArticleId(res.id); setSearchQuery(''); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] text-xs border-b border-slate-100 flex items-center gap-2"
                >
                  <i className={`fas ${ARTICLE_ICONS[res.type]} text-slate-300 w-4 text-center`}></i>
                  <span>{res.title}</span>
                </button>
              )) : (
                <div className="p-3 text-[11px] text-slate-400 italic">No hay resultados para "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => startProtectedAction('create')} className="text-[#36c] text-sm font-bold hover:underline">Crear nuevo</button>
          <div className="w-px h-4 bg-slate-300 mx-2"></div>
          <button className="text-slate-600 text-sm hover:underline">Identificarse</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVEGACIÓN */}
        <aside className={`no-print bg-[#f6f6f6] border-r border-[#a2a9b1] w-64 transition-all fixed lg:relative h-full z-[120] flex flex-col ${isSidebarOpen ? 'left-0 shadow-2xl' : '-left-64 lg:left-0'}`}>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">Páginas</h3>
              <button 
                onClick={() => { setCurrentArticleId('inicio'); setIsEditing(false); setIsCreating(false); setSidebarOpen(false); }}
                className={`w-full text-left px-2 py-1 text-xs transition-colors ${currentArticleId === 'inicio' ? 'font-bold' : 'text-[#3366cc] hover:underline'}`}
              >
                Portada
              </button>
              <button className="w-full text-left px-2 py-1 text-xs text-[#3366cc] hover:underline">Página aleatoria</button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">Departamentos</h3>
              {renderNavTree(undefined)}
            </div>
          </div>
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-[9px] text-slate-400 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>ESTADO</span>
              <span className={isAuthenticated ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                {isAuthenticated ? "MODO EDICIÓN" : "LECTURA"}
              </span>
            </div>
            {isAuthenticated && (
              <button onClick={() => setIsAuthenticated(false)} className="text-[#36c] hover:underline text-left">Cerrar sesión editor</button>
            )}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 lg:px-12 lg:py-8 bg-white selection:bg-blue-100">
          <div className="max-w-5xl mx-auto">
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
      
      <footer className="no-print h-10 bg-[#f6f6f6] border-t border-[#a2a9b1] flex items-center justify-between px-6 text-[10px] text-slate-500">
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Política de privacidad</span>
          <span className="hover:underline cursor-pointer">Acerca de WikiGov</span>
          <span className="hover:underline cursor-pointer">Aviso legal</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="fab fa-creative-commons"></i>
          <span>Contenido bajo licencia CC BY-SA 4.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;