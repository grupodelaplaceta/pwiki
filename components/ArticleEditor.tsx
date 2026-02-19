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

  const addLogo = () => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        logos: [...(prev.metadata.logos || []), { url: '', label: '', period: '' }]
      }
    }));
  };

  const removeLogo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        logos: (prev.metadata.logos || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateLogo = (index: number, field: keyof ArticleLogo, value: string) => {
    setFormData(prev => {
      const newLogos = [...(prev.metadata.logos || [])];
      newLogos[index] = { ...newLogos[index], [field]: value };
      return {
        ...prev,
        metadata: { ...prev.metadata, logos: newLogos }
      };
    });
  };

  return (
    <div className="bg-white shadow-2xl border border-slate-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col animate-fade-in">
      <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 bg-slate-50/20">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight heading-font">
            {article.id && article.title ? 'Modificar Entrada' : 'Nuevo Documento'}
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Editor Institucional</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={onCancel} className="flex-1 md:flex-none px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button 
            onClick={() => onSave(formData)} 
            className="flex-1 md:flex-none px-6 py-3 text-sm font-black text-white bg-slate-900 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Publicar
          </button>
        </div>
      </div>

      <div className="p-5 md:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Título del Documento</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Título..."
                className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-base focus:border-emerald-100 outline-none transition-all font-bold text-slate-800 bg-slate-50/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Clase</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as ArticleType})}
                  className="w-full px-4 py-4 border-2 border-slate-50 rounded-2xl text-xs outline-none bg-slate-50/30 font-black text-slate-600"
                >
                  {Object.values(ArticleType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Actividad</label>
                <select 
                  value={formData.activityLevel} 
                  onChange={e => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}
                  className="w-full px-4 py-4 border-2 border-slate-50 rounded-2xl text-xs outline-none bg-slate-50/30 font-black text-slate-600"
                >
                  {Object.values(ActivityLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Extracto / Resumen</label>
            <textarea 
              rows={4} 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})}
              placeholder="Breve resumen institucional..."
              className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl text-sm outline-none focus:border-emerald-100 transition-all resize-none bg-slate-50/30 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Parentesco (Jerarquía)</label>
              <select 
                value={formData.parentId || ''} 
                onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
                className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl text-xs outline-none bg-slate-50/30 font-bold"
              >
                <option value="">Documento Raíz</option>
                {allArticles.filter(a => a.id !== formData.id).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Gestor Responsable</label>
              <input type="text" placeholder="Nombre..." value={formData.metadata.responsible} onChange={e => setFormData({...formData, metadata: {...formData.metadata, responsible: e.target.value}})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl text-xs outline-none focus:border-emerald-100 bg-slate-50/30 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-2">Código Registro</label>
              <input type="text" placeholder="Ej: NORM-001..." value={formData.metadata.lawCode} onChange={e => setFormData({...formData, metadata: {...formData.metadata, lawCode: e.target.value}})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl text-xs font-mono outline-none focus:border-emerald-100 bg-slate-50/30 font-black" />
            </div>
        </div>

        <div className="flex flex-col border-2 border-slate-50 rounded-[2rem] overflow-hidden bg-white shadow-inner">
          <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={() => injectSyntax('## ', '')} className="p-3 px-5 text-xs font-black hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">H2</button>
            <button onClick={() => injectSyntax('### ', '')} className="p-3 px-5 text-xs font-black hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">H3</button>
            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
            <button onClick={() => injectSyntax('**', '**')} className="p-3 px-5 text-xs font-black hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><i className="fas fa-bold"></i></button>
            <button onClick={() => injectSyntax('- ', '')} className="p-3 px-5 text-xs font-black hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><i className="fas fa-list-ul"></i></button>
            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
            <button onClick={() => injectSyntax('[[id|', ']]')} className="p-3 px-5 text-[10px] font-black text-emerald-700 bg-emerald-50/50 hover:bg-white rounded-xl transition-all">LINK WIKI</button>
          </div>
          
          <textarea 
            ref={textareaRef}
            rows={15} 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full px-6 py-6 font-mono text-sm outline-none focus:bg-white transition-all resize-none custom-scrollbar leading-relaxed"
            placeholder="Cuerpo del documento..."
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;