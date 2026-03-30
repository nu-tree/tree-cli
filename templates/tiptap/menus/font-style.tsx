import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/custom-ui/select/select';
import { FontOptions, FontFamilyKey } from '../plugin/tiptap-font-config/constants';
import { cn } from '@/lib/utils';
import { CaseSensitive } from 'lucide-react';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
  defaultFontFamily?: FontFamilyKey;
};

export const TipTapFontStyle = ({ className, editor, defaultFontFamily }: Readonly<Props>) => {
  const defaultFontKey: FontFamilyKey = defaultFontFamily ?? '맑은고딕';

  const [currentFont, setCurrentFont] = useState<string>(defaultFontKey);

  // defaultFontKey 바뀌거나 editor 비어있을 때 동기화
  useEffect(() => {
    if (!editor || editor.isEmpty) {
      setCurrentFont(defaultFontKey);
    }
  }, [defaultFontKey, editor]);

  const findFontKey = useCallback((fontFamily: string): string => {
    const key = (Object.keys(FontOptions) as FontFamilyKey[]).find((k) => {
      const val = FontOptions[k];
      if (val === fontFamily) return true;
      const first = val.split(',')[0].trim().replace(/['"]/g, '');
      const current = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      return first === current;
    });
    return key ?? defaultFontKey;
  }, [defaultFontKey]);

  const getCurrentFont = useCallback(() => {
    if (!editor || editor.isEmpty) return defaultFontKey;

    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    if (fontFamily) return findFontKey(fontFamily);

    return defaultFontKey;
  }, [editor, defaultFontKey, findFontKey]);

  useEffect(() => {
    if (!editor) return;

    const updateFont = () => {
      setCurrentFont(getCurrentFont());
    };

    // 에디터 업데이트 시 현재 폰트 업데이트
    editor.on('selectionUpdate', updateFont);
    editor.on('transaction', updateFont);

    // 초기 폰트 설정
    updateFont();

    return () => {
      editor.off('selectionUpdate', updateFont);
      editor.off('transaction', updateFont);
    };
  }, [editor, getCurrentFont]);

  const changeFont = (font: string) => {
    // 폰트 변경 적용
    editor.chain().focus().setFontFamily(FontOptions[font]).run();
  };

  return (
    <div className={cn('', className)}>
      {/* 폰트 설정 메뉴 */}
      <Select value={currentFont} onValueChange={changeFont}>
        <SelectTrigger
          className={cn(
            'group w-fit border-none shadow-none focus:outline-none focus:ring-0',
            'flex items-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition-colors cursor-pointer',
            'px-1 gap-0.5',
            className
          )}
        >
          <IconButtonWrapper className="p-1 lg:p-2">
            <IconButton>
              <CaseSensitive className="w-4 h-4" />
            </IconButton>
          </IconButtonWrapper>
          {/* 데스크톱에서만 텍스트 표시 */}
          <div className="hidden lg:block">
            <SelectValue placeholder={currentFont} className="text-xs lg:text-sm text-gray-700" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-md shadow-lg bg-white border border-gray-300 mt-1">
          {Object.keys(FontOptions).map((fontName) => (
            <SelectItem
              key={fontName}
              value={fontName}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100 rounded transition-colors"
            >
              {fontName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
