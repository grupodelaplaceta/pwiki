import React, { useState, useEffect } from 'react';
import { Article, ArticleType, ActivityLevel } from '../types';
import TiptapEditor from './TiptapEditor';

interface ArticleEditorProps {
  article: Partial<Article>;
  allArticles: Article[];
  onSave: (article: Article) => void;
  onCancel: () => void;
}

const markdownToHtml = (markdown: string) => {
  if (!markdown) return '';
  
  // Check if it's already HTML
  if (/^\s*<[a-z][\s\S]*>/i.test(markdown) || /<\/(p|div|h[1-6]|ul|ol|li|blockquote)>/.test(markdown)) {
    return markdown;
  }

  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>');
  
  // Fix nested lists (very basic)
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  
  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  
  // Line breaks to paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.trim().startsWith('<')) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
};

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, allArticles, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Article>({
    id: article.id || `art-${Date.now()}`,
    title: article.title || '',
    type: article.type || ArticleType.ARTICLE,
    activityLevel: article.activityLevel || ActivityLevel.ACTIVE,
    parentId: article.parentId || undefined,
    content: markdownToHtml(article.content || ''),
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
            <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Contenido</label>
            <TiptapEditor 
              content={formData.content} 
              onChange={(html) => setFormData({...formData, content: html})}
              placeholder="Escribe el contenido del artículo..."
              articles={allArticles}
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
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sector / Área</label>
                <input 
                  type="text" 
                  value={formData.metadata.sector} 
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, sector: e.target.value}})} 
                  className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200" 
                  placeholder="Ej: Finanzas, RRHH..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Etiquetas (separadas por comas)</label>
                <input 
                  type="text" 
                  value={formData.metadata.tags.join(', ')} 
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)}})} 
                  className="w-full bg-white rounded-lg px-3 py-2 text-[10px] font-bold outline-none border border-transparent focus:border-emerald-200" 
                  placeholder="Ej: urgente, borrador, 2024"
                />
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