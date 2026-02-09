import { SubTask } from '../../common/task.types';
export declare class DataAgentService {
    process(subTask: SubTask): Promise<string>;
    private aggregateData;
    private analyzeData;
    private processData;
}
