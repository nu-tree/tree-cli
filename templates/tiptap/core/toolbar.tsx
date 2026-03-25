import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { TipTapFontStyle } from '../menus/font-style';
import { Separator } from '../menus/common/separator';
import { TipTapFontSize } from '../menus/font-size';
import { TipTapFontColor } from '../menus/font-color';
import { Highlight } from '../menus/highlight';
import { Bold } from '../menus/bold';
import { Italic } from '../menus/italic';
import { UnderLine } from '../menus/underline';
import { Strike } from '../menus/strike';
import { UrlLink } from '../menus/url-link';
import { TextAlignLeft } from '../menus/text-align-left';
import { TextAlignCenter } from '../menus/text-align-center';
import { TextAlignRight } from '../menus/text-align-right';
import { Img } from '../menus/img';
import { Table } from '../menus/table';
import { BulletList } from '../menus/bullet-list';
import { OrderedList } from '../menus/ordered-list';
import { Editor } from '@tiptap/core';
import {
	ChevronDown,
	ChevronUp,
	Bold as BoldIcon,
	AlignCenter,
	Palette,
	Maximize2,
	Minimize2,
} from 'lucide-react';
import { YoutubeLink } from '../menus/youtube-link';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = React.HTMLAttributes<HTMLElement> & {
	editor: Editor;
	onImageUpload?: (file: File) => Promise<string>;
	isFullscreen?: boolean;
	onToggleFullscreen?: () => void;
};

export const Toolbar = ({
	className,
	editor,
	onImageUpload,
	isFullscreen,
	onToggleFullscreen,
}: Readonly<Props>) => {
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
		text: false,
		align: false,
		color: false,
	});
	const [isCompactMode, setIsCompactMode] = useState(false);
	const isMobileLayout = useIsMobile(1024);

	const toolbarRef = useRef<HTMLDivElement>(null);

	// 최소 width 기준: 800px 이상이면 전체 툴바, 미만이면 그룹 버튼
	const MIN_FULL_TOOLBAR_WIDTH = 800;

	// Toolbar width 측정하여 레이아웃 모드 결정
	useEffect(() => {
		if (!toolbarRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setIsCompactMode(width < MIN_FULL_TOOLBAR_WIDTH);
			}
		});

		resizeObserver.observe(toolbarRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [MIN_FULL_TOOLBAR_WIDTH]);

	const toggleGroup = (groupName: string) => {
		setOpenGroups(prev => {
			// 다른 그룹이 열려있으면 모두 닫고 현재 그룹만 토글
			const newState: Record<string, boolean> = {};
			Object.keys(prev).forEach(key => {
				newState[key] = key === groupName ? !prev[groupName] : false;
			});
			return newState;
		});
	};

	// 외부 클릭 시 모든 그룹 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;

			// 툴바 내부 클릭인 경우 무시
			if (toolbarRef.current && toolbarRef.current.contains(target)) {
				return;
			}

			// Portal 메뉴 내부 클릭인지 확인
			const portalMenu = (target as HTMLElement).closest('[data-toolbar-menu]');
			if (portalMenu) {
				return;
			}

			// Radix UI Popover/Dialog Portal 내부 클릭인지 확인 (글자 색상 등)
			const radixPortal = (target as HTMLElement).closest('[data-radix-popper-content-wrapper]');
			if (radixPortal) {
				return;
			}

			// 외부 클릭이면 모든 그룹 닫기
			setOpenGroups(prev => {
				const newState: Record<string, boolean> = {};
				Object.keys(prev).forEach(key => {
					newState[key] = false;
				});
				return newState;
			});
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const GroupButton = ({
		groupName,
		icon: Icon,
	}: {
		groupName: string;
		icon: React.ElementType;
	}) => {
		const buttonRef = useRef<HTMLButtonElement>(null);
		const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
		const isGroupOpen = openGroups[groupName];
		// 컴팩트 모드이거나 모바일일 때 Portal 사용
		const usePortal = isCompactMode || isMobileLayout;

		useEffect(() => {
			if (!usePortal || !isGroupOpen) {
				setMenuPosition(null);
				return undefined;
			}

			const updatePosition = () => {
				if (!buttonRef.current) {
					return;
				}
				const rect = buttonRef.current.getBoundingClientRect();
				setMenuPosition({
					x: rect.left + rect.width / 2,
					y: rect.top,
				});
			};

			updatePosition();
			window.addEventListener('resize', updatePosition);
			window.addEventListener('scroll', updatePosition, true);

			return () => {
				window.removeEventListener('resize', updatePosition);
				window.removeEventListener('scroll', updatePosition, true);
			};
		}, [groupName, isGroupOpen, usePortal]);

		const menuContent = (
			<div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
				{groupName === 'text' && (
					<>
						<Bold editor={editor} />
						<Italic editor={editor} />
						<UnderLine editor={editor} />
						<Strike editor={editor} />
						<BulletList editor={editor} />
						<OrderedList editor={editor} />
					</>
				)}
				{groupName === 'align' && (
					<>
						<TextAlignLeft editor={editor} />
						<TextAlignCenter editor={editor} />
						<TextAlignRight editor={editor} />
					</>
				)}
				{groupName === 'color' && (
					<>
						<TipTapFontColor editor={editor} />
						<Highlight editor={editor} />
					</>
				)}
			</div>
		);

		const renderMenu = () => {
			if (!isGroupOpen) {
				return null;
			}

			// 컴팩트 모드이거나 모바일일 때는 Portal 사용
			if (usePortal) {
				if (!menuPosition || typeof document === 'undefined') {
					return null;
				}

				return createPortal(
					<div
						data-toolbar-menu
						className="fixed z-[60] flex -translate-x-1/2 -translate-y-2 transform items-center"
						style={{ left: menuPosition.x, top: menuPosition.y }}
					>
						{menuContent}
					</div>,
					document.body
				);
			}

			// 일반 모드에서는 absolute positioning
			return (
				<div className="absolute bottom-full left-1/2 z-50 flex -translate-x-1/2 -translate-y-2 transform items-center">
					{menuContent}
				</div>
			);
		};

		return (
			<div className="relative">
				<button
					ref={buttonRef}
					onClick={() => toggleGroup(groupName)}
					className="flex items-center rounded-md bg-white p-1 transition-colors hover:bg-gray-100"
				>
					<Icon className="h-4 w-4" />
					{isGroupOpen ? (
						<ChevronUp className="h-3 w-3" />
					) : (
						<ChevronDown className="h-3 w-3" />
					)}
				</button>
				{renderMenu()}
			</div>
		);
	};

	const FullscreenButton = () => (
		<button
			type="button"
			onClick={onToggleFullscreen}
			className="ml-auto flex shrink-0 items-center rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
			title={isFullscreen ? '원래 크기로' : '전체 보기'}
		>
			{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
		</button>
	);

	return (
		<div className={cn('border-b w-full overflow-hidden', className)} ref={toolbarRef}>
			{/* 전체 툴바 레이아웃 (width가 충분할 때) */}
			{!isCompactMode && (
				<div className="w-full overflow-x-auto overflow-y-hidden">
					<div className="flex items-center py-1 px-4 whitespace-nowrap [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
						<TipTapFontStyle editor={editor} />
						<Separator />
						<TipTapFontSize editor={editor} />
						<Separator />
						<TipTapFontColor editor={editor} />
						<Highlight editor={editor} />
						<Separator />
						<Bold editor={editor} />
						<Italic editor={editor} />
						<UnderLine editor={editor} />
						<Strike editor={editor} />
						<UrlLink editor={editor} />
						<Separator />
						<BulletList editor={editor} />
						<OrderedList editor={editor} />
						<Separator />
						<Table editor={editor} />
						<Separator />
						<TextAlignLeft editor={editor} />
						<TextAlignCenter editor={editor} />
						<TextAlignRight editor={editor} />
						<Separator />
						<Img editor={editor} onImageUpload={onImageUpload} />
						<Separator />
						<YoutubeLink editor={editor} />
						{onToggleFullscreen && <FullscreenButton />}
					</div>
				</div>
			)}

			{/* 컴팩트 레이아웃 (width가 부족할 때) */}
			{isCompactMode && (
				<div className="w-full overflow-x-auto overflow-y-hidden p-2">
					<div className="flex items-center gap-1 whitespace-nowrap [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
						{/* 폰트 스타일 그룹: 항상 표시 */}
						<TipTapFontStyle editor={editor} />
						<TipTapFontSize editor={editor} />
						{/* 서식 그룹 - Bold 아이콘 사용 */}
						<GroupButton groupName="text" icon={BoldIcon} />
						{/* 정렬 그룹 - TextAlignCenter 아이콘 사용 */}
						<GroupButton groupName="align" icon={AlignCenter} />
						{/* 색상 그룹 - Palette 아이콘 사용 */}
						<GroupButton groupName="color" icon={Palette} />
						{/* 나머지는 일단 직접 배치 */}
						<UrlLink editor={editor} />
						<Table editor={editor} />
						<Img editor={editor} onImageUpload={onImageUpload} />
						<YoutubeLink editor={editor} />
						{onToggleFullscreen && <FullscreenButton />}
					</div>
				</div>
			)}
		</div>
	);
};
