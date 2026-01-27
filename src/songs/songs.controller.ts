import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SongsService } from './songs.service';
import { UploadSongDto } from './dto/upload-song.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@ApiTags('songs')
@ApiBearerAuth()
@Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new song' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        artist: { type: 'string' },
        album: { type: 'string' },
        duration: { type: 'integer' },
        genre: { type: 'string' },
        mood: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Song uploaded successfully' })
  async uploadSong(
    @UploadedFile() file: any,
    @Body() uploadSongDto: UploadSongDto,
    @Request() req,
  ) {
    console.log('✅ HIT /songs/upload - file?', !!file, 'body:', uploadSongDto);
    console.log('✅ FILE:', file?.originalname, file?.mimetype, file?.size);
    console.log('✅ USER:', req.user);
    console.log('✅ ABOUT TO UPLOAD/SAVE');
    return this.songsService.uploadSong(file, uploadSongDto, req.user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all songs' })
  @ApiResponse({ status: 200, description: 'Returns all songs with pagination' })
  async getAllSongs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    return this.songsService.search(search || '', parseInt(page), parseInt(limit));
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search for songs' })
  @ApiResponse({ status: 200, description: 'Returns matching songs' })
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.songsService.search(query, parseInt(page), parseInt(limit));
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending songs' })
  @ApiResponse({ status: 200, description: 'Returns trending songs' })
  async getTrending(@Query('limit') limit: string = '20') {
    return this.songsService.getTrending(parseInt(limit));
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Get recently added songs' })
  @ApiResponse({ status: 200, description: 'Returns recent songs' })
  async getRecent(@Query('limit') limit: string = '20') {
    return this.songsService.getRecent(parseInt(limit));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get song by ID' })
  @ApiResponse({ status: 200, description: 'Returns song details' })
  async getSongById(@Param('id') id: string) {
    return this.songsService.findById(id);
  }

  @Post(':id/play')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Increment song play count' })
  @ApiResponse({ status: 200, description: 'Play count incremented' })
  async playSong(@Param('id') id: string, @Request() req) {
    return this.songsService.incrementPlayCount(id, req.user?.uid);
  }

  @Public()
  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream song audio' })
  @ApiResponse({ status: 200, description: 'Returns audio stream' })
  async streamSong(@Param('id') id: string, @Res() res: Response) {
    const song = await this.songsService.findById(id);
    return res.redirect(song.fileUrl);
  }
}
