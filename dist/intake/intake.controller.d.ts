import { IntakeService } from './intake.service';
import { CreateTaskRequest } from './dto/create-task.request';
export declare class IntakeController {
    private readonly intakeService;
    constructor(intakeService: IntakeService);
    createTask(request: CreateTaskRequest): Promise<import("../common/task.types").Task>;
}
