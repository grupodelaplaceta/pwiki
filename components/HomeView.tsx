import React from 'react';
import { Article, ARTICLE_ICONS } from '../types';

interface HomeViewProps {
  articles: Article[];
  onNavigate: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ articles, onNavigate }) => {
  // Get recently updated articles (last 5)
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // Get "featured" articles - for now, let's say top-level articles that are ACTIVE
  const featuredArticles = articles
    .filter(a => !a.parentId && a.activityLevel === 'ACTIVE')
    .slice(0, 4);

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Wiki del Grupo de La Placeta
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Base de conocimiento centralizada para la gestión, normativa y procedimientos del grupo.
        </p>
      </div>

      {/* Featured Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i className="fas fa-star text-sm"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Artículos Destacados</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredArticles.map(article => (
            <button 
              key={article.id}
              onClick={() => onNavigate(article.id)}
              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all text-left flex flex-col h-full"
            >
              <div className="flex items-start justify-between w-full mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <i className={`fas ${ARTICLE_ICONS[article.type]} text-lg`}></i>
                </div>
                <span className="px-2 py-1 rounded-md bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  {article.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                {article.summary || 'Sin descripción disponible.'}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Leer más</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Updates Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fas fa-clock text-sm"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Últimas Actualizaciones</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {recentArticles.map((article, idx) => (
            <button
              key={article.id}
              onClick={() => onNavigate(article.id)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 ${
                idx !== recentArticles.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <i className={`fas ${ARTICLE_ICONS[article.type]}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{article.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="font-mono bg-slate-100 px-1.5 rounded">{article.metadata.lawCode || 'S/N'}</span>
                  <span>&bull;</span>
                  <span>Actualizado el {new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-slate-300">
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
