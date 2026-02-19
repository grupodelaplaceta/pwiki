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
    [ActivityLevel.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
    [ActivityLevel.SEMI_ACTIVE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [ActivityLevel.INACTIVE]: 'bg-gray-100 text-gray-800 border-gray-200',
  }[article.activityLevel];

  const renderRichText = (text: string) => {
    let html = text;
    // Wikipedia-style markdown transform
    html = html.replace(/## (.*)/g, '<h2 id="$1">$1</h2>');
    html = html.replace(/### (.*)/g, '<h3>$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\- (.*)/gm, '<li class="ml-4 mb-1">$1</li>');
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
    <div className="animate-fade-in">
      {/* HEADER REALISTA */}
      <div className="flex justify-between items-baseline border-b border-[#a2a9b1] pb-1 mb-6">
        <h1 className="text-3xl font-serif text-black">{article.title}</h1>
        <div className="no-print flex gap-3 text-[13px] text-[#36c]">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:underline">Artículo</button>
          <button className="hover:underline text-slate-400 cursor-not-allowed">Discusión</button>
          <div className="w-px h-3 bg-slate-300 self-center"></div>
          <button onClick={() => window.scrollTo({top: 0})} className="font-bold text-black border-b-2 border-emerald-500 pb-1">Leer</button>
          <button onClick={onEdit} className="hover:underline">Editar</button>
          <button onClick={() => window.print()} className="hover:underline">Imprimir</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {article.summary && (
            <div className="text-[14px] leading-relaxed mb-6">
              {article.summary}
            </div>
          )}

          {/* TABLA DE CONTENIDOS (Wikipedia Style) */}
          <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-3 inline-block min-w-[200px] mb-8 no-print">
            <div className="text-center font-bold text-xs mb-2">Sumario</div>
            <ul className="text-xs space-y-1">
              <li className="text-[#36c] hover:underline cursor-pointer">1. General</li>
              <li className="text-[#36c] hover:underline cursor-pointer">2. Dependencias</li>
              <li className="text-[#36c] hover:underline cursor-pointer">3. Marco Normativo</li>
            </ul>
          </div>

          <div 
            className="wiki-content text-[14px] leading-relaxed text-[#202122]"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
          />

          {children.length > 0 && (
            <div className="mt-12 border-t border-[#a2a9b1] pt-4">
              <h2 className="text-lg font-bold mb-3">Dependencias y sub-artículos</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc ml-5">
                {children.map(child => (
                  <li key={child.id}>
                    <button onClick={() => onNavigate(child.id)} className="text-[#36c] text-[14px] hover:underline">
                      {child.title}
                    </button>
                    <span className="text-[10px] text-slate-400 ml-2 uppercase">({child.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* INFOBOX REALISTA */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="infobox shadow-sm">
            <div className="text-center font-bold bg-[#eaecf0] p-2 mb-3 border-b border-[#a2a9b1]">
              {article.title}
            </div>
            
            {article.metadata.logos?.[0] && (
              <div className="mb-4 border-b border-[#a2a9b1] pb-3 text-center">
                <img src={article.metadata.logos[0].url} alt="Logo" className="mx-auto max-h-32 mb-1" />
                <div className="text-[10px] italic text-slate-500">{article.metadata.logos[0].label}</div>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <th className="py-2 pr-2 font-bold text-slate-600 align-top w-28">Tipo</th>
                  <td className="py-2">{article.type}</td>
                </tr>
                <tr>
                  <th className="py-2 pr-2 font-bold text-slate-600 align-top">Estado</th>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${activityBadge}`}>
                      {article.activityLevel}
                    </span>
                  </td>
                </tr>
                {article.metadata.responsible && (
                  <tr>
                    <th className="py-2 pr-2 font-bold text-slate-600 align-top">Gestión</th>
                    <td className="py-2">{article.metadata.responsible}</td>
                  </tr>
                )}
                {article.metadata.lawCode && (
                  <tr>
                    <th className="py-2 pr-2 font-bold text-slate-600 align-top">Ref. Legal</th>
                    <td className="py-2 font-mono text-[11px] font-bold text-emerald-700">{article.metadata.lawCode}</td>
                  </tr>
                )}
                {article.metadata.established && (
                  <tr>
                    <th className="py-2 pr-2 font-bold text-slate-600 align-top">Creación</th>
                    <td className="py-2">{article.metadata.established}</td>
                  </tr>
                )}
                {parent && (
                  <tr>
                    <th className="py-2 pr-2 font-bold text-slate-600 align-top">Superior</th>
                    <td className="py-2">
                      <button onClick={() => onNavigate(parent.id)} className="text-[#36c] hover:underline text-left">
                        {parent.title}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {article.metadata.tags.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#a2a9b1]">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Categorías</div>
                <div className="flex flex-wrap gap-1">
                  {article.metadata.tags.map(t => (
                    <span key={t} className="text-[#36c] hover:underline cursor-pointer">[[Categoría:{t}]]</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-16 pt-2 border-t border-slate-300 text-[11px] text-slate-500 flex flex-col gap-1">
        <div>Esta página fue editada por última vez el {new Date(article.updatedAt).toLocaleDateString()} a las {new Date(article.updatedAt).toLocaleTimeString()}.</div>
        <div className="flex gap-2">
          <span>Versión: 3.4.12-rev</span>
          <span>•</span>
          <span className="no-print text-[#36c] cursor-pointer hover:underline">Ver historial</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;