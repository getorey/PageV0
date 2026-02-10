// Type definitions for OpenCode Plugin
// These are compatible with @opencode-ai/plugin

export interface Client {
  session: Session;
}

export interface Session {
  prompt(options: PromptOptions): Promise<string>;
  confirm(options: ConfirmOptions): Promise<boolean>;
  select<T>(options: SelectOptions<T>): Promise<T>;
}

export interface PromptOptions {
  message: string;
  default?: string;
  placeholder?: string;
}

export interface ConfirmOptions {
  message: string;
  detail?: string;
}

export interface SelectOptions<T> {
  message: string;
  options: Array<{
    label: string;
    value: T;
    description?: string;
  }>;
}

export interface Project {
  root: string;
  config: Record<string, any>;
}

export interface PluginContext {
  client: Client;
  project: Project;
  $: any;
  directory: string;
}

export interface ChatMessageInput {
  message: string;
  history: Array<{ role: string; content: string }>;
}

export interface ChatMessageOutput {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ToolExecuteInput {
  tool: string;
  params: any;
}

export interface ToolExecuteOutput {
  blocked?: boolean;
  reason?: string;
  params?: any;
  warnings?: string[];
}

export interface ToolExecuteAfterInput {
  tool: string;
  params: any;
  result: any;
}

export interface PermissionAskInput {
  permission: string;
  resource: string;
}

export interface PermissionAskOutput {
  context?: {
    riskLevel?: string;
    justification?: string;
    alternatives?: string[];
  };
}

export interface FileSaveInput {
  path: string;
  content: string;
}

export interface FileSaveOutput {
  cancelled?: boolean;
}

export interface PluginHooks {
  event?: (payload: any) => Promise<void> | void;
  "message.created"?: (input: ChatMessageInput, output: ChatMessageOutput) => Promise<void> | void;
  "message.updated"?: (input: any, output: any) => Promise<void> | void;
  "message.part.updated"?: (input: any, output: any) => Promise<void> | void;
  "experimental.chat.messages.transform"?: (
    input: Record<string, never>,
    output: { messages: Array<{ info?: any; parts: any[]; role?: string }> }
  ) => Promise<void> | void;
  "tool.execute.before"?: (input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void> | void;
  "tool.execute.after"?: (input: ToolExecuteAfterInput, output: ToolExecuteOutput) => Promise<void> | void;
  "permission.asked"?: (input: PermissionAskInput, output: PermissionAskOutput) => Promise<void> | void;
  "file.written"?: (input: FileSaveInput, output: FileSaveOutput) => Promise<void> | void;
  "session.created"?: () => Promise<void> | void;
  "session.deleted"?: () => Promise<void> | void;
  config?: (config: any) => Promise<void> | void;
}

export type Plugin = (context: PluginContext) => Promise<PluginHooks> | PluginHooks;
