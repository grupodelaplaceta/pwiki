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
    [ActivityLevel.ACTIVE]: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    [ActivityLevel.SEMI_ACTIVE]: 'text-amber-600 bg-amber-50 border-amber-100',
    [ActivityLevel.INACTIVE]: 'text-slate-400 bg-slate-50 border-slate-100',
  }[article.activityLevel];

  const renderRichText = (text: string) => {
    let html = text;
    // Basic Markdown transformations
    html = html.replace(/## (.*)/g, '<h2 class="text-2xl font-black mt-8 mb-4 border-b border-slate-100 pb-2">$1</h2>');
    html = html.replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-slate-900">$1</b>');
    html = html.replace(/^\- (.*)/gm, '<li class="ml-5 mb-2 list-disc">$1</li>');
    html = html.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<span class="wiki-link text-emerald-600 font-bold hover:underline cursor-pointer" data-wiki-id="$1">$2</span>');
    html = html.replace(/\[(.*?)\]/g, '<span class="norm-badge">$1</span>');
    html = html.split('\n').join('<br/>');
    return html;
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikiId = target.getAttribute('data-wiki-id');
    if (wikiId) onNavigate(wikiId);
  };

  const handlePrint = () => {
    // Triggers the system print dialog which is the browser standard for "Download as PDF"
    window.print();
  };

  const currentLogo = article.metadata.logos?.[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col wiki-card transition-all">
      <div className="p-6 md:p-12">
        {/* CABECERA ARTÍCULO */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                <i className={`fas ${ARTICLE_ICONS[article.type]}`}></i> {article.type}
              </span>
              <span className={`px-2 py-1 rounded-lg border ${activityColors}`}>
                {article.activityLevel}
              </span>
              {parent && (
                <button onClick={() => onNavigate(parent.id)} className="hover:text-emerald-600 flex items-center gap-1 transition-colors no-print">
                  <i className="fas fa-arrow-left text-[8px]"></i> {parent.title}
                </button>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight heading-font">
              {article.title}
            </h1>
          </div>
          
          <div className="no-print flex gap-2 shrink-0 self-end md:self-start">
            <button 
              onClick={onEdit}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
              title="Editar este documento"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              onClick={handlePrint}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
              title="Descargar PDF / Imprimir"
            >
              <i className="fas fa-file-pdf"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 order-2 lg:order-1">
            {article.summary && (
              <div className="text-slate-500 text-lg leading-relaxed italic border-l-4 border-emerald-500 pl-6 mb-12 py-2 bg-emerald-50/20 rounded-r-xl">
                {article.summary}
              </div>
            )}

            <div 
              className="wiki-content text-slate-700 leading-relaxed text-base md:text-lg"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
            />

            {/* HIJOS / SUBSECCIONES */}
            {children.length > 0 && (
              <div className="mt-16 pt-10 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 no-print">Dependencias y Subsecciones</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
                  {children.map(child => (
                    <button 
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-emerald-200 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <i className={`fas ${ARTICLE_ICONS[child.type]}`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{child.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{child.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR METADATOS (INFOBOX) */}
          <aside className="w-full lg:w-80 order-1 lg:order-2">
            <div className="sticky top-8 space-y-6 infobox">
              {currentLogo && (
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-center shadow-sm overflow-hidden mb-2">
                    <img src={currentLogo.url} alt={currentLogo.label} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentLogo.label}</span>
                </div>
              )}

              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Ficha del Documento</h5>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Responsable</label>
                    <p className="text-sm font-black text-slate-800 leading-tight">{article.metadata.responsible || "No asignado"}</p>
                  </div>
                  {article.metadata.sector && (
                    <div>
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Sector Ámbito</label>
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">{article.metadata.sector}</p>
                    </div>
                  )}
                  {article.metadata.lawCode && (
                    <div>
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Referencia Legal</label>
                      <div className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-600 shadow-sm mt-1">
                        {article.metadata.lawCode}
                      </div>
                    </div>
                  )}
                  {article.metadata.established && (
                    <div>
                      <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Establecido</label>
                      <p className="text-xs font-bold text-slate-600">{article.metadata.established}</p>
                    </div>
                  )}
                </div>

                {/* HISTÓRICO DE LOGOS EN INFOBOX */}
                {article.metadata.logos && article.metadata.logos.length > 1 && (
                  <div className="pt-6 border-t border-slate-100 no-print">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evolución de Identidad</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {article.metadata.logos.slice(1).map((logo, idx) => (
                        <div key={idx} className="group flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <img src={logo.url} alt={logo.label} className="w-12 h-12 object-contain mb-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[8px] font-black text-slate-400 text-center uppercase leading-tight">{logo.label}</span>
                          <span className="text-[7px] font-bold text-slate-300">{logo.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {article.metadata.tags.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 no-print">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Etiquetas</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {article.metadata.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-200 cursor-default transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;