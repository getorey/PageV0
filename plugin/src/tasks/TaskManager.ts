import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogger } from '../audit/logger';
import { DebugLogger } from '../audit/debug-logger';

export interface WorkRequest {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  analysis?: {
    isWorkRelated: boolean;
    confidence: number;
    riskLevel: string;
    keywords: string[];
    entities: string[];
    potentialActions: string[];
  };
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  type: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    originalRequest: WorkRequest;
    context?: any;
    result?: any;
    error?: string;
  };
}

export interface TaskTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (task: Task, context: any) => Promise<any>;
}

export class TaskManager {
  private auditLogger: AuditLogger;
  private debugLogger: DebugLogger;
  private tasks: Map<string, Task> = new Map();
  private tools: Map<string, TaskTool> = new Map();
  private taskDir: string;

  constructor() {
    this.auditLogger = new AuditLogger();
    this.debugLogger = new DebugLogger();
    this.taskDir = path.join(process.env.HOME || '', '.opencode', 'ai-work-agent', 'tasks');
    this.initializeTaskDirectory();
    this.registerDefaultTools();
    this.debugLogger.log('Default tools registered', { toolCount: this.tools.size });
  }

  private async initializeTaskDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.taskDir, { recursive: true });
      this.debugLogger.log('Task directory initialized', { taskDir: this.taskDir });
    } catch (error) {
      this.debugLogger.log('Failed to initialize task directory', { error, taskDir: this.taskDir });
    }
  }

  private registerDefaultTools(): void {
    this.registerTool({
      name: 'create_meeting_minutes',
      description: 'Create structured meeting minutes from discussion',
      parameters: {
        type: 'object',
        properties: {
          meetingType: { type: 'string', description: 'Type of meeting (daily, weekly, retro, etc.)' },
          attendees: { type: 'array', items: { type: 'string' }, description: 'List of attendees' },
          duration: { type: 'string', description: 'Meeting duration' }
        },
        required: ['meetingType']
      },
      execute: async (task, context) => {
        return this.createMeetingMinutes(task, context);
      }
    });

    this.registerTool({
      name: 'draft_email',
      description: 'Draft professional email based on context',
      parameters: {
        type: 'object',
        properties: {
          recipients: { type: 'array', items: { type: 'string' }, description: 'Email recipients' },
          subject: { type: 'string', description: 'Email subject' },
          tone: { type: 'string', enum: ['formal', 'casual', 'urgent'], description: 'Email tone' }
        },
        required: ['recipients', 'subject']
      },
      execute: async (task, context) => {
        return this.draftEmail(task, context);
      }
    });

    this.registerTool({
      name: 'summarize_discussion',
      description: 'Create summary of discussion points and action items',
      parameters: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['bullets', 'paragraph', 'markdown'], description: 'Summary format' },
          includeActions: { type: 'boolean', description: 'Include action items' }
        },
        required: ['format']
      },
      execute: async (task, context) => {
        return this.summarizeDiscussion(task, context);
      }
    });

    this.debugLogger.log('Default tools registered', { toolCount: this.tools.size });
  }

  public registerTool(tool: TaskTool): void {
    this.tools.set(tool.name, tool);
    this.debugLogger.log('Tool registered', { toolName: tool.name });
  }

  public getAvailableTools(): TaskTool[] {
    return Array.from(this.tools.values());
  }

  public async createTask(workRequest: WorkRequest): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      type: this.inferTaskType(workRequest),
      description: workRequest.content,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        originalRequest: workRequest
      }
    };

    this.tasks.set(task.id, task);
    
    await this.saveTaskToFile(task);
    
    this.auditLogger.log('task_created', {
      userId: workRequest.userId,
      content: workRequest.content,
      taskId: task.id,
      taskType: task.type,
      analysis: workRequest.analysis
    });

    this.debugLogger.log('Task created', { taskId: task.id, taskType: task.type, description: task.description });

    return task;
  }

  public async executeTask(taskId: string, toolName?: string, toolParameters?: any): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status === 'completed') {
      return task;
    }

    task.status = 'running';
    task.updatedAt = new Date();

    try {
      let result: any;

      if (toolName && this.tools.has(toolName)) {
        const tool = this.tools.get(toolName)!;
        this.debugLogger.log('Executing tool', { taskId, toolName, toolParameters });
        result = await tool.execute(task, toolParameters);
      } else {
        result = await this.defaultTaskExecution(task);
      }

      task.status = 'completed';
      task.updatedAt = new Date();
      task.metadata.result = result;

      this.auditLogger.log('task_completed', {
        userId: task.metadata.originalRequest.userId,
        content: task.description,
        taskId,
        result,
        analysis: task.metadata.originalRequest.analysis
      });

      this.debugLogger.log('Task completed', { taskId, result });

    } catch (error) {
      task.status = 'failed';
      task.updatedAt = new Date();
      task.metadata.error = error instanceof Error ? error.message : String(error);

      this.auditLogger.log('task_failed', {
        userId: task.metadata.originalRequest.userId,
        content: task.description,
        taskId,
        error: task.metadata.error,
        analysis: task.metadata.originalRequest.analysis
      });

      this.debugLogger.log('Task failed', { taskId, error: task.metadata.error });
    }

    await this.saveTaskToFile(task);
    return task;
  }

  private async defaultTaskExecution(task: Task): Promise<any> {
    const workRequest = task.metadata.originalRequest;
    
    const analysis = workRequest.analysis!;
    const suggestions: string[] = [];

    if (analysis.isWorkRelated) {
      if (analysis.potentialActions.length > 0) {
        suggestions.push(`Suggested actions: ${analysis.potentialActions.join(', ')}`);
      }

      if (analysis.entities.length > 0) {
        suggestions.push(`Key entities identified: ${analysis.entities.join(', ')}`);
      }

      if (analysis.confidence > 0.8) {
        suggestions.push('High confidence work request - suitable for automation');
      }
    }

    return {
      type: 'analysis',
      suggestions,
      tools: this.getAvailableTools().map(t => t.name),
      message: 'Task analyzed. You can use available tools for specific actions.'
    };
  }

  private inferTaskType(workRequest: WorkRequest): string {
    const content = workRequest.content.toLowerCase();
    const analysis = workRequest.analysis;

    if (!analysis?.isWorkRelated) {
      return 'general';
    }

    if (content.includes('meeting') || content.includes('회의')) {
      return 'meeting_minutes';
    }

    if (content.includes('email') || content.includes('메일') || content.includes('이메일')) {
      return 'email_draft';
    }

    if (content.includes('summary') || content.includes('요약') || content.includes('정리')) {
      return 'summary';
    }

    if (content.includes('task') || content.includes('업무') || content.includes('할 일')) {
      return 'task_management';
    }

    return 'work_automation';
  }

  private async saveTaskToFile(task: Task): Promise<void> {
    try {
      const taskFile = path.join(this.taskDir, `${task.id}.json`);
      await fs.writeFile(taskFile, JSON.stringify(task, null, 2));
    } catch (error) {
      this.debugLogger.log('Failed to save task to file', { taskId: task.id, error });
    }
  }

  public async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  public async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  private async createMeetingMinutes(task: Task, context: any): Promise<any> {
    const { meetingType = 'weekly', attendees = [], duration = '1 hour' } = context;
    
    return {
      type: 'meeting_minutes',
      meetingType,
      attendees,
      duration,
      date: new Date().toISOString().split('T')[0],
      structure: {
        title: `${meetingType} meeting minutes`,
        attendees: attendees.length > 0 ? attendees : ['Team members'],
        agenda: ['Previous action items review', 'Current updates', 'New action items'],
        actionItems: [],
        nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      message: 'Meeting minutes template created. Fill in the specific details.'
    };
  }

  private async draftEmail(task: Task, context: any): Promise<any> {
    const { recipients, subject, tone = 'formal' } = context;
    
    const templates = {
      formal: `Dear ${recipients.join(', ')},\n\nI hope this email finds you well.\n\n[Content to be added]\n\nBest regards`,
      casual: `Hi ${recipients.join(', ')},\n\nJust wanted to follow up on:\n\n[Content to be added]\n\nThanks!`,
      urgent: `URGENT: ${subject}\n\n${recipients.join(', ')},\n\n[Time-sensitive content]\n\nPlease respond ASAP.`
    };

    return {
      type: 'email_draft',
      subject,
      recipients,
      tone,
      template: templates[tone as keyof typeof templates],
      message: 'Email template created. Customize the content as needed.'
    };
  }

  private async summarizeDiscussion(task: Task, context: any): Promise<any> {
    const { format = 'bullets', includeActions = true } = context;
    
    return {
      type: 'discussion_summary',
      format,
      includeActions,
      structure: {
        keyPoints: ['[Key point 1]', '[Key point 2]'],
        decisions: ['[Decision 1]', '[Decision 2]'],
        actionItems: includeActions ? ['[Action item 1]', '[Action item 2]'] : []
      },
      message: 'Discussion summary template created. Add the actual discussion content.'
    };
  }
}