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
    <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fade-in mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 heading-font tracking-tight">
            {article.id && article.title ? 'Modificar Publicación' : 'Redactar Nuevo Documento'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Panel de Control Editorial</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onCancel} className="flex-1 md:flex-none px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all">DESCARTAR</button>
          <button 
            onClick={() => onSave(formData)} 
            className="flex-1 md:flex-none px-10 py-4 text-xs font-black bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
          >
            PUBLICAR CAMBIOS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Título del Documento</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xl font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all"
              placeholder="Escribe el nombre aquí..."
            />
          </div>

          <div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-t-2xl border-b-2 border-white">
              <button onClick={() => injectSyntax("## ", "")} className="w-10 h-10 flex items-center justify-center font-black hover:bg-white rounded-xl transition-all">H2</button>
              <button onClick={() => injectSyntax("### ", "")} className="w-10 h-10 flex items-center justify-center font-black hover:bg-white rounded-xl transition-all">H3</button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button onClick={() => injectSyntax("**", "**")} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><i className="fas fa-bold"></i></button>
              <button onClick={() => injectSyntax("[[id|", "]]")} className="px-4 h-10 flex items-center justify-center text-[10px] font-black text-emerald-600 hover:bg-white rounded-xl transition-all">WIKI LINK</button>
              <button onClick={() => injectSyntax("[", "]")} className="px-4 h-10 flex items-center justify-center text-[10px] font-black text-slate-400 hover:bg-white rounded-xl transition-all">BADGE</button>
            </div>
            <textarea 
              ref={textareaRef}
              rows={20} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-b-2xl p-8 font-mono text-sm outline-none focus:bg-white focus:border-emerald-100 transition-all resize-none custom-scrollbar leading-relaxed"
              placeholder="Cuerpo del artículo en formato markdown..."
            />
          </div>
        </div>

        <div className="space-y-10">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">Ficha Técnica</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Artículo</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as ArticleType})}
                  className="w-full bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-200"
                >
                  {Object.values(ArticleType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Superior (Jerarquía)</label>
                <select 
                  value={formData.parentId || ''} 
                  onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
                  className="w-full bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-200"
                >
                  <option value="">(Raíz)</option>
                  {allArticles.filter(a => a.id !== formData.id).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Responsable</label>
                <input type="text" value={formData.metadata.responsible} onChange={e => setFormData({...formData, metadata: {...formData.metadata, responsible: e.target.value}})} className="w-full bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-200" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Código Normativo</label>
                <input type="text" value={formData.metadata.lawCode} onChange={e => setFormData({...formData, metadata: {...formData.metadata, lawCode: e.target.value}})} className="w-full bg-white rounded-xl px-4 py-3 text-xs font-black font-mono outline-none border border-transparent focus:border-emerald-200" placeholder="Ej: NORM-001" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resumen Corto</label>
                <textarea 
                  rows={4} 
                  value={formData.summary} 
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  className="w-full bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-200 resize-none"
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