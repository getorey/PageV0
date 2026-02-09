import { Task } from '../common/task.types';
export declare class OrchestratorService {
    planTask(task: Task): Promise<Task>;
    private createTaskPlan;
    private createMeetingPlan;
    private createEmailPlan;
    private createSchedulePlan;
    private createDataPlan;
    private createDocumentPlan;
    delegateSubTask(task: Task, subTaskId: string): Promise<void>;
    isTaskComplete(task: Task): boolean;
}
