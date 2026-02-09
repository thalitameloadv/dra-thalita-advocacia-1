import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { htmlToMarkdown, markdownToHtml } from '@/lib/richText';
import { imageUploadService } from '@/services/imageUploadService';
import { toast } from 'sonner';

export type RichTextValue = {
  html: string;
  markdown: string;
};

export type RichTextEditorMode = 'html' | 'markdown';

export interface RichTextEditorProps {
  value?: Partial<RichTextValue>;
  onChange?: (value: RichTextValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  imageBucket?: string;
  initialContentMode?: RichTextEditorMode;
}

function isActive(editor: Editor | null, name: string, attrs?: Record<string, unknown>) {
  if (!editor) return false;
  return editor.isActive(name, attrs);
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  imageBucket = 'blog-images',
  initialContentMode = 'html',
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastEmitted, setLastEmitted] = useState<string>('');

  const initialHtml = useMemo(() => {
    const html = value?.html;
    const md = value?.markdown;

    if (initialContentMode === 'html') {
      if (html && html.trim()) return html;
      if (md && md.trim()) return markdownToHtml(md);
      return '';
    }

    if (md && md.trim()) return markdownToHtml(md);
    if (html && html.trim()) return html;
    return '';
  }, [initialContentMode, value?.html, value?.markdown]);

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          style: 'max-width:100%;height:auto;display:block;',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html === lastEmitted) return;

      const markdown = htmlToMarkdown(html);
      setLastEmitted(html);
      onChange?.({ html, markdown });
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[220px] px-3 py-3',
        'data-placeholder': placeholder || '',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextHtml = initialHtml;
    const currentHtml = editor.getHTML();

    if (nextHtml && nextHtml !== currentHtml && nextHtml !== lastEmitted) {
      editor.commands.setContent(nextHtml, false);
      setLastEmitted(nextHtml);
    }

    if (!nextHtml && currentHtml !== '<p></p>' && !lastEmitted) {
      editor.commands.clearContent(false);
      setLastEmitted('');
    }
  }, [editor, initialHtml, lastEmitted]);

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL do link', previousUrl || '');

    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: trimmed })
      .run();
  };

  const uploadAndInsertImage = async (file: File) => {
    if (!editor) return;

    try {
      const optimized = await imageUploadService.optimizeImage(file);
      const uploaded = await imageUploadService.uploadImage(optimized, {
        bucket: imageBucket,
        generateThumbnails: true,
      });

      editor.chain().focus().setImage({ src: uploaded.url, alt: uploaded.name }).run();
    } catch (e) {
      console.error(e);
      toast.error('Falha ao fazer upload da imagem');
    }
  };

  const onPickImage = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await uploadAndInsertImage(file);
  };

  if (!editor) {
    return (
      <div className={className}>
        <div className="h-10 rounded-md bg-slate-100" />
        <div className="mt-2 h-64 rounded-md bg-slate-50 border" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-white p-2">
        <Button type="button" variant={isActive(editor, 'bold') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'italic') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'underline') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={disabled}>
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'strike') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={disabled}>
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isActive(editor, 'heading', { level: 1 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={disabled}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'heading', { level: 2 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'heading', { level: 3 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled}>
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isActive(editor, 'bulletList') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'orderedList') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'taskList') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} disabled={disabled}>
          <CheckSquare className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isActive(editor, 'blockquote') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'code') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleCode().run()} disabled={disabled}>
          <Code className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive(editor, 'codeBlock') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} disabled={disabled}>
          <Code className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isActive(editor, 'link') ? 'default' : 'outline'} size="sm" onClick={setLink} disabled={disabled}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().unsetLink().run()} disabled={disabled || !editor.isActive('link')}>
          <Unlink className="h-4 w-4" />
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onPickImage} disabled={disabled}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isActive(editor, 'paragraph') && editor.getAttributes('textAlign').textAlign === 'left' ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={disabled}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.getAttributes('textAlign').textAlign === 'center' ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={disabled}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.getAttributes('textAlign').textAlign === 'right' ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={disabled}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.getAttributes('textAlign').textAlign === 'justify' ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()} disabled={disabled}>
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} disabled={disabled}>
          <RemoveFormatting className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}>
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2 rounded-md border bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
