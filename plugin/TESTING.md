# OpenCode 플러그인 테스트 및 확인 가이드

## 빠른 확인 체크리스트

### 1. 플러그인이 로드되는지 확인

OpenCode를 시작할 때 콘솔에 다음 메시지가 출력되어야 합니다:
```
[AI Work Agent] Plugin initialized
```

### 2. 설정 파일 확인

프로젝트 루트에 `opencode.json`이 있는지 확인:

```bash
cat opencode.json
```

내용:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pagev0/ai-work-agent"]
}
```

### 3. 로컬 플러그인 로드 (개발 중)

로컬에서 플러그인을 테스트하려면:

```bash
cd plugin
npm install
npm run build
```

`opencode.json` 수정:
```json
{
  "plugin": ["file:///path/to/PageV0/plugin/dist/index.js"]
}
```

## 상세 테스트 방법

### 방법 A: 테스트 스크립트 실행

```bash
cd plugin
npm test
```

출력 예시:
```
🧪 OpenCode Plugin Test Suite

==================================================

📦 1. Plugin Initialization
[AI Work Agent] Plugin initialized
✅ Plugin initialized successfully
   Available hooks: chat.message, tool.execute.before, tool.execute.after, permission.ask, file.save, config, session.start, session.end

💬 2. Testing chat.message hook
✅ chat.message hook executed
   System prompt injected: YES
   Context: You are an AI Work Automation Agent...

🔧 3. Testing tool.execute.before hook
✅ tool.execute.before hook executed
   Tool: send_email
   Blocked: NO
...
```

### 방법 B: 실제 OpenCode CLI에서 테스트

#### 1. OpenCode 설치 확인

```bash
opencode --version
```

#### 2. 플러그인 설정

`~/.config/opencode/opencode.json` (글로벌) 또는 프로젝트 `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pagev0/ai-work-agent"],
  "aiWorkAgent": {
    "enabled": true,
    "autoApproveLowRisk": false,
    "requireApprovalFor": ["external_email", "file_share"],
    "auditLogEnabled": true
  }
}
```

#### 3. OpenCode 시작

```bash
# 프로젝트 디렉토리에서
opencode
```

시작 시 출력 확인:
```
[AI Work Agent] Plugin initialized
[AI Work Agent] Session started
```

#### 4. 기능 테스트

**테스트 1: chat.message hook**
```
User: 회의록 작성해줘
Expected: 플러그인이 업무 자동화 요청으로 인식하고 컨텍스트 주입
```

**테스트 2: tool.execute.before hook**
```
User: 파일을 생성해줘 (file tool 실행 시)
Expected: 감사 로그 기록 및 정책 적용
```

**테스트 3: permission.ask hook**
```
User: 외부로 메일 본문 작성 (send_email tool)
Expected: 승인 요청 대화상자 표시
```

**테스트 4: file.save hook**
```
User: 주민등록번호 123456-1234567 포함된 파일 저장
Expected: PII 감지 및 경고/승인 요청
```

### 방법 C: VS Code 확장 프로그램에서 테스트

1. VS Code에서 OpenCode 확장 설치
2. `.vscode/opencode.json` 생성:
```json
{
  "plugin": ["@pagev0/ai-work-agent"]
}
```
3. Command Palette (Cmd+Shift+P) → "OpenCode: Start Session"
4. 출력 패널에서 로그 확인

## 디버깅 팁

### 1. 로그 레벨 설정

`opencode.json`:
```json
{
  "logLevel": "debug"
}
```

### 2. 플러그인 로드 확인

OpenCode 시작 시 `--verbose` 플래그:
```bash
opencode --verbose
```

### 3. 플러그인 빌드 확인

```bash
cd plugin
ls -la dist/
# dist/index.js 파일이 존재해야 함
```

### 4. 타입스크립트 에러 확인

```bash
cd plugin
npx tsc --noEmit
```

## 일반적인 문제와 해결책

### 문제 1: "Plugin not found"

**원인**: 경로 문제 또는 빌드되지 않음

**해결**:
```bash
cd plugin
npm run build
# 경로 확인: file:///absolute/path/to/plugin/dist/index.js
```

### 문제 2: "Cannot find module"

**원인**: 의존성 누락

**해결**:
```bash
cd plugin
npm install
```

### 문제 3: Hook이 실행되지 않음

**원인**: 
1. 플러그인이 로드되지 않음
2. Hook 이름 오타
3. 조걶逻辑 미충족

**확인 방법**:
```typescript
// src/index.ts에 디버그 로그 추가
export const AIWorkAgentPlugin: Plugin = async (context) => {
  console.log("[DEBUG] Plugin loading...");  // 이 로그가 출력되는지 확인
  
  return {
    "chat.message": async (input, output) => {
      console.log("[DEBUG] chat.message hook triggered", input.message);
      // ...
    },
  };
};
```

### 문제 4: 타입 에러

**해결**:
```bash
# 타입 정의 파일 확인
ls -la plugin/src/types/opencode.d.ts

# 타입스크립트 재빌드
cd plugin
npm run build
```

## 확인 완료 체크리스트

- [ ] 플러그인이 OpenCode 시작 시 초기화됨 (콘솔 메시지 확인)
- [ ] `chat.message` hook이 업무 관련 메시지에 반응함
- [ ] `tool.execute.before` hook이 도구 실행 전에 호출됨
- [ ] `permission.ask` hook이 승인 요청을 가로챔
- [ ] `file.save` hook이 파일 저장을 감지함
- [ ] 설정값이 `config` hook을 통해 주입됨
- [ ] 감사 로그가 기록됨

## 다음 단계

테스트가 완료되면:
1. npm 패키지로 배포 (`npm publish`)
2. GitHub Actions로 CI/CD 설정
3. 문서 업데이트
