# AI 업무 자동화 에이전트

AI 기반 업무 자동화 시스템으로 회의록 작성, 메일 초안 생성, 일정 관리, 문서 작성 등의 업무를 자동화합니다.

## 주요 기능

- **Orchestrator (Planner-Sisyphus)**: 업무 분해 및 위임
- **Doc-Agent**: 회의록, 보고서 등 문서 자동 생성
- **Comms-Agent**: 메일/공지 초안 작성
- **PMO-Agent**: 일정 및 액션 아이템 관리
- **Compliance-Agent**: 보안 및 개인정보 검사
- **승인 시스템**: 위험 업무에 대한 승인 게이트
- **감사 로깅**: 모든 작업 이력 추적

## 아키텍처

```
User → Intake Layer → Policy Injection → Orchestrator → Sub-Agents → Approval/Audit → Output
```

## 설치 및 실행

```bash
npm install
cp .env.example .env
# .env 파일에 OPENAI_API_KEY 설정
npm run build
npm start
```

## API 사용 예시

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "회의록 작성",
    "description": "주간 회의록 자동 생성",
    "input": "회의에서 다음 결정사항이 있었습니다...",
    "requester": "user@example.com"
  }'
```

## 문서

- `docs/ai_업무_자동화_에이전트_prd.md` - 제품 요구사항
- `docs/아키텍처_설계서.md` - 시스템 아키텍처
- `docs/보안_승인_감사_정책_설계서.md` - 보안 및 승인 정책
- `docs/시퀀스_워크플로우_설계서.md` - 업무 흐름 설계

## OpenCode 플러그인으로 배포

이 프로젝트는 OpenCode 플러그인으로도 배포할 수 있습니다.

### 플러그인 설치 방법

#### 방법 1: npm 패키지로 설치

```bash
# opencode.json에 플러그인 추가
echo '{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pagev0/ai-work-agent"]
}' > opencode.json
```

#### 방법 2: 로컬 파일로 설치

```bash
# 플러그인 빌드
cd plugin
npm install
npm run build

# OpenCode 설정에 로컬 플러그인 경로 추가
# ~/.config/opencode/opencode.json 또는 프로젝트의 opencode.json:
{
  "plugin": ["file:///path/to/PageV0/plugin/dist/index.js"]
}
```

#### 방법 3: GitHub에서 직접 설치

```bash
# opencode.json:
{
  "plugin": ["github:getorey/PageV0/plugin"]
}
```

### 플러그인 개발

```bash
cd plugin

# 의존성 설치
npm install

# 개발 모드 (파일 변경 시 자동 재빌드)
npm run dev

# 프로덕션 빌드
npm run build

# npm에 게시 (관리자만)
npm publish --access public
```

### 플러그인 구조

```
plugin/
├── package.json          # 플러그인 메타데이터
├── tsconfig.json         # TypeScript 설정
├── src/
│   ├── index.ts          # 플러그인 진입점
│   ├── task-manager.ts   # 업무 관리
│   ├── workflow/
│   │   └── engine.ts     # 워크플로우 엔진
│   ├── approval/
│   │   └── system.ts     # 승인 시스템
│   ├── audit/
│   │   └── logger.ts     # 감사 로깅
│   ├── intake/
│   │   └── risk-analyzer.ts  # 리스크 분석
│   └── policy/
│       └── injector.ts   # 정책 주입
└── dist/                 # 빌드 출력
```

### 플러그인 Hooks

- `chat.message`: 메시지 수신 시 업무 자동화 컨텍스트 주입
- `tool.execute.before`: 위험 도구 실행 전 승인 요청
- `tool.execute.after`: 도구 실행 결과 감사 로깅
- `permission.ask`: 권한 요청 시 리스크 컨텍스트 추가
- `file.save`: 파일 저장 시 콘텐츠 검사
- `config`: 플러그인 설정 추가
- `session.start/end`: 세션 시작/종료 로깅

## 라이선스

ISC
