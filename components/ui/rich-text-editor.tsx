'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { memo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Unlink,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    ImageIcon,
    Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export interface RichTextEditorRef {
    getHTML: () => string;
    getJSON: () => Record<string, unknown>;
    getText: () => string;
    setContent: (content: string) => void;
    clearContent: () => void;
    focus: () => void;
    editor: Editor | null;
}

export interface RichTextEditorProps {
    content?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
    onBlur?: () => void;
    editable?: boolean;
    className?: string;
    minHeight?: string;
    maxHeight?: string;
    showToolbar?: boolean;
    toolbarVariant?: 'full' | 'minimal' | 'basic';
    autofocus?: boolean;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip: string;
    children: React.ReactNode;
}

const ToolbarButton = memo<ToolbarButtonProps>(
    ({ onClick, isActive, disabled, tooltip, children }) => (
        <TooltipPrimitive.Provider delayDuration={300}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClick}
                        disabled={disabled}
                        className={cn(
                            'h-8 w-8 p-0 hover:bg-muted',
                            isActive && 'bg-muted text-primary'
                        )}
                    >
                        {children}
                    </Button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side="bottom"
                        className="z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-slate-50 animate-in fade-in-0 zoom-in-95"
                        sideOffset={4}
                    >
                        {tooltip}
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
);
ToolbarButton.displayName = 'ToolbarButton';

const ToolbarDivider = memo(() => (
    <div className="mx-1 h-6 w-px bg-border" />
));
ToolbarDivider.displayName = 'ToolbarDivider';

interface EditorToolbarProps {
    editor: Editor | null;
    variant: 'full' | 'minimal' | 'basic';
}

const EditorToolbar = memo<EditorToolbarProps>(({ editor, variant }) => {
    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Validate URL to prevent dangerous schemes
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
                alert('Invalid URL protocol. Only http, https, and mailto are allowed.');
                return;
            }
        } catch {
            alert('Invalid URL format.');
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const basicTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                tooltip="Bold (Ctrl+B)"
            >
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                tooltip="Italic (Ctrl+I)"
            >
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                tooltip="Underline (Ctrl+U)"
            >
                <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const formattingTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                tooltip="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                tooltip="Inline Code"
            >
                <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                tooltip="Highlight"
            >
                <Highlighter className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const headingTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                tooltip="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                tooltip="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                tooltip="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const listTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                tooltip="Bullet List"
            >
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                tooltip="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                tooltip="Task List"
            >
                <ListChecks className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                tooltip="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const alignmentTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                tooltip="Align Left"
            >
                <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                tooltip="Align Center"
            >
                <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                tooltip="Align Right"
            >
                <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                tooltip="Justify"
            >
                <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const insertTools = (
        <>
            <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} tooltip="Add Link">
                <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
                tooltip="Remove Link"
            >
                <Unlink className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} tooltip="Add Image">
                <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                tooltip="Horizontal Rule"
            >
                <Minus className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    const historyTools = (
        <>
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                tooltip="Undo (Ctrl+Z)"
            >
                <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                tooltip="Redo (Ctrl+Y)"
            >
                <Redo className="h-4 w-4" />
            </ToolbarButton>
        </>
    );

    if (variant === 'basic') {
        return (
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
                {basicTools}
                <ToolbarDivider />
                {historyTools}
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
                {basicTools}
                {formattingTools}
                <ToolbarDivider />
                {listTools}
                <ToolbarDivider />
                {historyTools}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
            {basicTools}
            {formattingTools}
            <ToolbarDivider />
            {headingTools}
            <ToolbarDivider />
            {listTools}
            <ToolbarDivider />
            {alignmentTools}
            <ToolbarDivider />
            {insertTools}
            <ToolbarDivider />
            {historyTools}
        </div>
    );
});
EditorToolbar.displayName = 'EditorToolbar';

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    (
        {
            content = '',
            placeholder = 'Start typing...',
            onChange,
            onBlur,
            editable = true,
            className,
            minHeight = '120px',
            maxHeight = '400px',
            showToolbar = true,
            toolbarVariant = 'full',
            autofocus = false,
        },
        ref
    ) => {
        const editor = useEditor({
            extensions: [
                StarterKit.configure({
                    heading: { levels: [1, 2, 3] },
                }),
                Placeholder.configure({ placeholder }),
                Underline,
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
                }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Highlight.configure({ multicolor: true }),
                TextStyle,
                Color,
                TaskList,
                TaskItem.configure({ nested: true }),
                Image.configure({ inline: true }),
            ],
            content,
            editable,
            autofocus,
            onUpdate: ({ editor }) => {
                onChange?.(editor.getHTML());
            },
            onBlur: () => {
                onBlur?.();
            },
            editorProps: {
                attributes: {
                    class: cn(
                        'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2',
                        'prose-headings:font-semibold prose-headings:text-foreground',
                        'prose-p:text-foreground prose-p:leading-relaxed',
                        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                        'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
                        'prose-ul:list-disc prose-ol:list-decimal',
                        '[&_ul[data-type="taskList"]]:list-none [&_ul[data-type="taskList"]]:pl-0',
                        '[&_ul[data-type="taskList"]_li]:flex [&_ul[data-type="taskList"]_li]:gap-2 [&_ul[data-type="taskList"]_li]:items-start',
                        '[&_ul[data-type="taskList"]_li_label]:mt-0.5'
                    ),
                },
            },
            immediatelyRender: false,
        });

        useImperativeHandle(ref, () => ({
            getHTML: () => editor?.getHTML() ?? '',
            getJSON: () => editor?.getJSON() ?? {},
            getText: () => editor?.getText() ?? '',
            setContent: (newContent: string) => editor?.commands.setContent(newContent),
            clearContent: () => editor?.commands.clearContent(),
            focus: () => editor?.commands.focus(),
            editor,
        }));

        useEffect(() => {
            if (editor && content !== editor.getHTML()) {
                editor.commands.setContent(content);
            }
        }, [content, editor]);

        useEffect(() => {
            if (editor) {
                editor.setEditable(editable);
            }
        }, [editable, editor]);

        if (!editor) {
            return (
                <div
                    className={cn(
                        'rounded-md border border-input bg-background animate-pulse',
                        className
                    )}
                    style={{ minHeight }}
                />
            );
        }

        return (
            <div
                className={cn(
                    'rounded-md border border-input bg-background overflow-hidden transition-colors',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    !editable && 'opacity-60 cursor-not-allowed',
                    className
                )}
            >
                {showToolbar && editable && (
                    <EditorToolbar editor={editor} variant={toolbarVariant} />
                )}
                <div
                    className="overflow-y-auto"
                    style={{ minHeight, maxHeight }}
                >
                    <EditorContent editor={editor} />
                </div>
            </div>
        );
    }
);
RichTextEditor.displayName = 'RichTextEditor';

export const RichTextViewer = memo<{
    content: string;
    className?: string;
}>(({ content, className }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            TextStyle,
            Color,
            TaskList,
            TaskItem,
            Image,
        ],
        content,
        editable: false,
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div
            className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                'prose-headings:font-semibold prose-headings:text-foreground',
                'prose-p:text-foreground prose-p:leading-relaxed',
                'prose-a:text-primary hover:prose-a:underline',
                '[&_ul[data-type="taskList"]]:list-none [&_ul[data-type="taskList"]]:pl-0',
                className
            )}
        >
            <EditorContent editor={editor} />
        </div>
    );
});
RichTextViewer.displayName = 'RichTextViewer';

export default RichTextEditor;
