"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	CheckSquare,
	ChevronDown,
	Code,
	Columns,
	FileImage,
	Heading1,
	Heading2,
	Heading3,
	Highlighter,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Maximize2,
	Minimize2,
	Minus,
	Palette,
	Quote,
	Redo,
	Strikethrough,
	Subscript as SubscriptIcon,
	Superscript as SuperscriptIcon,
	Table as TableIcon,
	Terminal,
	Type,
	Underline as UnderlineIcon,
	Undo,
	Video,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	/** Character limit for the editor (optional) */
	characterLimit?: number;
	/** Enable focus / zen mode toggle */
	enableFocusMode?: boolean;
	/** Callback when word count changes */
	onWordCountChange?: (count: number) => void;
}

// ─── Toolbar helpers ─────────────────────────────────────────────────────────

const ToolbarButton = ({
	onClick,
	isActive,
	disabled,
	tooltip,
	children,
}: {
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	tooltip: string;
	children: React.ReactNode;
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={onClick}
				disabled={disabled}
				className={cn(
					"transition-colors",
					isActive && "bg-muted text-foreground",
				)}
			>
				{children}
			</Button>
		</TooltipTrigger>
		<TooltipContent side="bottom" className="text-xs">
			{tooltip}
		</TooltipContent>
	</Tooltip>
);

const ToolbarSeparator = () => (
	<div className="mx-1 w-px self-stretch bg-border" />
);

// ─── Colour picker ────────────────────────────────────────────────────────────

const TEXT_COLORS = [
	"#000000", // Black
	"#374151", // Dark Gray
	"#6b7280", // Gray
	"#9ca3af", // Light Gray
	"#ffffff", // White
	"#ef4444", // Red
	"#f97316", // Orange
	"#f59e0b", // Amber
	"#eab308", // Yellow
	"#84cc16", // Lime
	"#22c55e", // Green
	"#10b981", // Emerald
	"#14b8a6", // Teal
	"#06b6d4", // Cyan
	"#0ea5e9", // Sky
	"#3b82f6", // Blue
	"#6366f1", // Indigo
	"#8b5cf6", // Violet
	"#a855f7", // Purple
	"#d946ef", // Fuchsia
	"#ec4899", // Pink
	"#f43f5e", // Rose
];

const HIGHLIGHT_COLORS = [
	"#fef08a", // Yellow
	"#bbf7d0", // Green
	"#bfdbfe", // Blue
	"#f5d0fe", // Purple
	"#fed7aa", // Orange
	"#fecaca", // Red
	"#ccfbf1", // Teal
	"#e0e7ff", // Indigo
	"#fae8ff", // Pink
	"#f1f5f9", // Slate
];

const ColorPicker = ({
	editor,
	type,
}: {
	editor: Editor;
	type: "text" | "highlight";
}) => {
	const colors = type === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;
	const isActive =
		type === "text"
			? !!editor.getAttributes("textStyle").color
			: editor.isActive("highlight");

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className={cn(isActive && "bg-muted")}
						>
							{type === "text" ? (
								<Palette className="size-4" />
							) : (
								<Highlighter className="size-4" />
							)}
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{type === "text" ? "Text color" : "Highlight"}
				</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-auto p-3" align="start">
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					{type === "text" ? "Text color" : "Highlight color"}
				</p>
				<div className="grid grid-cols-6 gap-1">
					{colors.map((color) => (
						<button
							key={color}
							title={color}
							onClick={() => {
								if (type === "text") {
									editor.chain().focus().setColor(color).run();
								} else {
									editor.chain().focus().toggleHighlight({ color }).run();
								}
							}}
							className="size-6 rounded border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				{type === "text" && (
					<Button
						variant="ghost"
						size="sm"
						className="mt-2 w-full text-xs"
						onClick={() => editor.chain().focus().unsetColor().run()}
					>
						Reset color
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
};

// ─── Font family selector ─────────────────────────────────────────────────────

const FONTS = [
	{ label: "Default", value: "" },
	{ label: "Serif", value: "Georgia, serif" },
	{ label: "Mono", value: "ui-monospace, monospace" },
	{ label: "Arial", value: "Arial, sans-serif" },
	{ label: "Comic Sans", value: "'Comic Sans MS', cursive" },
] as const;

const FontSelector = ({ editor }: { editor: Editor }) => {
	const current =
		FONTS.find((f) => f.value === editor.getAttributes("textStyle").fontFamily)
			?.label ?? "Font";

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 gap-1 px-2 text-xs"
						>
							<Type className="size-3" />
							{current}
							<ChevronDown className="size-3 opacity-60" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					Font family
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel className="text-xs">Font family</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{FONTS.map(({ label, value }) => (
					<DropdownMenuItem
						key={label}
						onClick={() =>
							value
								? editor.chain().focus().setFontFamily(value).run()
								: editor.chain().focus().unsetFontFamily().run()
						}
						className={cn(
							"text-sm",
							editor.getAttributes("textStyle").fontFamily === value &&
								"bg-muted font-medium",
						)}
					>
						<span style={{ fontFamily: value || undefined }}>{label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

// ─── Heading selector ─────────────────────────────────────────────────────────

const HeadingSelector = ({ editor }: { editor: Editor }) => {
	const getActiveHeading = () => {
		for (const level of [1, 2, 3] as const) {
			if (editor.isActive("heading", { level })) return `H${level}`;
		}
		return "¶";
	};

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 gap-1 px-2 text-xs"
						>
							{getActiveHeading()}
							<ChevronDown className="size-3 opacity-60" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					Heading level
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start">
				<DropdownMenuItem
					onClick={() => editor.chain().focus().setParagraph().run()}
					className={editor.isActive("paragraph") ? "bg-muted" : ""}
				>
					<span className="text-sm">Paragraph</span>
				</DropdownMenuItem>
				{([1, 2, 3] as const).map((level) => (
					<DropdownMenuItem
						key={level}
						onClick={() =>
							editor.chain().focus().toggleHeading({ level }).run()
						}
						className={editor.isActive("heading", { level }) ? "bg-muted" : ""}
					>
						<span
							className="font-semibold"
							style={{ fontSize: `${22 - (level - 1) * 3}px` }}
						>
							Heading {level}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

// ─── Table menu ───────────────────────────────────────────────────────────────

const TableMenu = ({ editor }: { editor: Editor }) => (
	<DropdownMenu>
		<Tooltip>
			<TooltipTrigger asChild>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						className={editor.isActive("table") ? "bg-muted" : ""}
					>
						<TableIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="text-xs">
				Table
			</TooltipContent>
		</Tooltip>
		<DropdownMenuContent align="start">
			<DropdownMenuLabel className="text-xs">Insert table</DropdownMenuLabel>
			<DropdownMenuItem
				onClick={() =>
					editor
						.chain()
						.focus()
						.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
						.run()
				}
			>
				3 × 3
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() =>
					editor
						.chain()
						.focus()
						.insertTable({ rows: 4, cols: 4, withHeaderRow: true })
						.run()
				}
			>
				4 × 4
			</DropdownMenuItem>
			{editor.isActive("table") && (
				<>
					<DropdownMenuSeparator />
					<DropdownMenuLabel className="text-xs">Edit table</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addColumnAfter().run()}
					>
						Add column after
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addRowAfter().run()}
					>
						Add row after
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteColumn().run()}
					>
						Delete column
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteRow().run()}
					>
						Delete row
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteTable().run()}
						className="text-destructive"
					>
						Delete table
					</DropdownMenuItem>
				</>
			)}
		</DropdownMenuContent>
	</DropdownMenu>
);

// ─── Image inserter ───────────────────────────────────────────────────────────

const ImageInserter = ({ editor }: { editor: Editor }) => {
	const [url, setUrl] = useState("");
	const [open, setOpen] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const insertFromUrl = () => {
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
			setUrl("");
			setOpen(false);
		}
	};

	const insertFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const src = ev.target?.result as string;
			editor.chain().focus().setImage({ src }).run();
		};
		reader.readAsDataURL(file);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<FileImage className="size-4" />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					Insert image
				</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-72 p-3" align="start">
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Insert image
				</p>
				<div className="flex gap-2">
					<Input
						placeholder="https://example.com/image.png"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
						className="h-8 text-xs"
					/>
					<Button size="sm" className="h-8" onClick={insertFromUrl}>
						Add
					</Button>
				</div>
				<Separator className="my-2" />
				<Button
					variant="outline"
					size="sm"
					className="h-8 w-full text-xs"
					onClick={() => fileRef.current?.click()}
				>
					Upload from device
				</Button>
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={insertFromFile}
				/>
			</PopoverContent>
		</Popover>
	);
};

// ─── YouTube inserter ─────────────────────────────────────────────────────────

const YoutubeInserter = ({ editor }: { editor: Editor }) => {
	const [url, setUrl] = useState("");
	const [open, setOpen] = useState(false);

	const insert = () => {
		if (url) {
			editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
			setUrl("");
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<Video className="size-4" />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					Embed YouTube
				</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-72 p-3" align="start">
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Embed YouTube video
				</p>
				<div className="flex gap-2">
					<Input
						placeholder="https://youtube.com/watch?v=..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && insert()}
						className="h-8 text-xs"
					/>
					<Button size="sm" className="h-8" onClick={insert}>
						Add
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

// ─── Link dialog ──────────────────────────────────────────────────────────────

const LinkButton = ({ editor }: { editor: Editor }) => {
	const [url, setUrl] = useState("");
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setUrl(editor.getAttributes("link").href ?? "");
		setOpen(true);
	};

	const apply = () => {
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: url })
				.run();
		}
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleOpen}
							className={editor.isActive("link") ? "bg-muted" : ""}
						>
							<LinkIcon className="size-4" />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					Insert link
				</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-72 p-3" align="start">
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Insert / edit link
				</p>
				<div className="flex gap-2">
					<Input
						placeholder="https://..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && apply()}
						className="h-8 text-xs"
					/>
					<Button size="sm" className="h-8" onClick={apply}>
						{url ? "Apply" : "Remove"}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

// ─── Full menu bar ─────────────────────────────────────────────────────────────

const MenuBar = ({
	editor,
	isFocusMode,
	onToggleFocusMode,
	enableFocusMode,
}: {
	editor: Editor | null;
	isFocusMode: boolean;
	onToggleFocusMode: () => void;
	enableFocusMode: boolean;
}) => {
	if (!editor) return null;

	return (
		<TooltipProvider delayDuration={400}>
			<div
				className={cn(
					"flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 bg-muted/30",
					isFocusMode && "justify-center",
				)}
			>
				{/* History */}
				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().chain().focus().undo().run()}
					tooltip="Undo (Ctrl+Z)"
				>
					<Undo className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().chain().focus().redo().run()}
					tooltip="Redo (Ctrl+Y)"
				>
					<Redo className="size-4" />
				</ToolbarButton>

				<ToolbarSeparator />

				{/* Heading + font */}
				<HeadingSelector editor={editor} />
				<FontSelector editor={editor} />

				<ToolbarSeparator />

				{/* Inline marks */}
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive("bold")}
					disabled={!editor.can().chain().focus().toggleBold().run()}
					tooltip="Bold (Ctrl+B)"
				>
					<Bold className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive("italic")}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
					tooltip="Italic (Ctrl+I)"
				>
					<Italic className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					isActive={editor.isActive("underline")}
					tooltip="Underline (Ctrl+U)"
				>
					<UnderlineIcon className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					isActive={editor.isActive("strike")}
					tooltip="Strikethrough"
				>
					<Strikethrough className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleSubscript().run()}
					isActive={editor.isActive("subscript")}
					tooltip="Subscript"
				>
					<SubscriptIcon className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleSuperscript().run()}
					isActive={editor.isActive("superscript")}
					tooltip="Superscript"
				>
					<SuperscriptIcon className="size-4" />
				</ToolbarButton>

				<ToolbarSeparator />

				{/* Color */}
				<ColorPicker editor={editor} type="text" />
				<ColorPicker editor={editor} type="highlight" />

				<ToolbarSeparator />

				{/* Alignment */}
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					isActive={editor.isActive({ textAlign: "left" })}
					tooltip="Align left"
				>
					<AlignLeft className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					isActive={editor.isActive({ textAlign: "center" })}
					tooltip="Align center"
				>
					<AlignCenter className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					isActive={editor.isActive({ textAlign: "right" })}
					tooltip="Align right"
				>
					<AlignRight className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					isActive={editor.isActive({ textAlign: "justify" })}
					tooltip="Justify"
				>
					<AlignJustify className="size-4" />
				</ToolbarButton>

				<ToolbarSeparator />

				{/* Lists */}
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={editor.isActive("bulletList")}
					tooltip="Bullet list"
				>
					<List className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={editor.isActive("orderedList")}
					tooltip="Numbered list"
				>
					<ListOrdered className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleTaskList().run()}
					isActive={editor.isActive("taskList")}
					tooltip="Task list"
				>
					<CheckSquare className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={editor.isActive("blockquote")}
					tooltip="Blockquote"
				>
					<Quote className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
					tooltip="Horizontal rule"
				>
					<Minus className="size-4" />
				</ToolbarButton>

				<ToolbarSeparator />

				{/* Code */}
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					isActive={editor.isActive("code")}
					tooltip="Inline code"
				>
					<Code className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					isActive={editor.isActive("codeBlock")}
					tooltip="Code block"
				>
					<Terminal className="size-4" />
				</ToolbarButton>

				<ToolbarSeparator />

				{/* Rich embeds */}
				<TableMenu editor={editor} />
				<ImageInserter editor={editor} />
				<YoutubeInserter editor={editor} />
				<LinkButton editor={editor} />

				{/* Focus mode toggle */}
				{enableFocusMode && (
					<>
						<ToolbarSeparator />
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={onToggleFocusMode}
									className={isFocusMode ? "bg-muted" : ""}
								>
									{isFocusMode ? (
										<Minimize2 className="size-4" />
									) : (
										<Maximize2 className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" className="text-xs">
								{isFocusMode ? "Exit focus mode" : "Focus mode"}
							</TooltipContent>
						</Tooltip>
					</>
				)}
			</div>
		</TooltipProvider>
	);
};

// ─── Status bar ───────────────────────────────────────────────────────────────

const StatusBar = ({
	editor,
	characterLimit,
}: {
	editor: Editor | null;
	characterLimit?: number;
}) => {
	if (!editor) return null;

	const charCount = editor.storage.characterCount?.characters() ?? 0;
	const wordCount = editor.storage.characterCount?.words() ?? 0;
	const limitReached = characterLimit ? charCount >= characterLimit : false;

	return (
		<div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
			<div className="flex gap-4">
				<span>{wordCount} words</span>
				<span className={cn(limitReached && "font-medium text-destructive")}>
					{charCount}
					{characterLimit ? `/${characterLimit}` : ""} characters
				</span>
			</div>
			{characterLimit && (
				<div className="flex items-center gap-2">
					<div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"h-full rounded-full transition-all",
								limitReached ? "bg-destructive" : "bg-primary",
							)}
							style={{
								width: `${Math.min(100, (charCount / characterLimit) * 100)}%`,
							}}
						/>
					</div>
					<span>{Math.round((charCount / characterLimit) * 100)}%</span>
				</div>
			)}
		</div>
	);
};

// ─── Floating link toolbar (shown when a link is selected) ────────────────────

const FloatingLinkToolbar = ({ editor }: { editor: Editor }) => {
	const href = editor.getAttributes("link").href as string | undefined;
	if (!editor.isActive("link") || !href) return null;

	return (
		<div className="flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 shadow-md text-xs">
			<LinkIcon className="size-3 text-muted-foreground" />
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="max-w-50 truncate text-primary underline underline-offset-2"
			>
				{href}
			</a>
			<Button
				variant="ghost"
				size="icon-sm"
				className="h-5 w-5"
				onClick={() =>
					editor.chain().focus().extendMarkRange("link").unsetLink().run()
				}
			>
				<X className="size-3" />
			</Button>
		</div>
	);
};

// ─── Two-column layout helper command ────────────────────────────────────────
// (inserts a simple HTML block — TipTap doesn't ship a columns extension so we
//  use a workaround with a pre-formatted HTML snippet via pasteHTML)

// ─── Main component ───────────────────────────────────────────────────────────

export function NoteEditor({
	content,
	onChange,
	placeholder = "Start writing…",
	characterLimit,
	enableFocusMode = true,
	onWordCountChange,
}: NoteEditorProps) {
	const [isFocusMode, setIsFocusMode] = useState(false);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			TextStyle,
			Color,
			FontFamily,
			Subscript,
			Superscript,
			Typography,
			Highlight.configure({ multicolor: true }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			TaskList,
			TaskItem.configure({ nested: true }),
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
			Image.configure({ inline: false, allowBase64: true }),
			Youtube.configure({ controls: true, nocookie: true }),
			LinkExtension.configure({
				openOnClick: false,
				HTMLAttributes: {
					class:
						"text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors",
				},
			}),
			Placeholder.configure({ placeholder }),
			...(characterLimit
				? [CharacterCount.configure({ limit: characterLimit })]
				: [CharacterCount]),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
			onWordCountChange?.(editor.storage.characterCount?.words() ?? 0);
		},
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
					"prose-table:border-collapse prose-td:border prose-td:border-border prose-td:p-2",
					"prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted/50",
					isFocusMode ? "min-h-screen" : "min-h-[300px]",
				),
			},
		},
	});

	// Sync external content changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	// Keyboard shortcut for focus mode
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape" && isFocusMode) setIsFocusMode(false);
		},
		[isFocusMode],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div
			className={cn(
				"flex flex-col rounded-md border border-input bg-background ring-offset-background",
				"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
				"transition-all duration-200",
				isFocusMode &&
					"fixed inset-4 z-50 shadow-2xl rounded-lg border-2 border-primary/30",
			)}
		>
			{/* Backdrop for focus mode */}
			{isFocusMode && (
				<div
					className="fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm"
					onClick={() => setIsFocusMode(false)}
				/>
			)}

			<MenuBar
				editor={editor}
				isFocusMode={isFocusMode}
				onToggleFocusMode={() => setIsFocusMode((v) => !v)}
				enableFocusMode={enableFocusMode}
			/>

			{/* Floating link toolbar */}
			{editor?.isActive("link") && (
				<div className="border-b border-border px-3 py-1.5">
					<FloatingLinkToolbar editor={editor} />
				</div>
			)}

			<div
				className={cn("overflow-y-auto", isFocusMode ? "flex-1" : "max-h-150")}
			>
				<EditorContent editor={editor} />
			</div>

			<StatusBar editor={editor} characterLimit={characterLimit} />
		</div>
	);
}
