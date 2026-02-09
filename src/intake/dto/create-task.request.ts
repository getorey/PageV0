import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskType } from '../../common/task.types';

export class CreateTaskRequest {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  input: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsString()
  requester: string;
}
