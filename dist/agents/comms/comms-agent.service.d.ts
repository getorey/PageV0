import { SubTask } from '../../common/task.types';
export declare class CommsAgentService {
    process(subTask: SubTask): Promise<string>;
    private generateEmail;
    private generateNotice;
    private generateCommunication;
}
