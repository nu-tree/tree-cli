import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/custom-ui/select/select';
import { LineHeights } from '../plugin/tiptap-font-config/constants';
import { cn } from '@/lib/utils';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { AlignJustify } from 'lucide-react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

export const TipTapLineHeight = ({ className, editor }: Readonly<Props>) => {
  const [currentLineHeight, setCurrentLineHeight] = useState<string>('1.5');

  const getCurrentLineHeight = useCallback(() => {
    if (!editor) return '1.5';
    const lineHeight = editor.getAttributes('textStyle').lineHeight;
    if (lineHeight && Object.values(LineHeights).includes(lineHeight as LineHeights)) {
      return lineHeight;
    }
    return '1.5';
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateLineHeight = () => {
      setCurrentLineHeight(getCurrentLineHeight());
    };

    editor.on('selectionUpdate', updateLineHeight);
    editor.on('transaction', updateLineHeight);
    updateLineHeight();

    return () => {
      editor.off('selectionUpdate', updateLineHeight);
      editor.off('transaction', updateLineHeight);
    };
  }, [editor, getCurrentLineHeight]);

  const changeLineHeight = (lineHeight: LineHeights) => {
    editor.chain().focus().setMark('textStyle', { lineHeight }).run();
  };

  return (
    <Select value={currentLineHeight} onValueChange={changeLineHeight}>
      <SelectTrigger
        className={cn(
          'group w-fit border-none shadow-none focus:ring-0 focus:outline-none',
          'flex cursor-pointer items-center rounded-md border border-gray-200 bg-white transition-colors hover:bg-gray-100',
          'gap-0.5 px-1 lg:gap-1.5 lg:px-2',
          className,
        )}
      >
        <IconButtonWrapper className="p-1 lg:p-2">
          <IconButton>
            <AlignJustify className="size-3 lg:size-4" />
          </IconButton>
        </IconButtonWrapper>
        <div className="hidden lg:block">
          <SelectValue placeholder={currentLineHeight} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.values(LineHeights).map((lh) => (
          <SelectItem key={lh} value={lh}>
            {lh}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
