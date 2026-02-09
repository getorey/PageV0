import { SubTask } from '../../common/task.types';
export declare class PmoAgentService {
    process(subTask: SubTask): Promise<string>;
    private generateSchedule;
    private extractActionItems;
    private generateTaskPlan;
}
