import { IsString, IsNotEmpty, MaxLength, IsString as IsStringV } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminReplyDto {
  @ApiProperty({ description: 'ID of the user to reply to' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @ApiProperty({ description: 'Reply message content', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
