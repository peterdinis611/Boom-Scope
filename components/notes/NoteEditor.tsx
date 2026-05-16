"use client";

import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	CheckSquare,
	Code,
	Heading1,
	Heading2,
	Highlighter,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Minus,
	Quote,
	Redo,
	Strikethrough,
	Terminal,
	Underline as UnderlineIcon,
	Undo,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NoteEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
	if (!editor) {
		return null;
	}

	const setLink = () => {
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("Zadajte URL adresu", previousUrl);

		if (url === null) {
			return;
		}

		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	};

	return (
		<div className="flex flex-wrap gap-1 border-b border-border p-2 bg-muted/30">
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? "bg-muted" : ""}
			>
				<Bold className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? "bg-muted" : ""}
			>
				<Italic className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={editor.isActive("underline") ? "bg-muted" : ""}
			>
				<UnderlineIcon className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className={editor.isActive("strike") ? "bg-muted" : ""}
			>
				<Strikethrough className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleHighlight().run()}
				className={editor.isActive("highlight") ? "bg-muted" : ""}
			>
				<Highlighter className="size-4" />
			</Button>

			<div className="mx-1 w-px bg-border" />

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
			>
				<Heading1 className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
			>
				<Heading2 className="size-4" />
			</Button>

			<div className="mx-1 w-px bg-border" />

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? "bg-muted" : ""}
			>
				<List className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? "bg-muted" : ""}
			>
				<ListOrdered className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleTaskList().run()}
				className={editor.isActive("taskList") ? "bg-muted" : ""}
			>
				<CheckSquare className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={editor.isActive("blockquote") ? "bg-muted" : ""}
			>
				<Quote className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			>
				<Minus className="size-4" />
			</Button>

			<div className="mx-1 w-px bg-border" />

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={editor.isActive("code") ? "bg-muted" : ""}
			>
				<Code className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={editor.isActive("codeBlock") ? "bg-muted" : ""}
			>
				<Terminal className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={setLink}
				className={editor.isActive("link") ? "bg-muted" : ""}
			>
				<LinkIcon className="size-4" />
			</Button>

			<div className="ml-auto flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().chain().focus().undo().run()}
				>
					<Undo className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().chain().focus().redo().run()}
				>
					<Redo className="size-4" />
				</Button>
			</div>
		</div>
	);
};

export function NoteEditor({
	content,
	onChange,
	placeholder = "Začnite písať...",
}: NoteEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			Highlight.configure({ multicolor: true }),
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			LinkExtension.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline underline-offset-4 cursor-pointer",
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
			},
		},
	});

	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	return (
		<div className="flex flex-col rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
			<MenuBar editor={editor} />
			<div className="max-h-[600px] overflow-y-auto">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
