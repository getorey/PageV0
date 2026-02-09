import { Controller, Post, Body } from '@nestjs/common';
import { IntakeService } from './intake.service';
import { CreateTaskRequest } from './dto/create-task.request';

@Controller('tasks')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post()
  async createTask(@Body() request: CreateTaskRequest) {
    return this.intakeService.processRequest(request);
  }
}
