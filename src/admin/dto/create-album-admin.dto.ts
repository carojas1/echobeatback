import { IsString, IsOptional, IsInt, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlbumAdminDto {
    @ApiProperty({ description: 'Album title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Artist name' })
    @IsString()
    artist: string;

    @ApiPropertyOptional({ description: 'Cover image URL' })
    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @ApiPropertyOptional({ description: 'Release year' })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(2100)
    releaseYear?: number;

    @ApiPropertyOptional({ description: 'Music genre' })
    @IsOptional()
    @IsString()
    genre?: string;
}

export class UpdateAlbumAdminDto {
    @ApiPropertyOptional({ description: 'Album title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Artist name' })
    @IsOptional()
    @IsString()
    artist?: string;

    @ApiPropertyOptional({ description: 'Cover image URL' })
    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @ApiPropertyOptional({ description: 'Release year' })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(2100)
    releaseYear?: number;

    @ApiPropertyOptional({ description: 'Music genre' })
    @IsOptional()
    @IsString()
    genre?: string;
}
