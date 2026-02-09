import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskState,
  AgentType,
  SubTask,
  TaskType,
} from '../common/task.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrchestratorService {
  async planTask(task: Task): Promise<Task> {
    const plan = this.createTaskPlan(task);
    task.subTasks = plan;
    return task;
  }

  private createTaskPlan(task: Task): SubTask[] {
    switch (task.type) {
      case TaskType.MEETING:
        return this.createMeetingPlan(task);
      case TaskType.EMAIL:
        return this.createEmailPlan(task);
      case TaskType.SCHEDULE:
        return this.createSchedulePlan(task);
      case TaskType.DATA:
        return this.createDataPlan(task);
      default:
        return this.createDocumentPlan(task);
    }
  }

  private createMeetingPlan(task: Task): SubTask[] {
    return [
      {
        id: uuidv4(),
        agentType: AgentType.DOC,
        status: TaskState.DRAFT,
        input: `Generate meeting minutes from: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.PMO,
        status: TaskState.DRAFT,
        input: `Extract action items and schedule from: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.COMMS,
        status: TaskState.DRAFT,
        input: `Draft follow-up email based on meeting: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.COMPLIANCE,
        status: TaskState.DRAFT,
        input: `Review for external communication and PII: ${task.input}`,
        dependencies: [],
      },
    ];
  }

  private createEmailPlan(task: Task): SubTask[] {
    return [
      {
        id: uuidv4(),
        agentType: AgentType.COMMS,
        status: TaskState.DRAFT,
        input: `Draft email: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.COMPLIANCE,
        status: TaskState.DRAFT,
        input: `Review for external/PII: ${task.input}`,
        dependencies: [],
      },
    ];
  }

  private createSchedulePlan(task: Task): SubTask[] {
    return [
      {
        id: uuidv4(),
        agentType: AgentType.PMO,
        status: TaskState.DRAFT,
        input: `Create schedule: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.COMPLIANCE,
        status: TaskState.DRAFT,
        input: `Review schedule for conflicts: ${task.input}`,
        dependencies: [],
      },
    ];
  }

  private createDataPlan(task: Task): SubTask[] {
    return [
      {
        id: uuidv4(),
        agentType: AgentType.DATA,
        status: TaskState.DRAFT,
        input: `Analyze data: ${task.input}`,
        dependencies: [],
      },
      {
        id: uuidv4(),
        agentType: AgentType.DOC,
        status: TaskState.DRAFT,
        input: `Create report from analysis`,
        dependencies: [],
      },
    ];
  }

  private createDocumentPlan(task: Task): SubTask[] {
    return [
      {
        id: uuidv4(),
        agentType: AgentType.DOC,
        status: TaskState.DRAFT,
        input: `Create document: ${task.input}`,
        dependencies: [],
      },
    ];
  }

  async delegateSubTask(task: Task, subTaskId: string): Promise<void> {
    const subTask = task.subTasks.find(st => st.id === subTaskId);
    if (!subTask) return;

    subTask.status = TaskState.REVIEW;
  }

  isTaskComplete(task: Task): boolean {
    return task.subTasks.every(st => 
      st.status === TaskState.COMPLETED || st.status === TaskState.APPROVED
    );
  }
}
