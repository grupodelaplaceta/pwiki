
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

  const activityColors = {
    [ActivityLevel.ACTIVE]: 'text-green-600 bg-green-50 border-green-100',
    [ActivityLevel.SEMI_ACTIVE]: 'text-orange-500 bg-orange-50 border-orange-100',
    [ActivityLevel.INACTIVE]: 'text-slate-400 bg-slate-50 border-slate-100',
  }[article.activityLevel];

  const logos = article.metadata.logos || [];
  const currentLogo = logos[0];

  const renderRichText = (text: string) => {
    let html = text;

    // Snippets {{snippet:id}}
    html = html.replace(/\{\{snippet:(.*?)\}\}/g, (match, id) => {
      const target = allArticles.find(a => a.id === id);
      if (!target) return `<div class="snippet-box text-red-500 italic">Snippet no encontrado: ${id}</div>`;
      return `
        <div class="snippet-box">
          <div class="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <i class="fas fa-quote-left text-green-600 text-[10px]"></i>
            Referencia: <span class="wiki-link" data-wiki-id="${target.id}">${target.title}</span>
          </div>
          <div class="text-slate-600 leading-relaxed text-sm">${target.summary || target.content.substring(0, 150) + '...'}</div>
        </div>
      `;
    });

    // Headers
    html = html.replace(/## (.*)/g, '<h2 class="text-2xl md:text-3xl font-black mt-10 md:mt-12 mb-5 md:mb-6 tracking-tight">$1</h2>');
    html = html.replace(/### (.*)/g, '<h3 class="text-xl font-black mt-10 mb-5 tracking-tight">$1</h3>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-slate-950">$1</b>');
    
    // Lists
    html = html.replace(/^\- (.*)/gm, '<li class="ml-5 mb-3 md:mb-4 list-disc text-slate-700">$1</li>');
    html = html.replace(/^\d+\. (.*)/gm, '<li class="ml-5 mb-3 md:mb-4 list-decimal text-slate-700">$1</li>');

    // Internal Links [[ID|Label]]
    html = html.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, id, label) => {
      return `<span class="wiki-link font-black text-green-600 underline decoration-green-200 decoration-2 underline-offset-4 hover:decoration-green-500 transition-all cursor-pointer" data-wiki-id="${id}">${label}</span>`;
    });

    // Regulations [CODE]
    html = html.replace(/\[(.*?)\]/g, (match, code) => {
      return `<span class="norm-badge">${code}</span>`;
    });

    // Line breaks
    html = html.split('\n').join('<br/>').replace(/(<br\/>){3,}/g, '<br/><br/>');

    return html;
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikiId = target.getAttribute('data-wiki-id');
    if (wikiId) onNavigate(wikiId);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden transition-all flex flex-col">
      <div className="p-5 sm:p-10 md:p-16 lg:p-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 border-b border-slate-50 pb-8 md:pb-12">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-black text-slate-300 mb-4 uppercase tracking-widest">
              <span className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <i className={`fas ${ARTICLE_ICONS[article.type]} text-green-600`}></i>
                {article.type}
              </span>
              <span className={`px-2 py-1 rounded-lg border ${activityColors}`}>{article.activityLevel}</span>
              {parent && (
                <button 
                  onClick={() => onNavigate(parent.id)} 
                  className="flex items-center gap-2 hover:text-green-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
                >
                  <i className="fas fa-chevron-left text-[8px]"></i>
                  {parent.title}
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {currentLogo && (
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-slate-50 border border-slate-100 p-4 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105">
                  <img src={currentLogo.url} alt={currentLogo.label} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tighter">
                {article.title}
              </h1>
            </div>
          </div>
          
          <div className="flex gap-2 no-print shrink-0 md:mt-1 self-end md:self-start">
            <button onClick={onEdit} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 transition-all active:scale-95 shadow-sm" title="Editar">
              <i className="fas fa-pen-nib"></i>
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 transition-all active:scale-95 shadow-sm" title="Imprimir">
              <i className="fas fa-print"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-20">
          <div className="lg:col-span-3">
            {article.summary && (
              <div className="text-slate-500 text-base md:text-xl leading-relaxed italic border-l-4 md:border-l-8 border-green-500 pl-4 md:pl-8 mb-10 md:mb-16 py-3 md:py-4 bg-green-50/10 rounded-r-3xl">
                {article.summary}
              </div>
            )}

            <div 
              className="wiki-content prose prose-slate max-w-none text-slate-800"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
            />

            {/* Logo Evolution Gallery */}
            {logos.length > 0 && (
              <div className="mt-20 pt-12 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 px-1">Evolución de la Identidad Visual</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {logos.map((logo, index) => (
                    <div key={index} className="group flex flex-col items-center">
                      <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex items-center justify-center mb-3 transition-all group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-100 group-hover:scale-105">
                        <img src={logo.url} alt={logo.label} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-700 uppercase leading-tight">{logo.label}</p>
                        {logo.period && <p className="text-[9px] font-bold text-slate-400 mt-1">{logo.period}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {children.length > 0 && (
              <div className="mt-16 pt-12 border-t border-slate-50">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Contenidos Relacionados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {children.map(child => (
                    <button 
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className="p-5 text-sm font-black text-slate-700 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-200 rounded-[1.5rem] border border-transparent text-left transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                        <i className={`fas ${ARTICLE_ICONS[child.type]} text-xs`}></i>
                      </div>
                      <span className="truncate flex-1">{child.title}</span>
                      <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"></i>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 no-print">
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2.5rem] p-6 md:p-8 border border-slate-100 space-y-8 sticky top-8">
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-widest">Información</h5>
                <div className="space-y-5">
                  <div>
                    <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Responsable</label>
                    <p className="font-black text-slate-800 text-sm">{article.metadata.responsible || '---'}</p>
                  </div>
                  {article.metadata.sector && (
                    <div>
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Ámbito</label>
                      <p className="font-black text-green-700 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-100 inline-block">{article.metadata.sector}</p>
                    </div>
                  )}
                  {article.metadata.lawCode && (
                    <div>
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Referencia</label>
                      <div className="font-mono text-[10px] font-black text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-100 mt-1 flex items-center gap-2 shadow-sm">
                        <i className="fas fa-fingerprint opacity-20"></i>
                        {article.metadata.lawCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200/50">
                <h5 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Etiquetas</h5>
                <div className="flex flex-wrap gap-2">
                  {article.metadata.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-[9px] text-slate-300 font-black uppercase text-center pt-2 opacity-50">
                Act: {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
