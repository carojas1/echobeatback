import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('artists')
@ApiBearerAuth()
@Controller('artists')
export class ArtistsController {
    constructor(private artistsService: ArtistsService) { }

    @Public()
    @Get('trending')
    @ApiOperation({ summary: 'Get trending artists' })
    @ApiResponse({ status: 200, description: 'Returns trending artists' })
    async getTrending(@Query('limit') limit: string = '20') {
        return this.artistsService.getTrending(parseInt(limit));
    }

    @Public()
    @Get(':name/songs')
    @ApiOperation({ summary: 'Get artist songs' })
    @ApiResponse({ status: 200, description: 'Returns artist songs' })
    async getArtistSongs(
        @Param('name') name: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.artistsService.getArtistSongs(name, parseInt(page), parseInt(limit));
    }

    @Public()
    @Get(':name/albums')
    @ApiOperation({ summary: 'Get artist albums' })
    @ApiResponse({ status: 200, description: 'Returns artist albums' })
    async getArtistAlbums(@Param('name') name: string) {
        return this.artistsService.getArtistAlbums(name);
    }
}
