'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import {
    MessageSquare,
    Plus,
    Pin,
    PinOff,
    Trash2,
    Edit2,
    X,
    Check,
    Lock,
    Unlock,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RichTextEditor, RichTextViewer, type RichTextEditorRef } from '@/components/ui/rich-text-editor';
import { useNoteStore } from '@/store/noteStore';
import type { Note, NoteEntityType } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface NotesPanelProps {
    entityType: NoteEntityType;
    entityId: string;
    title?: string;
    currentUserId?: string;
    className?: string;
    maxHeight?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

interface NoteItemProps {
    note: Note;
    currentUserId?: string;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
}

const NoteItem = memo<NoteItemProps>(({ note, currentUserId, onEdit, onDelete, onTogglePin }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isOwner = currentUserId === note.createdBy;

    return (
        <>
            <div
                className={cn(
                    'group relative rounded-lg border bg-card p-3 transition-all hover:shadow-sm',
                    note.isPinned && 'border-primary/50 bg-primary/5'
                )}
            >
                {/* Header */}
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{note.createdBy}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                        {note.updatedAt !== note.createdAt && (
                            <>
                                <span>•</span>
                                <span className="italic">edited</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {note.isPinned && (
                            <Pin className="h-3 w-3 text-primary" />
                        )}
                        {note.isInternal && (
                            <Lock className="h-3 w-3 text-amber-500" />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="prose-sm">
                    <RichTextViewer content={DOMPurify.sanitize(note.content)} className="text-sm" />
                </div>

                {/* Actions */}
                <div className="absolute -right-1 -top-1 flex items-center gap-0.5 rounded-md border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onTogglePin(note.id)}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                        {note.isPinned ? (
                            <PinOff className="h-3 w-3" />
                        ) : (
                            <Pin className="h-3 w-3" />
                        )}
                    </Button>
                    {isOwner && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => onEdit(note)}
                                title="Edit"
                            >
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                                title="Delete"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete(note.id);
                                setShowDeleteConfirm(false);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});
NoteItem.displayName = 'NoteItem';

export const NotesPanel = memo<NotesPanelProps>(({
    entityType,
    entityId,
    title = 'Notes',
    currentUserId = 'System',
    className,
    maxHeight = '400px',
    collapsible = false,
    defaultCollapsed = false,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isAdding, setIsAdding] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isInternal, setIsInternal] = useState(false);
    const [content, setContent] = useState('');
    const editorRef = useRef<RichTextEditorRef>(null);

    const { getNotesByEntity, createNote, updateNote, deleteNote, togglePinNote } = useNoteStore();
    const notes = getNotesByEntity(entityType, entityId);

    const handleCreateNote = useCallback(() => {
        if (!content.trim() || content === '<p></p>') return;

        createNote({
            entityType,
            entityId,
            content,
            plainText: editorRef.current?.getText() || '',
            createdBy: currentUserId,
            isPinned: false,
            isInternal,
        });

        setContent('');
        setIsInternal(false);
        setIsAdding(false);
    }, [content, entityType, entityId, currentUserId, isInternal, createNote]);

    const handleUpdateNote = useCallback(() => {
        if (!editingNote || !content.trim() || content === '<p></p>') return;

        updateNote(editingNote.id, {
            content,
            plainText: editorRef.current?.getText() || '',
            isInternal,
        });

        setContent('');
        setIsInternal(false);
        setEditingNote(null);
    }, [editingNote, content, isInternal, updateNote]);

    const handleStartEdit = useCallback((note: Note) => {
        setEditingNote(note);
        setContent(note.content);
        setIsInternal(note.isInternal || false);
        setIsAdding(false);
    }, []);

    const handleCancel = useCallback(() => {
        setIsAdding(false);
        setEditingNote(null);
        setContent('');
        setIsInternal(false);
    }, []);

    const handleStartAdd = useCallback(() => {
        setIsAdding(true);
        setEditingNote(null);
        setContent('');
        setIsInternal(false);
    }, []);

    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            {/* Header */}
            <div
                className={cn(
                    'flex items-center justify-between border-b px-4 py-3',
                    collapsible && 'cursor-pointer hover:bg-muted/50'
                )}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {notes.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!isCollapsed && !isAdding && !editingNote && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStartAdd();
                            }}
                        >
                            <Plus className="h-3 w-3" />
                            Add Note
                        </Button>
                    )}
                    {collapsible && (
                        isCollapsed ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        )
                    )}
                </div>
            </div>

            {/* Content */}
            {!isCollapsed && (
                <div className="p-4">
                    {/* Add/Edit Form */}
                    {(isAdding || editingNote) && (
                        <div className="mb-4 space-y-3 rounded-lg border bg-muted/30 p-3">
                            <RichTextEditor
                                ref={editorRef}
                                content={content}
                                onChange={setContent}
                                placeholder="Write your note..."
                                toolbarVariant="minimal"
                                minHeight="80px"
                                maxHeight="200px"
                                autofocus
                            />
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'h-7 gap-1 text-xs',
                                        isInternal && 'text-amber-500'
                                    )}
                                    onClick={() => setIsInternal(!isInternal)}
                                >
                                    {isInternal ? (
                                        <>
                                            <Lock className="h-3 w-3" />
                                            Internal Only
                                        </>
                                    ) : (
                                        <>
                                            <Unlock className="h-3 w-3" />
                                            Visible to All
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1 text-xs"
                                        onClick={handleCancel}
                                    >
                                        <X className="h-3 w-3" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-7 gap-1 text-xs"
                                        onClick={editingNote ? handleUpdateNote : handleCreateNote}
                                        disabled={!content.trim() || content === '<p></p>'}
                                    >
                                        <Check className="h-3 w-3" />
                                        {editingNote ? 'Update' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes List */}
                    <div
                        className="space-y-3 overflow-y-auto pr-1"
                        style={{ maxHeight }}
                    >
                        {notes.length === 0 && !isAdding ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No notes yet</p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="mt-1 h-auto p-0 text-xs"
                                    onClick={handleStartAdd}
                                >
                                    Add the first note
                                </Button>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <NoteItem
                                    key={note.id}
                                    note={note}
                                    currentUserId={currentUserId}
                                    onEdit={handleStartEdit}
                                    onDelete={deleteNote}
                                    onTogglePin={togglePinNote}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
NotesPanel.displayName = 'NotesPanel';

export default NotesPanel;
