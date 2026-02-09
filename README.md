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

## 라이선스

ISC
