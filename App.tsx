
import React, { useState, useMemo, useEffect } from 'react';
import { Article, ArticleType, ActivityLevel, ARTICLE_ICONS } from './types';
import { INITIAL_ARTICLES } from './constants';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('wiki_placeta_simple');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });
  
  const [currentArticleId, setCurrentArticleId] = useState<string>(articles[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Responsive states
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
        setShowMobileSearch(false);
      } else {
        // Close sidebar by default on resize to mobile
        if (sidebarOpen && mobile) setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('wiki_placeta_simple', JSON.stringify(articles));
  }, [articles]);

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const activityMap = { [ActivityLevel.ACTIVE]: 0, [ActivityLevel.SEMI_ACTIVE]: 1, [ActivityLevel.INACTIVE]: 2 };
      if (activityMap[a.activityLevel] !== activityMap[b.activityLevel]) {
        return activityMap[a.activityLevel] - activityMap[b.activityLevel];
      }
      return a.title.localeCompare(b.title);
    });
  }, [articles]);

  const currentArticle = useMemo(() => 
    articles.find(a => a.id === currentArticleId),
    [articles, currentArticleId]
  );

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return sortedArticles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.metadata.tags.some(t => t.toLowerCase().includes(q)) ||
      a.metadata.lawCode?.toLowerCase().includes(q)
    );
  }, [sortedArticles, searchQuery]);

  const handleSave = (newArticle: Article) => {
    setArticles(prev => {
      const idx = prev.findIndex(a => a.id === newArticle.id);
      if (idx > -1) {
        const up = [...prev];
        up[idx] = newArticle;
        return up;
      }
      return [...prev, newArticle];
    });
    setCurrentArticleId(newArticle.id);
    setIsEditing(false);
    setIsCreating(false);
    if (isMobile) setSidebarOpen(false);
  };

  // Auth Logic
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('wiki_auth') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<'edit' | 'create' | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.WIKI_PASSWORD;
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wiki_auth', 'true');
      setShowLoginModal(false);
      setPasswordInput('');
      setLoginError('');
      if (pendingAction === 'edit') setIsEditing(true);
      if (pendingAction === 'create') setIsCreating(true);
      setPendingAction(null);
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const requestAction = (action: 'edit' | 'create') => {
    if (isAuthenticated) {
      if (action === 'edit') setIsEditing(true);
      if (action === 'create') setIsCreating(true);
    } else {
      setPendingAction(action);
      setShowLoginModal(true);
    }
  };

  const renderNavTree = (parentId?: string, depth = 0) => {
    const children = sortedArticles.filter(a => a.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <ul className={`${depth > 0 ? 'ml-3 border-l border-slate-100 pl-2' : ''} space-y-1 mt-1`}>
        {children.map(child => (
          <li key={child.id}>
            <button
              onClick={() => {
                setCurrentArticleId(child.id);
                setIsEditing(false);
                setIsCreating(false);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                currentArticleId === child.id 
                  ? 'bg-green-50 text-green-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${ARTICLE_ICONS[child.type]} text-[10px] ${currentArticleId === child.id ? 'text-green-600' : 'text-slate-300'}`}></i>
              <span className="truncate flex-1">{child.title}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                child.activityLevel === ActivityLevel.ACTIVE ? 'bg-green-500' :
                child.activityLevel === ActivityLevel.SEMI_ACTIVE ? 'bg-orange-400' : 'bg-slate-300'
              }`}></span>
            </button>
            {renderNavTree(child.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-2 text-center">Acceso Privado</h3>
            <p className="text-xs text-slate-500 mb-8 text-center">Gestión Institucional Placeta</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="Clave"
                className="w-full border-2 rounded-2xl px-4 py-4 text-lg text-center font-bold tracking-[0.3em] outline-none focus:border-green-300"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {loginError && <p className="text-[10px] text-red-500 font-bold text-center uppercase">{loginError}</p>}
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg">Entrar</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full py-2 text-xs font-bold text-slate-400">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="no-print h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 z-[150] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-slate-500 p-2 rounded-xl hover:bg-slate-50 lg:hidden active:scale-95 transition-transform"
          >
            <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars-staggered'} text-xl`}></i>
          </button>
          
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => {setCurrentArticleId(articles[0].id); setIsEditing(false); if(isMobile) setSidebarOpen(false);}}
          >
            <img 
              src="https://i.postimg.cc/dtyQ0jYV/WIKI.png" 
              alt="Logo" 
              className="h-9 lg:h-11 w-auto object-contain"
            />
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-12 relative">
          <div className="relative w-full">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Buscar en la base de datos..."
              className="w-full bg-slate-50 border border-transparent rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:bg-white focus:border-slate-200 outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-3xl max-h-96 overflow-y-auto z-[160]">
              {filteredResults.map(a => (
                <button key={a.id} onClick={() => {setCurrentArticleId(a.id); setSearchQuery('');}} className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-4">
                  <i className={`fas ${ARTICLE_ICONS[a.type]} text-slate-300`}></i>
                  <span className="font-bold text-slate-700">{a.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {setShowMobileSearch(!showMobileSearch); if(sidebarOpen) setSidebarOpen(false);}}
            className="lg:hidden text-slate-500 p-2.5 rounded-xl active:bg-slate-100"
          >
            <i className={`fas ${showMobileSearch ? 'fa-times' : 'fa-search'} text-lg`}></i>
          </button>
          
          <button 
            onClick={() => requestAction('create')}
            className="bg-green-600 text-white w-10 h-10 lg:w-auto lg:px-5 lg:py-2 rounded-xl text-xs font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden lg:inline">NUEVA</span>
          </button>
        </div>

        {/* Mobile Search Overlay */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 px-4 py-4 shadow-xl z-[140] transition-all duration-300 transform ${showMobileSearch ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Buscar..."
              className="w-full bg-slate-50 rounded-2xl py-4 pl-12 pr-4 text-base focus:bg-white outline-none font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="mt-4 max-h-[50vh] overflow-y-auto divide-y divide-slate-50">
              {filteredResults.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => {setCurrentArticleId(a.id); setSearchQuery(''); setShowMobileSearch(false);}} 
                  className="w-full text-left py-4 flex items-center gap-4 active:bg-slate-50"
                >
                  <i className={`fas ${ARTICLE_ICONS[a.type]} text-slate-300`}></i>
                  <span className="font-bold text-slate-800">{a.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 z-[190] backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`no-print bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-[200] ${
          isMobile 
            ? `fixed inset-y-0 left-0 w-[280px] shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `relative ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`
        }`}>
          <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenidos</h2>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <i className="fas fa-times text-sm"></i>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <button 
              onClick={() => {setCurrentArticleId(articles[0].id); setIsEditing(false); if(isMobile) setSidebarOpen(false);}}
              className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black mb-6 flex items-center gap-4 transition-all ${
                currentArticleId === articles[0].id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <i className="fas fa-home"></i> Portal Principal
            </button>
            
            <div className="mb-8">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-2">Estructura</h3>
              {renderNavTree(undefined)}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-2">Archivo Completo</h3>
              <ul className="space-y-1">
                {sortedArticles.filter(a => !a.parentId && a.id !== articles[0].id).map(a => (
                  <li key={a.id}>
                    <button
                      onClick={() => {setCurrentArticleId(a.id); setIsEditing(false); if(isMobile) setSidebarOpen(false);}}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                        currentArticleId === a.id ? 'bg-green-50 text-green-800 font-bold' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <i className={`fas ${ARTICLE_ICONS[a.type]} text-xs opacity-30`}></i>
                      <span className="truncate">{a.title}</span>
                    </button>
                    {renderNavTree(a.id, 1)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-6 text-[9px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50">
             Placeta Engine v2.5.4
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 lg:p-12 min-h-full flex flex-col">
            {isCreating ? (
              <ArticleEditor allArticles={articles} article={{}} onSave={handleSave} onCancel={() => setIsCreating(false)} />
            ) : isEditing && currentArticle ? (
              <ArticleEditor allArticles={articles} article={currentArticle} onSave={handleSave} onCancel={() => setIsEditing(false)} />
            ) : currentArticle ? (
              <ArticleView 
                article={currentArticle} 
                allArticles={articles} 
                onEdit={() => requestAction('edit')} 
                onNavigate={(id) => {
                  setCurrentArticleId(id);
                  if(isMobile) setSidebarOpen(false);
                  const m = document.querySelector('main');
                  if(m) m.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            ) : null}
          </div>
        </main>
      </div>

      <footer className="no-print h-8 bg-white border-t border-slate-100 flex items-center px-6 text-[9px] font-black text-slate-400 justify-between z-[150] uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Wiki Placeta Institutional Knowledge</span>
          {isAuthenticated && <span className="text-green-600 flex items-center gap-1"><i className="fas fa-shield-check"></i> Gestor Habilitado</span>}
        </div>
        <div>{new Date().toLocaleDateString()}</div>
      </footer>
    </div>
  );
};

export default App;
