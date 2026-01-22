import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FirebaseSyncDto {
  @ApiProperty({ 
    description: 'Firebase UID from frontend authentication',
    example: 'abc123xyz'
  })
  @IsString()
  uid: string;

  @ApiProperty({ 
    description: 'User email from Firebase',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ 
    description: 'User display name',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ 
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg'
  })
  @IsOptional()
  @IsString()
  photoURL?: string;
}
