import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe Updated' })
    @IsString()
    @IsOptional()
    displayName?: string;

    @ApiPropertyOptional({ example: 'Music enthusiast and playlist curator' })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsString()
    @IsOptional()
    avatar?: string;
}
