import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Table as TableIcon } from 'lucide-react';
import { IconButtonWrapper } from './common/icon-button-wrapper';
import { IconButton } from './common/icon-button';
import { Editor } from '@tiptap/react';

const MAX_ROWS = 8;
const MAX_COLS = 12;

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

export const Table = ({ className, editor }: Readonly<Props>) => {
  const [showGrid, setShowGrid] = useState(false);
  const [hovered, setHovered] = useState<[number, number]>([0, 0]);
  const [gridPosition, setGridPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  if (!editor) return null;

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowGrid(false);
  };

  const handleToggleGrid = () => {
    if (!showGrid && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setGridPosition({ x: rect.left, y: rect.bottom });
    }
    setShowGrid((v) => !v);
  };

  useEffect(() => {
    if (!showGrid) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (buttonRef.current?.contains(target)) return;
      if (target.closest('[data-table-grid]')) return;
      setShowGrid(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGrid]);

  const gridContent = showGrid && gridPosition && typeof document !== 'undefined'
    ? createPortal(
        <div
          data-table-grid
          className="fixed z-[9999] p-2 bg-white border rounded shadow-lg"
          style={{ left: gridPosition.x, top: gridPosition.y + 4 }}
        >
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: MAX_ROWS }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex gap-0.5">
                {Array.from({ length: MAX_COLS }).map((_, colIdx) => {
                  const selected = rowIdx <= hovered[0] && colIdx <= hovered[1];
                  return (
                    <div
                      key={colIdx}
                      className={cn(
                        'w-5 h-5 border border-gray-300 cursor-pointer transition-colors',
                        selected ? 'bg-blue-500 border-blue-600' : 'bg-white hover:bg-blue-100'
                      )}
                      onMouseEnter={() => setHovered([rowIdx, colIdx])}
                      onClick={() => insertTable(rowIdx + 1, colIdx + 1)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="text-xs text-center mt-2 text-gray-700">
            {hovered[0] + 1}행 x {hovered[1] + 1}열
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={cn('flex gap-1 items-center', className)}>
      <div ref={buttonRef}>
        <IconButtonWrapper onClick={handleToggleGrid}>
          <IconButton>
            <TableIcon className="w-4 h-4" />
          </IconButton>
        </IconButtonWrapper>
      </div>
      {gridContent}
    </div>
  );
};
