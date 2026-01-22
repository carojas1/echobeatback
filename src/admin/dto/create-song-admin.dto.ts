import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSongAdminDto {
    @ApiProperty({ description: 'Song title', example: 'Bohemian Rhapsody' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Artist name', example: 'Queen' })
    @IsString()
    artist: string;

    @ApiPropertyOptional({ description: 'Album name', example: 'A Night at the Opera' })
    @IsOptional()
    @IsString()
    album?: string;

    @ApiProperty({ description: 'Duration in seconds', example: 354 })
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    duration: number;

    @ApiProperty({ description: 'File URL (MP3, YouTube, SoundCloud, etc.)', example: 'https://example.com/song.mp3' })
    @IsString()
    fileUrl: string;

    @ApiPropertyOptional({ description: 'Cover image URL', example: 'https://example.com/cover.jpg' })
    @IsOptional()
    @IsString()
    coverUrl?: string;

    @ApiPropertyOptional({ description: 'Music genre', example: 'Rock' })
    @IsOptional()
    @IsString()
    genre?: string;

    @ApiPropertyOptional({ description: 'Album ID to link' })
    @IsOptional()
    @IsString()
    albumId?: string;
}

export class UpdateSongAdminDto {
    @ApiPropertyOptional({ description: 'Song title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Artist name' })
    @IsOptional()
    @IsString()
    artist?: string;

    @ApiPropertyOptional({ description: 'Album name' })
    @IsOptional()
    @IsString()
    album?: string;

    @ApiPropertyOptional({ description: 'Duration in seconds' })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    duration?: number;

    @ApiPropertyOptional({ description: 'File URL (MP3, YouTube, SoundCloud, etc.)' })
    @IsOptional()
    @IsString()
    fileUrl?: string;

    @ApiPropertyOptional({ description: 'Cover image URL' })
    @IsOptional()
    @IsString()
    coverUrl?: string;

    @ApiPropertyOptional({ description: 'Music genre' })
    @IsOptional()
    @IsString()
    genre?: string;

    @ApiPropertyOptional({ description: 'Album ID to link' })
    @IsOptional()
    @IsString()
    albumId?: string;
}
