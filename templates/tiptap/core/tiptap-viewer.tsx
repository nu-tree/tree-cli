'use client';

import styles from './tiptap-editor.module.css';
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import FontSize from 'tiptap-extension-font-size';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { CustomImage, YouTubeVideo } from '../extended';
import Link from '@tiptap/extension-link';
import { cn } from '@/lib/utils';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useContentStoreSelector } from '../plugin';
import { FontOptions } from '../plugin/tiptap-font-config/constants';

type Props = React.HTMLAttributes<HTMLElement> & {
  keyId: string;
  content?: string;
  ref?: React.RefObject<HTMLDivElement>;
};

export const TiptapViewer = ({ className, keyId, content: propsContent, ref, ...props }: Props) => {
  const { content } = useContentStoreSelector(keyId);
  const finalContent = propsContent ?? content;
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
      TableHeader,
      TableCell,
    ],
    content: finalContent,
    editable: false,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      // 에디터 생성 시 기본 폰트 크기와 폰트 설정 (내용이 없을 때만)
      if (!finalContent) {
        editor.chain().selectAll().setFontSize('18px').setFontFamily(FontOptions['맑은 고딕']).run();
      }
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== finalContent) {
      editor.commands.setContent(finalContent);
    }
  }, [finalContent, editor]);

  if (!editor) return null;

  return (
    <EditorContent
      editor={editor}
      ref={ref}
      className={cn('p-6 min-h-[400px]', '[&_.resize-cursor]:cursor-col-resize', styles.tiptapGlobalStyles, className)}
      {...props}
    />
  );
};

export default TiptapViewer;
