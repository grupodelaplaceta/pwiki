import React, { useState, useRef } from 'react';
import { Article, ArticleType, ActivityLevel } from '../types';

interface ArticleEditorProps {
  article: Partial<Article>;
  allArticles: Article[];
  onSave: (article: Article) => void;
  onCancel: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, allArticles, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Article>({
    id: article.id || `art-${Date.now()}`,
    title: article.title || '',
    type: article.type || ArticleType.ARTICLE,
    activityLevel: article.activityLevel || ActivityLevel.ACTIVE,
    parentId: article.parentId || undefined,
    content: article.content || '',
    summary: article.summary || '',
    metadata: {
      responsible: article.metadata?.responsible || '',
      established: article.metadata?.established || '',
      status: article.metadata?.status || 'Activo',
      lawCode: article.metadata?.lawCode || '',
      sector: article.metadata?.sector || '',
      tags: article.metadata?.tags || [],
    },
    updatedAt: new Date().toISOString(),
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const injectSyntax = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = formData.content;
    const selectedText = currentText.substring(start, end);
    const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);
    
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 heading-font tracking-tight">
            {article.id && article.title ? 'Modificar Publicación' : 'Redactar Nuevo Documento'}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Panel de Control Editorial</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={onCancel} className="flex-1 md:flex-none px-6 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all">DESCARTAR</button>
          <button 
            onClick={() => onSave(formData)} 
            className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black bg-slate-900 text-white rounded-xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
          >
            PUBLICAR CAMBIOS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Título del Documento</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-lg font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all"
              placeholder="Escribe el nombre aquí..."
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-t-xl border-b-2 border-white">
              <button onClick={() => injectSyntax("## ", "")} className="w-8 h-8 flex items-center justify-center text-xs font-black hover:bg-white rounded-lg transition-all">H2</button>
              <button onClick={() => injectSyntax("### ", "")} className="w-8 h-8 flex items-center justify-center text-xs font-black hover:bg-white rounded-lg transition-all">H3</button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button onClick={() => injectSyntax("**", "**")} className="w-8 h-8 flex items-center justify-center text-xs hover:bg-white rounded-lg transition-all"><i className="fas fa-bold"></i></button>
              <button onClick={() => injectSyntax("[[id|", "]]")} className="px-3 h-8 flex items-center justify-center text-[9px] font-black text-emerald-600 hover:bg-white rounded-lg transition-all">WIKI LINK</button>
              <button onClick={() => injectSyntax("[", "]")} className="px-3 h-8 flex items-center justify-center text-[9px] font-black text-slate-400 hover:bg-white rounded-lg transition-all">BADGE</button>
            </div>
            <textarea 
              ref={textareaRef}
              rows={15} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-b-xl p-6 font-mono text-xs outline-none focus:bg-white focus:border-emerald-100 transition-all resize-none custom-scrollbar leading-relaxed"
              placeholder="Cuerpo del artículo en formato markdown..."
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">Ficha Técnica</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Artículo</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as ArticleType})}
                  className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200"
                >
                  {Object.values(ArticleType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Superior (Jerarquía)</label>
                <select 
                  value={formData.parentId || ''} 
                  onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
                  className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200"
                >
                  <option value="">(Raíz)</option>
                  {allArticles.filter(a => a.id !== formData.id).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsable</label>
                <input type="text" value={formData.metadata.responsible} onChange={e => setFormData({...formData, metadata: {...formData.metadata, responsible: e.target.value}})} className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200" />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Código Normativo</label>
                <input type="text" value={formData.metadata.lawCode} onChange={e => setFormData({...formData, metadata: {...formData.metadata, lawCode: e.target.value}})} className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-black font-mono outline-none border border-transparent focus:border-emerald-200" placeholder="Ej: NORM-001" />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen Corto</label>
                <textarea 
                  rows={3} 
                  value={formData.summary} 
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200 resize-none"
                  placeholder="Introduce una breve descripción..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;