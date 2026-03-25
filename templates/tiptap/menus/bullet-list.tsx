import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsActive } from '../plugin/use-active';
import { Editor } from '@tiptap/react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

export const BulletList = ({ className, editor }: Readonly<Props>) => {
  const isActive = useIsActive(editor, 'bulletList');

  if (!editor) return null;

  const toggle = () => editor.chain().focus().toggleBulletList().run();

  return (
    <div className={cn('', className)}>
      <IconButtonWrapper onClick={toggle} data-state={isActive ? 'on' : 'off'}>
        <IconButton data-state={isActive ? 'on' : 'off'}>
          <List />
        </IconButton>
      </IconButtonWrapper>
    </div>
  );
};
