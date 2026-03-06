#!/usr/bin/env node
/**
 * tree-cli의 메인 엔트리 포인트
 *
 * 이 파일은 CLI 도구의 진입점으로, 사용자가 터미널에서 명령어를 실행할 때
 * 가장 먼저 실행되는 파일입니다.
 *
 * 주요 기능:
 * 1. 명령줄 인수 파싱 (meow 라이브러리 사용)
 * 2. --add 플래그가 있으면 직접 컴포넌트 추가 실행
 * 3. 플래그가 없으면 Ink를 사용한 터미널 UI 표시
 */

import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import {addComponent} from './utils/add-components.js';
import App from './app.js';

// meow를 사용해 CLI 인터페이스 정의
// 사용법, 옵션, 예제 등을 설정
const cli = meow(
	`
	Usage
	  $ npx @knui9910/tree-cli --add <component>

	Available Components
	  tiptap  Rich text editor built on ProseMirror
	          - Headless & fully customizable
	          - Supports Markdown shortcuts, tables, images, and more
	          - React-compatible with extensive extension ecosystem

	Options
	  --add  컴포넌트 이름을 지정해 설치합니다

	Examples
	  $ npx @knui9910/tree-cli --add tiptap
`,
	{
		// ES 모듈에서 import.meta를 통해 package.json 정보 전달
		importMeta: import.meta,
		flags: {
			add: {
				type: 'string', // --add 플래그는 문자열 값을 받음
			},
		},
	},
);

// 명령줄 인수에 따른 분기 처리
if (cli.flags.add) {
	// --add 플래그가 있으면 터미널 UI 없이 바로 컴포넌트 추가 실행
	// 예: npx tree-cli --add tiptap
	addComponent(cli.flags.add);
} else {
	// 플래그가 없으면 Ink를 사용한 인터랙티브 터미널 UI 표시
	// React 컴포넌트를 터미널에서 렌더링
	render(<App />);
}
