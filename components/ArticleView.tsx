import React, { useMemo } from 'react';
import { Article, ArticleType, ActivityLevel, ARTICLE_ICONS } from '../types';

interface ArticleViewProps {
  article: Article;
  onEdit: () => void;
  onNavigate: (id: string) => void;
  allArticles: Article[];
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onEdit, onNavigate, allArticles }) => {
  const children = useMemo(() => 
    allArticles.filter(a => a.parentId === article.id),
    [allArticles, article.id]
  );

  const parent = useMemo(() => 
    allArticles.find(a => a.id === article.parentId),
    [allArticles, article.parentId]
  );

  const activityBadge = {
    [ActivityLevel.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [ActivityLevel.SEMI_ACTIVE]: 'bg-amber-50 text-amber-700 border-amber-100',
    [ActivityLevel.INACTIVE]: 'bg-slate-50 text-slate-600 border-slate-100',
  }[article.activityLevel];

  const renderRichText = (text: string) => {
    let html = text;
    html = html.replace(/## (.*)/g, '<h2 id="$1">$1</h2>');
    html = html.replace(/### (.*)/g, '<h3>$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\- (.*)/gm, '<li class="ml-4 mb-2 text-slate-600">$1</li>');
    html = html.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<span class="wiki-link" data-wiki-id="$1">$2</span>');
    html = html.replace(/\[(.*?)\]/g, '<span class="norm-badge">$1</span>');
    html = html.split('\n').join('<br/>');
    return html;
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikiId = target.getAttribute('data-wiki-id');
    if (wikiId) onNavigate(wikiId);
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* HEADER DE ARTICULO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.type}</div>
             <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${activityBadge}`}>{article.activityLevel}</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 heading-font tracking-tight leading-tight">{article.title}</h1>
        </div>
        <div className="no-print flex items-center gap-2">
           <button onClick={onEdit} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm">
             <i className="fas fa-edit"></i>
           </button>
           <button onClick={() => window.print()} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
             <i className="fas fa-print"></i>
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          {article.summary && (
            <div className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 italic">
              {article.summary}
            </div>
          )}

          <div 
            className="wiki-content text-base md:text-lg leading-relaxed text-slate-700"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
          />

          {children.length > 0 && (
            <div className="mt-20 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-50">
              <h2 className="text-xl font-black mb-6 heading-font">Estructura Dependiente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map(child => (
                  <button 
                    key={child.id} 
                    onClick={() => onNavigate(child.id)}
                    className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left shadow-sm flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                      <i className={`fas ${ARTICLE_ICONS[child.type]}`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{child.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">{child.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INFOBOX MODERNO */}
        <aside className="w-full lg:w-[350px] shrink-0">
          <div className="infobox sticky top-28">
            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
               <i className={`fas ${ARTICLE_ICONS[article.type]} text-3xl text-slate-300`}></i>
            </div>
            
            <div className="text-center mb-8 pb-8 border-b border-slate-50">
               <h4 className="font-black text-slate-900 heading-font text-lg mb-1">{article.title}</h4>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{article.metadata.sector || 'Ficha Institucional'}</p>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center group">
                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Responsable</span>
                 <span className="text-xs font-bold text-slate-700">{article.metadata.responsible || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center group">
                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Ref. Legal</span>
                 <span className="font-mono text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{article.metadata.lawCode || 'S/N'}</span>
               </div>
               <div className="flex justify-between items-center group">
                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Antigüedad</span>
                 <span className="text-xs font-bold text-slate-700">{article.metadata.established || '-'}</span>
               </div>
               {parent && (
                  <div className="pt-6 border-t border-slate-50">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest block mb-3">Superior Jerárquico</span>
                    <button onClick={() => onNavigate(parent.id)} className="w-full bg-slate-50 p-3 rounded-xl text-left text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                       <i className="fas fa-arrow-up text-[10px] opacity-40"></i>
                       {parent.title}
                    </button>
                  </div>
               )}
            </div>

            {article.metadata.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-50">
                <div className="flex flex-wrap gap-2">
                  {article.metadata.tags.map(t => (
                    <span key={t} className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 rounded-lg hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all">#{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-24 pt-10 border-t border-slate-100 text-[11px] text-slate-300 font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
        <div>Actualizado el {new Date(article.updatedAt).toLocaleDateString()} &bull; {new Date(article.updatedAt).toLocaleTimeString()}</div>
        <div className="flex gap-4">
          <span className="cursor-help hover:text-slate-400">Log de Cambios</span>
          <span className="cursor-help hover:text-slate-400">Verificar Firma</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;