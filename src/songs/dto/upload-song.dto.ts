import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadSongDto {
  @ApiProperty({ example: 'Bohemian Rhapsody' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Queen' })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiPropertyOptional({ example: 'A Night at the Opera' })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiProperty({ example: 354 })
  @Transform(({ value }) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return 180; // default 3 min
    return Math.floor(n);
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ example: 'Rock' })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ example: 'happy' })
  @IsString()
  @IsOptional()
  mood?: string;
}
