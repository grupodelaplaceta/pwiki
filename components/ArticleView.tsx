import React, { useMemo, useRef } from 'react';
import { Article, ArticleType, ActivityLevel, ARTICLE_ICONS } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ArticleViewProps {
  article: Article;
  onEdit: () => void;
  onNavigate: (id: string) => void;
  allArticles: Article[];
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onEdit, onNavigate, allArticles }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

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
    html = html.replace(/^\- (.*)/gm, '<li class="ml-4 mb-2 text-slate-600 font-medium">$1</li>');
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

  const handleExportPDF = async () => {
    if (!contentRef.current || isExporting) return;
    setIsExporting(true);
    
    const element = contentRef.current;

    try {
      // Wait for fonts to be ready
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Inject font stylesheet into the clone to ensure it's available
          const link = clonedDoc.createElement('link');
          link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap';
          link.rel = 'stylesheet';
          clonedDoc.head.appendChild(link);

          // Hide action buttons in the clone
          const actionButtons = clonedDoc.querySelector('.no-print') as HTMLElement;
          if (actionButtons) actionButtons.style.display = 'none';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${article.title || 'document'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={contentRef} className="animate-fade-in pb-10">
      {/* HEADER DE ARTICULO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">{article.type}</div>
             <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${activityBadge}`}>{article.activityLevel}</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{article.title}</h1>
        </div>
        <div className="no-print flex items-center gap-2">
           <button onClick={onEdit} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm">
             <i className="fas fa-edit text-sm"></i>
           </button>
           <button onClick={() => window.print()} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
             <i className="fas fa-print text-sm"></i>
           </button>
           <button 
             onClick={handleExportPDF} 
             disabled={isExporting}
             className={`p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm ${isExporting ? 'opacity-50 cursor-wait' : ''}`} 
             title="Exportar a PDF"
           >
             {isExporting ? <i className="fas fa-spinner fa-spin text-sm"></i> : <i className="fas fa-file-pdf text-sm"></i>}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {article.summary && (
            <div className="text-base md:text-lg text-slate-500 font-semibold leading-relaxed mb-6 italic">
              {article.summary}
            </div>
          )}

          <div 
            className="wiki-content text-sm md:text-base leading-relaxed text-slate-700 font-medium"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
          />

          {children.length > 0 && (
            <div className="mt-12 p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
              <h2 className="text-lg font-black mb-4">Estructura Dependiente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {children.map(child => (
                  <button 
                    key={child.id} 
                    onClick={() => onNavigate(child.id)}
                    className="group bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all text-left shadow-sm flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                      <i className={`fas ${ARTICLE_ICONS[child.type]} text-xs`}></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{child.title}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">{child.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INFOBOX MODERNO */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="infobox sticky top-20">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <i className={`fas ${ARTICLE_ICONS[article.type]} text-2xl text-slate-300`}></i>
            </div>
            
            <div className="text-center mb-6 pb-6 border-b border-slate-50">
               <h4 className="font-black text-slate-900 text-base mb-1">{article.title}</h4>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{article.metadata.sector || 'Ficha Institucional'}</p>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Responsable</span>
                 <span className="text-[11px] font-bold text-slate-700">{article.metadata.responsible || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ref. Legal</span>
                 <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md tracking-tighter">{article.metadata.lawCode || 'S/N'}</span>
               </div>
               <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Antigüedad</span>
                 <span className="text-[11px] font-bold text-slate-700">{article.metadata.established || '-'}</span>
               </div>
               {parent && (
                  <div className="pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Superior Jerárquico</span>
                    <button onClick={() => onNavigate(parent.id)} className="w-full bg-slate-50 p-2 rounded-lg text-left text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                       <i className="fas fa-arrow-up text-[9px] opacity-40"></i>
                       {parent.title}
                    </button>
                  </div>
               )}
            </div>

            {article.metadata.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex flex-wrap gap-1.5">
                  {article.metadata.tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-slate-50 text-[9px] font-black text-slate-400 rounded-md hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all">#{t.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 text-[10px] text-slate-300 font-black uppercase tracking-widest flex flex-col md:flex-row justify-between gap-3">
        <div>Actualizado el {new Date(article.updatedAt).toLocaleDateString()} &bull; {new Date(article.updatedAt).toLocaleTimeString()}</div>
        <div className="flex gap-4">
          <span className="cursor-help hover:text-slate-400 transition-colors">Log de Cambios</span>
          <span className="cursor-help hover:text-slate-400 transition-colors">Verificar Firma</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;