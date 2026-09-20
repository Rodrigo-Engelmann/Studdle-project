import { IsArray, IsInt } from 'class-validator';

export class UpdateTaskContentDto {
  @IsArray()
  @IsInt({ each: true })
  video_ids?: number[];

  @IsArray()
  @IsInt({ each: true })
  material_ids?: number[];
}
