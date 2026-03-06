import { Image } from '@tiptap/extension-image';
import ResizeImage from 'tiptap-extension-resize-image';

// imageResize를 inline 노드로 변환
// - inline: true, group: 'inline' → ProseMirror가 텍스트처럼 취급 → 같은 줄에 여러 이미지 배치 가능
// - options.inline은 false 유지 → 정렬 컨트롤러에서 좌/중/우 모두 표시
const CustomResizeImage = ResizeImage.extend({
  inline: true,
  group: 'inline',

  addAttributes() {
    return {
      ...(this as any).parent?.(),
      containerStyle: {
        default: 'display: inline-block; width: auto; height: auto; cursor: pointer; vertical-align: middle;',
        parseHTML: (element: HTMLElement) => {
          const s = element.getAttribute('containerstyle') || element.getAttribute('style');
          if (s) return s;
          const w = element.getAttribute('width');
          return w
            ? `display: inline-block; width: ${w}px; height: auto; cursor: pointer; vertical-align: middle;`
            : element.style.cssText;
        },
      },
      wrapperStyle: {
        default: 'display: inline-block; vertical-align: middle;',
      },
    };
  },
});

export const CustomImage = Image.extend({
  addExtensions() {
    return [CustomResizeImage];
  },

  addAttributes() {
    return {
      ...(this as any).parent?.(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      { style: 'display: inline-block; vertical-align: middle;' },
      [
        'img',
        {
          ...HTMLAttributes,
          src: node.attrs.src,
        },
      ],
    ];
  },
});
