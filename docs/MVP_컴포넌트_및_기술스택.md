AI 업무 자동화 에이전트 MVP 컴포넌트 분해 및 기술 스택 매핑

1.  문서 목적

본 문서는 AI 업무 자동화 에이전트의 MVP 구현을 위한 최소 컴포넌트 구성과
각 컴포넌트별 권장 기술 스택을 정의한다.

2.  MVP 범위 정의

-   업무 유형: 회의, 문서, 메일, 일정
-   승인/보안/감사 기본 탑재
-   단일 조직 기준 운영

3.  MVP 핵심 컴포넌트

```{=html}
<!-- -->
```
1)  Orchestrator
    -   역할: 계획 수립, 위임, 상태 관리
    -   기술: TypeScript, OpenAI/Claude API
2)  Doc-Agent
    -   역할: 회의록/보고서 생성
    -   기술: LLM + 템플릿 엔진
3)  Comms-Agent
    -   역할: 메일/공지 작성
    -   기술: LLM + 톤/서식 룰
4)  PMO-Agent
    -   역할: 일정/액션아이템
    -   기술: 상태 머신 + 캘린더 API
5)  Compliance-Agent
    -   역할: 승인/보안 검사
    -   기술: Rule Engine + Approval Flow

```{=html}
<!-- -->
```
4.  공통 인프라 스택

-   Backend: Node.js (NestJS 권장)
-   LLM 연동: OpenAI / Claude / Azure OpenAI
-   상태 관리: Redis or DB
-   문서 저장: S3 호환 스토리지
-   인증/권한: OAuth2 / SSO 연계

5.  단계별 확장 로드맵

Phase 1: MVP (회의/문서 자동화) Phase 2: 대외 커뮤니케이션/결재 Phase 3:
데이터/보고/조직 전사 확장
