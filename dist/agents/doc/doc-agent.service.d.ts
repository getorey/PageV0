import { SubTask } from '../../common/task.types';
export declare class DocAgentService {
    process(subTask: SubTask): Promise<string>;
    private generateMeetingMinutes;
    private generateReport;
    private generateGeneralDocument;
}
