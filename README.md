# tree-cli

shadcn/ui에서 영감을 받은 재사용 가능한 컴포넌트 및 모듈 관리 CLI 도구입니다.

## 개요

기존 프로젝트에서 사용하던 Tiptap 같은 커스텀 모듈, 컴포넌트, 훅(hook) 등을 다른 프로젝트로 옮길 때마다 직접 복사·붙여넣기와 의존성 설치를 반복하는 문제를 해결하기 위한 도구입니다.

`tree-cli`는 내가 만든 재사용 가능한 모듈, 컴포넌트, 훅 등을 템플릿으로 관리하고, 다른 프로젝트에서 한 번의 명령어로 가져와 쓸 수 있게 해줍니다.

## 설치

별도 글로벌 설치 없이 `npx`로 바로 실행할 수 있습니다.

```bash
npx @knu9910/tree-cli --help
```

자주 사용할 경우 글로벌 설치 후 사용해도 됩니다.

```bash
npm install -g @knu9910/tree-cli
```

## 사용법

### 기본 명령

특정 컴포넌트를 현재 프로젝트에 추가합니다.

```bash
npx @knu9910/tree-cli --add <component-name>
```

또는 글로벌 설치 후에는 다음과 같이 사용할 수 있습니다.

```bash
knu-tree-cli --add <component-name>
```

### 예시: Tiptap 에디터 컴포넌트 설치

```bash
npx @knu9910/tree-cli --add tiptap
```

또는

```bash
knu-tree-cli --add tiptap
```

위 명령을 실행하면:

- 템플릿에 정의된 Tiptap 관련 컴포넌트와 파일이 현재 프로젝트에 복사되고
- `dependencies.json`에 정의된 npm 패키지들이 자동으로 설치되며
- 필요한 기본 구조(`src/components/ui`, `src/lib/utils.ts` 등)가 없다면 자동으로 생성됩니다.
