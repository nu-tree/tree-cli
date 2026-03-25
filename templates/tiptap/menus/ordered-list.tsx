import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsActive } from '../plugin/use-active';
import { Editor } from '@tiptap/react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

export const OrderedList = ({ className, editor }: Readonly<Props>) => {
  const isActive = useIsActive(editor, 'orderedList');

  if (!editor) return null;

  const toggle = () => editor.chain().focus().toggleOrderedList().run();

  return (
    <div className={cn('', className)}>
      <IconButtonWrapper onClick={toggle} data-state={isActive ? 'on' : 'off'}>
        <IconButton data-state={isActive ? 'on' : 'off'}>
          <ListOrdered />
        </IconButton>
      </IconButtonWrapper>
    </div>
  );
};
