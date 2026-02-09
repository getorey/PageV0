# @pagev0/ai-work-agent

OpenCode 플러그인 for AI 업무 자동화 에이전트

## 개요

이 플러그인은 OpenCode 에디터/IDE에서 AI 기반 업무 자동화 기능을 제공합니다. 회의록 작성, 메일 초안 생성, 일정 관리, 문서 작성 등의 업무를 자동화하고 보안/승인/감사 정책을 적용합니다.

## 기능

- **업무 자동화**: 회의록, 메일, 일정, 문서 자동 생성
- **리스크 분석**: 개인정보 및 보안 키워드 자동 탐지
- **승인 게이트**: 위험 업무 실행 전 승인 요청
- **감사 로깅**: 모든 작업 이력 추적 및 기록
- **정책 주입**: 조직별 규칙 및 템플릿 자동 적용

## 설치

### npm으로 설치

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pagev0/ai-work-agent"]
}
```

### 로컬 개발

```bash
git clone https://github.com/getorey/PageV0.git
cd PageV0/plugin
npm install
npm run build
```

`opencode.json`에 로컬 경로 추가:
```json
{
  "plugin": ["file:///path/to/PageV0/plugin/dist/index.js"]
}
```

## 설정

`opencode.json`에서 플러그인 설정:

```json
{
  "aiWorkAgent": {
    "enabled": true,
    "autoApproveLowRisk": false,
    "requireApprovalFor": [
      "external_email",
      "file_share",
      "schedule_create"
    ],
    "auditLogEnabled": true,
    "maxRetries": 3
  }
}
```

## 사용 예시

### 회의록 작성

```
User: 주간 팀 회의록 작성해줘
AI: 회의록 템플릿을 적용하여 자동 생성 중...
   - 결정사항 추출
   - 액션 아이템 생성
   - 후속 메일 초안 작성
   [승인 필요] 외부 발신이 감지되었습니다
```

### 메일 초안 작성

```
User: 거래처에 견적 요청 메일 본문 작성해줘
AI: 견적 요청 메일 초안 생성 중...
   - 조직 말투/서식 적용
   - 개인정보 포함 여부 검사
   [승인 필요] 대외 발신입니다
```

### 일정 등록

```
User: 다음 주 월요일에 프로젝트 킥오프 미팅 일정 잡아줘
AI: 일정 초안 생성 중...
   - 참석자 추천
   - 회의실 예약
   [승인 필요] 캘린더 등록 권한 필요
```

## Hooks

### chat.message

메시지 수신 시 업무 자동화 컨텍스트를 주입합니다.

### tool.execute.before/after

도구 실행 전후로 승인 체크 및 감사 로깅을 수행합니다.

### permission.ask

권한 요청 시 리스크 레벨과 대안을 제시합니다.

### file.save

파일 저장 시 민감 정보 포함 여부를 검사합니다.

## 개발

```bash
# 개발 모드
npm run dev

# 빌드
npm run build

# npm 게시
npm publish --access public
```

## 라이선스

MIT
