"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sanitizeJournalHtml } from "@/lib/journal-rich-text";
import { cn } from "@/lib/utils";

const TEXT_COLORS = [
  "#3B2F2F",
  "#A3472A",
  "#C75B39",
  "#5D7A47",
  "#4D6B8A",
  "#7C5C8E",
];

const HIGHLIGHT_COLORS = [
  "#FFE3B3",
  "#FFD0D7",
  "#D9F3C4",
  "#CFEAFF",
  "#E3DAFF",
  "#F5E7C8",
];

function ToolbarButton({
  active,
  className,
  onPointerDown,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] border text-foreground transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-border/80 bg-secondary text-secondary-foreground shadow-sm"
          : "border-transparent hover:bg-muted hover:text-foreground",
        className
      )}
      aria-pressed={active}
      onPointerDown={(event) => {
        event.preventDefault();
        onPointerDown?.(event);
      }}
      {...props}
    />
  );
}

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const normalizedValue = useMemo(() => sanitizeJournalHtml(value), [value]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        HTMLAttributes: {
          alt: "Ảnh trong nhật ký",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Hôm nay tôi đã...",
      }),
    ],
    content: normalizedValue,
    editorProps: {
      attributes: {
        class:
          "journal-editor__content min-h-[260px] px-4 py-4 text-base leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml === normalizedValue) return;
    editor.commands.setContent(normalizedValue, { emitUpdate: false });
  }, [editor, normalizedValue]);

  const insertImageFiles = useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return;

      setUploading(true);
      try {
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          const url = await onUploadImage(file);
          editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        }
      } finally {
        setUploading(false);
      }
    },
    [editor, onUploadImage]
  );

  const handleImagePickerChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      await insertImageFiles(files);
      event.target.value = "";
    },
    [insertImageFiles]
  );

  const handlePasteCapture = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(event.clipboardData.items)
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      if (files.length === 0) return;

      event.preventDefault();
      void insertImageFiles(files);
    },
    [insertImageFiles]
  );

  if (!editor) return null;

  return (
    <div className="rounded-[1.55rem] border border-border/70 bg-card/95 shadow-[0_18px_44px_-30px_rgba(101,68,46,0.18)] transition-shadow focus-within:shadow-[0_24px_52px_-34px_rgba(101,68,46,0.32)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Khung viết nhật ký</p>
          <p className="text-xs text-muted-foreground">
            Giữ màu, quote, danh sách và ảnh khi lên trang xem.
          </p>
        </div>
        <div className="rounded-full bg-muted/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Rich text
        </div>
      </div>

      <div className="border-b border-border/70 bg-background/65 px-3 py-2">
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          <ToolbarButton
            active={editor.isActive("bold")}
            onPointerDown={() => editor.chain().focus().toggleBold().run()}
            aria-label="Tô đậm"
            title="Tô đậm"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onPointerDown={() => editor.chain().focus().toggleItalic().run()}
            aria-label="In nghiêng"
            title="In nghiêng"
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onPointerDown={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Gạch ngang"
            title="Gạch ngang"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onPointerDown={() => editor.chain().focus().toggleList("bulletList", "listItem").run()}
            aria-label="Gạch đầu dòng"
            title="Gạch đầu dòng"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onPointerDown={() => editor.chain().focus().toggleList("orderedList", "listItem").run()}
            aria-label="Danh sách số"
            title="Danh sách số"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            onPointerDown={() => editor.chain().focus().toggleWrap("blockquote").run()}
            aria-label="Trích dẫn"
            title="Trích dẫn"
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <Popover>
            <PopoverTrigger render={<ToolbarButton aria-label="Màu chữ" title="Màu chữ" />}>
              <Type className="size-4" />
            </PopoverTrigger>
            <PopoverContent className="w-56 gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Màu chữ
              </p>
              <div className="grid grid-cols-6 gap-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-7 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                    aria-label={`Chọn màu ${color}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Xóa màu chữ
              </Button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger render={<ToolbarButton aria-label="Màu nền" title="Highlight" />}>
              <Highlighter className="size-4" />
            </PopoverTrigger>
            <PopoverContent className="w-56 gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Highlight
              </p>
              <div className="grid grid-cols-6 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-7 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                    aria-label={`Highlight ${color}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Xóa highlight
              </Button>
            </PopoverContent>
          </Popover>

          <div className="mx-1 h-6 w-px shrink-0 bg-border/80" />

          <ToolbarButton
            onPointerDown={() => fileInputRef.current?.click()}
            aria-label="Chèn ảnh"
            title="Chèn ảnh"
          >
            <ImagePlus className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onPointerDown={() => editor.chain().focus().undo().run()}
            aria-label="Undo"
            title="Undo"
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onPointerDown={() => editor.chain().focus().redo().run()}
            aria-label="Redo"
            title="Redo"
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <div className="px-1 py-1.5">
        <div className="rounded-[1.2rem] bg-background/55">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagePickerChange}
            className="hidden"
          />

          <div onPasteCapture={handlePasteCapture}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          Dán ảnh trực tiếp hoặc dùng nút ảnh. List, quote và màu sẽ được giữ nguyên khi xem lại.
        </span>
        <span>{uploading ? "Đang upload ảnh..." : "Sẵn sàng để viết"}</span>
      </div>
    </div>
  );
}
