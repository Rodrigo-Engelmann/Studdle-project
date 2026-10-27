import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  colorblindness?: string;
}

export class UserResponseDto {
  id?: number;
  user_name?: string;
  profile_picture?: string | null;
  account_bio?: string | null;
  xp?: number;
  current_module_id?: number | null;
  module_progress?: number;
  createdDate?: Date;
}
