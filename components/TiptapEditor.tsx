import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const isActive = (type: string, opts?: any) => editor.isActive(type, opts);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('bold') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Negrita"
      >
        <i className="fas fa-bold text-xs"></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('italic') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Cursiva"
      >
        <i className="fas fa-italic text-xs"></i>
      </button>
      
      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors font-bold text-xs",
          isActive('heading', { level: 2 }) && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Título 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors font-bold text-xs",
          isActive('heading', { level: 3 }) && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Título 3"
      >
        H3
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('bulletList') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Lista con viñetas"
      >
        <i className="fas fa-list-ul text-xs"></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('orderedList') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Lista numerada"
      >
        <i className="fas fa-list-ol text-xs"></i>
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('blockquote') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Cita"
      >
        <i className="fas fa-quote-right text-xs"></i>
      </button>
      
      <button
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('URL del enlace:', previousUrl);
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-colors",
          isActive('link') && "bg-white text-emerald-600 shadow-sm"
        )}
        title="Enlace"
      >
        <i className="fas fa-link text-xs"></i>
      </button>

      <div className="flex-1"></div>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30"
        title="Deshacer"
      >
        <i className="fas fa-undo text-xs"></i>
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30"
        title="Rehacer"
      >
        <i className="fas fa-redo text-xs"></i>
      </button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange, placeholder }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 underline decoration-emerald-300 decoration-2 underline-offset-2 hover:text-emerald-700 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe aquí...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-slate-400 before:float-left before:pointer-events-none',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[300px] p-6 text-slate-700 leading-relaxed',
      },
    },
  });

  return (
    <div className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-emerald-100 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
