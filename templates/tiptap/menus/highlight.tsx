import { Popover, PopoverContent, PopoverTrigger } from '@/components/custom-ui/popover/popover';
import { Colors } from '../plugin/tiptap-font-config/constants';
import { cn } from '@/lib/utils';
import { Highlighter } from 'lucide-react';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { useState } from 'react';
import { Editor } from '@tiptap/react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

export const Highlight = ({ className, editor }: Readonly<Props>) => {
  const [selectedColor, setSelectedColor] = useState<string>('');

  if (!editor) return null;

  const setHighlight = (color: string) => {
    if (selectedColor === color) {
      editor.commands.unsetHighlight();
      setSelectedColor('');
    } else {
      editor.commands.setHighlight({ color });
      setSelectedColor(color);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButtonWrapper className={cn(className)}>
          <IconButton>
            {/* <Highlighter
							style={{color: selectedColor || undefined}}
							className=""
						/> */}
            <div
              className="px-1 font-bold text-white"
              style={{ color: selectedColor, backgroundColor: selectedColor || 'black' }}
            >
              A
            </div>
          </IconButton>
        </IconButtonWrapper>
      </PopoverTrigger>
      <PopoverContent className="flex h-[160px] w-[200px] flex-col flex-wrap justify-around rounded-md bg-slate-100">
        {Object.values(Colors).map((color) => (
          <div
            key={color}
            onClick={() => setHighlight(color)}
            className={cn(
              'h-[16px] w-[16px] cursor-pointer rounded-sm',
              selectedColor === color && 'ring-2 ring-yellow-400',
            )}
            style={{ backgroundColor: color }}
          ></div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
