'use client';
import styles from './tiptap-editor.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import FontSize from 'tiptap-extension-font-size';
import { CustomImage, YouTubeVideo } from '../extended';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...(this as any).parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...(this as any).parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});
import { useCallback, useEffect, useRef, useState } from 'react';
import { useContentStore, useContentStoreSelector } from '@/components/custom-ui/tiptap/plugin';
import { cn } from '@/lib/utils';
import { Toolbar } from './toolbar';
import { TableContextMenu } from '../menus/table-context-menu';
import { FontOptions, FontFamilyKey, Pxs } from '../plugin/tiptap-font-config/constants';
import { useIsMobile } from '@/hooks/use-mobile';

type DefaultEditorOptions = {
  fontSize?: Pxs;
  fontFamily?: FontFamilyKey;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
};

type Props = React.HTMLAttributes<HTMLElement> & {
  keyId: string;
  height?: number;
  width?: number | string;
  onImageUpload?: (file: File) => Promise<string>;
  onChange?: (content: string) => void;
  content?: string;
  defaultOptions?: DefaultEditorOptions;
};

export const TiptapEditor = ({
  className,
  keyId,
  height = 400,
  content: initialContentProp,
  onImageUpload,
  onChange,
  defaultOptions,
}: Props) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { getContent, setContent } = useContentStore();
  // 특정 키만 구독하여 불필요한 리렌더링 방지
  const { content: storedContent } = useContentStoreSelector(keyId);

  const initialContent = initialContentProp ?? storedContent ?? getContent(keyId);

  const editor = useEditor({
    extensions: [
      Color,
      Highlight.configure({ multicolor: true }),
      StarterKit.configure({
        // StarterKit에 포함된 extension 중 중복 방지를 위해 제외
        // Link와 Underline은 별도로 추가하므로 제외
      }),
      Underline,
      FontFamily,
      TextStyle,
      FontSize as any,
      CustomImage,
      YouTubeVideo,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'right', 'center'],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'font-bold hover:text-orange-600 hover:underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'h-full',
      },
    },
    immediatelyRender: false,
    // EditorContent 리렌더링 최적화
    shouldRerenderOnTransaction: false,
    onCreate: ({ editor }) => {
      // 에디터 생성 시 기본값 설정
      if (editor.isEmpty) {
        const fontSize = defaultOptions?.fontSize ?? '18px';
        const fontFamily = FontOptions[defaultOptions?.fontFamily ?? '맑은고딕'];
        let chain = editor.chain().focus().setFontSize(fontSize).setFontFamily(fontFamily);
        if (defaultOptions?.bold) chain = chain.setBold();
        if (defaultOptions?.italic) chain = chain.setItalic();
        if (defaultOptions?.underline) chain = chain.setUnderline();
        if (defaultOptions?.color) chain = chain.setColor(defaultOptions.color);
        if (defaultOptions?.textAlign) chain = chain.setTextAlign(defaultOptions.textAlign);
        chain.blur().run();
      }
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setContent(keyId, content);
      onChange?.(content);
    },
  });

  const didSetInitialContent = useRef(false);
  const isMobile = useIsMobile(641);

  useEffect(() => {
    if (!editor) return;

    // 초기값 설정 (최초 1회)
    if (initialContentProp === undefined) {
      return;
    }

    if (didSetInitialContent.current && editor.getHTML() === initialContentProp) {
      return;
    }
    editor.commands.setContent(initialContentProp);
    setContent(keyId, initialContentProp);
    didSetInitialContent.current = true;
  }, [editor, initialContentProp, keyId, setContent]);

  const resolvedHeight = typeof height === 'number' && height > 0 ? height : 400;
  const responsiveHeight = isMobile ? Math.min(resolvedHeight, 500) : resolvedHeight;

  const editorContentStyle = isMobile
    ? { minHeight: `${responsiveHeight}px`, maxHeight: `${resolvedHeight}px` }
    : { height: `${resolvedHeight}px` };

  // 모바일에서 에디터 빈 영역 터치 시 포커스 활성화
  const handleEditorAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || editor.isFocused) return;
      const target = e.target as HTMLElement;
      if (target.closest('.ProseMirror')) return;
      editor.commands.focus('end');
    },
    [editor],
  );

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const hasFiles = Array.from(e.dataTransfer.items).some(
      (item) => item.kind === 'file' && item.type.startsWith('image/'),
    );
    if (!hasFiles) return;
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (!editor) return;

      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;

      for (const file of files) {
        if (onImageUpload) {
          const url = await onImageUpload(file);
          if (url) editor.chain().focus().setImage({ src: url }).enter().run();
        } else {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            editor.chain().focus().setImage({ src: base64 }).enter().run();
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [editor, onImageUpload],
  );

  if (!editor) return null;

  const editorContent = (
    <div
      onClick={handleEditorAreaClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn('relative cursor-text', isFullscreen ? 'min-h-0 flex-1 overflow-y-auto' : '')}
      style={isFullscreen ? undefined : editorContentStyle}
    >
      {isDraggingOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded bg-blue-50/80 ring-2 ring-inset ring-blue-400">
          <span className="rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">이미지를 놓으세요</span>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'w-full border-none [&>.tiptap]:!outline-none [&_.resize-cursor]:cursor-col-resize',
          isFullscreen ? 'min-h-full p-8' : 'h-full p-6 max-sm:p-4',
          styles.tiptapGlobalStyles,
        )}
      />
    </div>
  );

  return (
    <>
      {/* 전체보기 오버레이 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <div className="w-full overflow-hidden border-b">
            <Toolbar
              editor={editor}
              onImageUpload={onImageUpload}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(false)}
              defaultOptions={defaultOptions}
            />
          </div>
          {editorContent}
          <TableContextMenu editor={editor} />
        </div>
      )}

      {/* 일반 에디터 */}
      <div
        className={cn(
          'relative w-full max-w-full overflow-hidden rounded-xl border',
          'max-sm:rounded-lg max-sm:shadow-none',
          className,
        )}
      >
        <div className="w-full overflow-hidden">
          <Toolbar
            editor={editor}
            onImageUpload={onImageUpload}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(true)}
            defaultOptions={defaultOptions}
          />
        </div>
        {!isFullscreen && editorContent}
        <TableContextMenu editor={editor} />
      </div>
    </>
  );
};
