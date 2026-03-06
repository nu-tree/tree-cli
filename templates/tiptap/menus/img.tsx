import { cn } from '@/lib/utils';
import { ImagePlus, Loader2 } from 'lucide-react';
import { IconButton } from './common/icon-button';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
};

export const Img = ({ editor, onImageUpload, className }: Readonly<Props>) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onImageUpload) {
      setIsUploading(true);
      try {
        const imageUrl = await onImageUpload(file);
        insertImageWithResize(imageUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        insertImageWithResize(base64Image);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const insertImageWithResize = (imageUrl: string) => {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    const currentNode = $from.parent;
    const isEmptyNode = currentNode.content.size === 0;

    if (!isEmptyNode) {
      const endPos = $from.end();
      editor.chain().focus().setTextSelection(endPos).enter().run();
    }

    editor.chain().focus().setImage({ src: imageUrl }).enter().run();
  };

  return (
    <IconButtonWrapper className={cn(className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1.5 group cursor-pointer disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <IconButton className="group-hover:text-gray-900">
            <ImagePlus />
          </IconButton>
        )}
        <span className="hidden lg:inline text-sm text-gray-500 group-hover:text-gray-900 transition-colors">
          Add
        </span>
      </button>
    </IconButtonWrapper>
  );
};
