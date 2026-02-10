# Oh My OpenCode Architecture Analysis

## 1. Overview
`oh-my-opencode` is a comprehensive plugin for OpenCode that acts as an "AI Agent Harness". It extends OpenCode's capabilities through a modular hook system, background agent orchestration, and deep integration with developer tools like TMUX and Git.

## 2. Core Architecture

The plugin follows a **Feature-based Hook Architecture**. Instead of a monolithic logic flow, features are encapsulated in separate modules and injected as hooks into the OpenCode lifecycle.

### Entry Point (`src/index.ts`)
- **Initialization**: Loads configuration (`loadPluginConfig`) and initializes global managers (`BackgroundManager`, `TmuxSessionManager`).
- **Feature Composition**: Instantiates feature hooks conditionally based on configuration (`isHookEnabled`).
- **Hook Export**: Returns an object implementing the OpenCode Plugin interface (`chat.message`, `tool.execute`, `event`, etc.).

## 3. Key Components & Features

### 3.1. Hook System
The plugin leverages nearly every available OpenCode hook:

| Hook Name | Purpose | Key Features Implemented |
|-----------|---------|--------------------------|
| `chat.message` | Message interception & context injection | Ralph Loop, Keyword Detection, System Prompt Override |
| `tool.execute.before` | Pre-execution validation & routing | Slash Commands (`/ulw-loop`), Policy Enforcement, Comment Checker |
| `tool.execute.after` | Post-execution analysis & recovery | Tool Output Truncation, Edit Error Recovery, Task Resume Info |
| `event` | Global event listener | Session Lifecycle (`created`, `deleted`), Notifications, Auto-update |

### 3.2. Background Agent Orchestration
- **`BackgroundManager`**: Manages parallel execution of sub-agents (Librarian, Oracle, Explore).
- **`task` Tool**: A custom tool exposed to the main agent to delegate work to sub-agents.
- **Async Execution**: Allows the main agent (Sisyphus) to continue working while sub-agents perform long-running tasks.

### 3.3. Session & State Management
- **`TmuxSessionManager`**: Wraps agent sessions in TMUX panes for persistence and interactivity.
- **`Ralph Loop`**: Implements a self-healing, infinite execution loop ("Ultrawork") until a task is completed.
- **`TodoContinuationEnforcer`**: Forces the agent to resume work if it stops prematurely with pending TODOs.

### 3.4. Context Engineering
- **`ContextInjector`**: Dynamically injects relevant files (`AGENTS.md`, `README.md`) and rules into the context window.
- **`PolicyInjector`**: Enforces project-specific rules and guidelines.

## 4. Directory Structure Pattern

The project is organized by feature domains rather than technical layers:

```
src/
├── index.ts                  # Main entry point & composition root
├── hooks/                    # Hook factory functions
│   ├── createRalphLoopHook.ts
│   ├── createCommentCheckerHooks.ts
│   └── ...
├── features/                 # Core business logic
│   ├── background-agent/     # BackgroundManager implementation
│   ├── context-injector/     # Context injection logic
│   ├── tmux-subagent/        # TMUX integration
│   └── ...
├── tools/                    # Custom tools definition
│   ├── index.ts              # Tool registry
│   └── ...
└── shared/                   # Shared utilities & constants
```

## 5. Lessons for Plugin Development

1.  **Modular Composition**: Do not put logic in `index.ts`. Create factory functions for each feature and compose them.
2.  **Config-Driven**: Make every feature togglable via configuration.
3.  **Event-Driven**: Use the `event` hook to manage state across the plugin lifecycle, independent of direct user interaction.
4.  **Resilience**: Implement recovery hooks (`edit-error-recovery`) to handle LLM mistakes automatically.

---
*Analysis based on source code review of `oh-my-opencode` v3.1.10*
