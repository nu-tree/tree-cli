import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/react';
import { CellSelection } from '@tiptap/pm/tables';
import { Colors } from '../plugin/tiptap-font-config/constants';
import { ChevronRight, Pipette } from 'lucide-react';

type Props = React.HTMLAttributes<HTMLElement> & {
  editor: Editor;
};

// Colors enum을 7열 그리드로 표시하기 위한 배열
const COLOR_COLUMNS = 7;
const colorValues = Object.values(Colors);

export const TableContextMenu = ({ className, editor }: Readonly<Props>) => {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [lastCellSelection, setLastCellSelection] = useState<CellSelection | null>(null);
  const [savedClickPos, setSavedClickPos] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const handleContextMenu = (event: MouseEvent) => {
      if (!dom.contains(event.target as Node)) return;
      const target = event.target as HTMLElement;
      if (target.closest('td, th')) {
        event.preventDefault();
        const sel = editor?.state?.selection;
        if (sel && sel instanceof CellSelection) {
          setLastCellSelection(sel);
        } else {
          setLastCellSelection(null);
        }
        // 우클릭 시점의 문서 위치 저장
        const coords = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (coords) setSavedClickPos(coords.pos);
        setShowColorPicker(false);
        setMenu({ x: event.clientX, y: event.clientY });
      } else {
        setMenu(null);
        setShowColorPicker(false);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (!menu) return;
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (colorPickerRef.current?.contains(target)) return;
      setMenu(null);
      setShowColorPicker(false);
    };
    dom.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    return () => {
      dom.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, [menu, editor]);

  useEffect(() => {
    if (!menu) return;
    const preventWheel = (e: WheelEvent) => e.preventDefault();
    document.addEventListener('wheel', preventWheel, { passive: false });
    return () => document.removeEventListener('wheel', preventWheel);
  }, [menu]);

  const handleMenuAction = (command: () => void) => {
    if (lastCellSelection && editor) {
      try {
        editor.view.dispatch(editor.state.tr.setSelection(lastCellSelection));
        command();
      } catch {
        editor.chain().focus().run();
        command();
      }
    } else {
      editor.chain().focus().run();
      command();
    }
    setMenu(null);
    setShowColorPicker(false);
  };

  const setCellBackground = (color: string | null) => {
    const tr = editor.state.tr;
    let changed = false;

    // 다중 셀 선택된 경우
    if (lastCellSelection) {
      try {
        lastCellSelection.forEachCell((node, pos) => {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, backgroundColor: color });
          changed = true;
        });
      } catch {
        // 선택이 무효화된 경우 무시
      }
    }

    // 단일 셀: 우클릭 시점에 저장한 위치로 찾기
    if (!changed && savedClickPos !== null) {
      try {
        const $pos = editor.state.doc.resolve(savedClickPos);
        for (let d = $pos.depth; d > 0; d--) {
          const node = $pos.node(d);
          if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            tr.setNodeMarkup($pos.before(d), undefined, { ...node.attrs, backgroundColor: color });
            changed = true;
            break;
          }
        }
      } catch {
        // 위치가 무효화된 경우 무시
      }
    }

    if (changed) editor.view.dispatch(tr);
    setMenu(null);
    setShowColorPicker(false);
  };

  const buttonGroups = [
    [
      { label: '행 위에 추가', action: () => handleMenuAction(() => editor.chain().focus().addRowBefore().run()) },
      { label: '행 아래에 추가', action: () => handleMenuAction(() => editor.chain().focus().addRowAfter().run()) },
      { label: '행 삭제', action: () => handleMenuAction(() => editor.chain().focus().deleteRow().run()) },
    ],
    [
      { label: '열 왼쪽에 추가', action: () => handleMenuAction(() => editor.chain().focus().addColumnBefore().run()) },
      { label: '열 오른쪽에 추가', action: () => handleMenuAction(() => editor.chain().focus().addColumnAfter().run()) },
      { label: '열 삭제', action: () => handleMenuAction(() => editor.chain().focus().deleteColumn().run()) },
    ],
    [
      { label: '셀 병합', action: () => handleMenuAction(() => editor.chain().focus().mergeCells().run()) },
      { label: '셀 분할', action: () => handleMenuAction(() => editor.chain().focus().splitCell().run()) },
    ],
    [
      { label: '셀 헤더/일반 변경', action: () => handleMenuAction(() => editor.chain().focus().toggleHeaderCell().run()) },
      { label: '행 헤더/일반 변경', action: () => handleMenuAction(() => editor.chain().focus().toggleHeaderRow().run()) },
      { label: '열 헤더/일반 변경', action: () => handleMenuAction(() => editor.chain().focus().toggleHeaderColumn().run()) },
    ],
    [
      { label: '테이블 삭제', action: () => handleMenuAction(() => editor.chain().focus().deleteTable().run()), danger: true },
    ],
  ];

  if (!menu) return null;

  // 색상 피커 팝오버 위치: 컨텍스트 메뉴 오른쪽
  const MENU_WIDTH = 172;
  const colorPickerX = menu.x + MENU_WIDTH + 4;
  const colorPickerY = menu.y;

  return (
    <>
      {/* 컨텍스트 메뉴 */}
      <div
        ref={menuRef}
        style={{ position: 'fixed', top: menu.y, left: menu.x, zIndex: 9999 }}
        className={cn(
          'bg-white border border-gray-200 rounded-lg shadow-xl py-1 flex flex-col min-w-[172px]',
          className,
        )}
      >
        {/* 셀 배경색 버튼 */}
        <button
          onClick={() => setShowColorPicker((v) => !v)}
          className={cn(
            'flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-left w-full transition-colors',
            showColorPicker ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700',
          )}
        >
          <span className="flex items-center gap-2">
            <Pipette className="h-3 w-3 shrink-0" />
            셀 배경색 변경
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
        </button>

        <div className="my-1 border-t border-gray-100" />

        {/* 나머지 메뉴 */}
        {buttonGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.map(({ label, action, danger }: any) => (
              <button
                key={label}
                onClick={action}
                className={cn(
                  'px-3 py-1.5 text-sm text-left w-full transition-colors',
                  danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                {label}
              </button>
            ))}
            {groupIdx < buttonGroups.length - 1 && <div className="my-1 border-t border-gray-100" />}
          </div>
        ))}
      </div>

      {/* 색상 팔레트 팝오버 */}
      {showColorPicker &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={colorPickerRef}
            style={{ position: 'fixed', top: colorPickerY, left: colorPickerX, zIndex: 10000 }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl p-3"
          >
            <p className="mb-2 text-[11px] font-medium text-gray-500">셀 배경색</p>

            {/* 색상 그리드: 7열 */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${COLOR_COLUMNS}, 1fr)` }}
            >
              {colorValues.map((color, idx) => (
                <button
                  key={color + idx}
                  onClick={() => setCellBackground(color)}
                  title={color}
                  style={{ backgroundColor: color }}
                  className="h-5 w-5 cursor-pointer rounded border border-gray-200 transition-transform hover:scale-125 hover:shadow-sm focus:outline-none"
                />
              ))}
            </div>

            {/* 구분선 + 초기화 */}
            <div className="mt-2 border-t border-gray-100 pt-2">
              <button
                onClick={() => setCellBackground(null)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[11px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white text-[9px] text-gray-400">✕</span>
                배경색 없음
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
