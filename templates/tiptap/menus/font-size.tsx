import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/custom-ui/select/select';
import { Pxs } from '../plugin/tiptap-font-config/constants';
import { cn } from '@/lib/utils';
import { Type } from 'lucide-react';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
  defaultFontSize?: Pxs;
};

export const TipTapFontSize = ({ className, editor, defaultFontSize = Pxs.PX_18 }: Readonly<Props>) => {
  const [currentFontSize, setCurrentFontSize] = useState<string>(defaultFontSize);

  useEffect(() => {
    if (!editor || editor.isEmpty) {
      setCurrentFontSize(defaultFontSize);
    }
  }, [defaultFontSize, editor]);

  const getCurrentFontSize = useCallback(() => {
    if (!editor || editor.isEmpty) return defaultFontSize;

    const fontSize = editor.getAttributes('textStyle').fontSize;
    if (fontSize && Object.values(Pxs).includes(fontSize as Pxs)) return fontSize;

    return defaultFontSize;
  }, [editor, defaultFontSize]);

  useEffect(() => {
    if (!editor) return;

    const updateFontSize = () => {
      setCurrentFontSize(getCurrentFontSize());
    };

    // 에디터 업데이트 시 현재 폰트 크기 업데이트
    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);

    // 초기 폰트 크기 설정
    updateFontSize();

    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('transaction', updateFontSize);
    };
  }, [editor, getCurrentFontSize]);

  const changeFontSize = (size: Pxs) => {
    editor.chain().focus().setFontSize(size).run();
  };

  return (
    <div className={cn('', className)}>
      {/* 폰트 크기 설정 메뉴 */}
      <Select value={currentFontSize} onValueChange={changeFontSize}>
        <SelectTrigger
          className={cn(
            'group w-fit border-none shadow-none focus:outline-none focus:ring-0',
            'flex items-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition-colors cursor-pointer',
            // 모바일: 컴팩트한 크기, 아이콘만
            'px-1 gap-0.5 lg:px-2 lg:gap-1.5',
            className
          )}
        >
          <IconButtonWrapper className="p-1 lg:p-2">
            <IconButton>
              <Type className="w-3 h-3 lg:w-4 lg:h-4" />
            </IconButton>
          </IconButtonWrapper>
          {/* 데스크톱에서만 텍스트 표시 */}
          <div className="hidden lg:block">
            <SelectValue placeholder={currentFontSize} className="text-xs lg:text-sm text-gray-700" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-md shadow-lg bg-white border border-gray-300 mt-1 h-72 w-32 overflow-y-auto">
          {Object.values(Pxs).map((px) => (
            <SelectItem
              key={px}
              value={px}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100 rounded transition-colors"
            >
              {px}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
