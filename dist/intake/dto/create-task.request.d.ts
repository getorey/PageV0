import { TaskType } from '../../common/task.types';
export declare class CreateTaskRequest {
    title: string;
    description: string;
    input: string;
    type?: TaskType;
    requester: string;
}
