import { Task } from '../common/task.types';
import { CreateTaskRequest } from './dto/create-task.request';
export declare class IntakeService {
    processRequest(request: CreateTaskRequest): Promise<Task>;
    private classifyTaskType;
    private analyzeRiskTags;
    private calculateRiskLevel;
}
