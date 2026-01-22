import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AlbumsService } from './albums.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('albums')
@ApiBearerAuth()
@Controller('albums')
export class AlbumsController {
    constructor(private albumsService: AlbumsService) { }

    @Public()
    @Get('trending')
    @ApiOperation({ summary: 'Get trending albums' })
    @ApiResponse({ status: 200, description: 'Returns trending albums' })
    async getTrending(@Query('limit') limit: string = '20') {
        return this.albumsService.getTrending(parseInt(limit));
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get album by ID' })
    @ApiResponse({ status: 200, description: 'Returns album details' })
    async findOne(@Param('id') id: string) {
        return this.albumsService.findById(id);
    }

    @Public()
    @Get(':id/songs')
    @ApiOperation({ summary: 'Get album songs' })
    @ApiResponse({ status: 200, description: 'Returns album songs' })
    async getAlbumSongs(@Param('id') id: string) {
        return this.albumsService.getAlbumSongs(id);
    }
}
