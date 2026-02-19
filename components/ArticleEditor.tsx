import React, { useState, useRef } from 'react';
import { Article, ArticleType, ActivityLevel, ArticleLogo } from '../types';

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
      logos: article.metadata?.logos || [],
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
    <div className="bg-white border border-[#a2a9b1] p-6 animate-fade-in shadow-sm">
      <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-serif italic text-slate-800">
          {article.id && article.title ? `Editando: ${article.title}` : 'Crear nuevo artículo'}
        </h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-1 text-sm border border-slate-300 hover:bg-slate-50">Descartar</button>
          <button 
            onClick={() => onSave(formData)} 
            className="px-6 py-1 text-sm bg-[#36c] text-white font-bold hover:bg-[#447ff5]"
          >
            Grabar página
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Título de la página</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-[#a2a9b1] focus:border-[#36c] outline-none text-lg"
              placeholder="Ej: Departamento de Hacienda"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 bg-[#f8f9fa] border border-[#a2a9b1] border-b-0 p-1">
              <button onClick={() => injectSyntax("## ", "")} className="px-2 py-1 text-xs hover:bg-white border border-transparent hover:border-slate-300 font-bold">H2</button>
              <button onClick={() => injectSyntax("### ", "")} className="px-2 py-1 text-xs hover:bg-white border border-transparent hover:border-slate-300 font-bold">H3</button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <button onClick={() => injectSyntax("**", "**")} className="px-2 py-1 text-xs hover:bg-white border border-transparent hover:border-slate-300 font-bold"><i className="fas fa-bold"></i></button>
              <button onClick={() => injectSyntax("[[id|", "]]")} className="px-2 py-1 text-xs hover:bg-white border border-transparent hover:border-slate-300 font-bold text-[#36c]">Link</button>
              <button onClick={() => injectSyntax("[", "]")} className="px-2 py-1 text-xs hover:bg-white border border-transparent hover:border-slate-300 font-bold text-slate-500">Badge</button>
            </div>
            <textarea 
              ref={textareaRef}
              rows={18} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-3 border border-[#a2a9b1] font-mono text-sm outline-none focus:bg-[#fcfcfc] resize-y"
              placeholder="Escribe el contenido en formato Wiki..."
            />
          </div>
        </div>

        <div className="space-y-6 bg-slate-50 p-4 border border-[#a2a9b1]">
          <h3 className="text-xs font-bold border-b border-slate-300 pb-1 mb-3">Metadatos de la ficha</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de artículo</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as ArticleType})}
                className="w-full px-2 py-1 border border-slate-300 text-xs outline-none"
              >
                {Object.values(ArticleType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Padre (Jerarquía)</label>
              <select 
                value={formData.parentId || ''} 
                onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
                className="w-full px-2 py-1 border border-slate-300 text-xs outline-none"
              >
                <option value="">(Raíz)</option>
                {allArticles.filter(a => a.id !== formData.id).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsable</label>
              <input type="text" value={formData.metadata.responsible} onChange={e => setFormData({...formData, metadata: {...formData.metadata, responsible: e.target.value}})} className="w-full px-2 py-1 border border-slate-300 text-xs outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cód. Normativo</label>
              <input type="text" value={formData.metadata.lawCode} onChange={e => setFormData({...formData, metadata: {...formData.metadata, lawCode: e.target.value}})} className="w-full px-2 py-1 border border-slate-300 text-xs font-mono outline-none" placeholder="NORM-XXX" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resumen (Intro)</label>
              <textarea 
                rows={3} 
                value={formData.summary} 
                onChange={e => setFormData({...formData, summary: e.target.value})}
                className="w-full px-2 py-1 border border-slate-300 text-xs outline-none resize-none"
                placeholder="Breve descripción..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;