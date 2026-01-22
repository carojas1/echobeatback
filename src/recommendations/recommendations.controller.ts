import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
    constructor(private recommendationsService: RecommendationsService) { }

    @Get('songs')
    @ApiOperation({ summary: 'Get recommended songs' })
    @ApiResponse({ status: 200, description: 'Returns recommended songs' })
    async getRecommendedSongs(
        @CurrentUser() user: any,
        @Query('limit') limit: string = '20',
    ) {
        return this.recommendationsService.getRecommendedSongs(user.id, parseInt(limit));
    }

    @Get('artists/:name')
    @ApiOperation({ summary: 'Get similar artists' })
    @ApiResponse({ status: 200, description: 'Returns similar artists' })
    async getSimilarArtists(
        @Param('name') artistName: string,
        @Query('limit') limit: string = '10',
    ) {
        return this.recommendationsService.getSimilarArtists(artistName, parseInt(limit));
    }

    @Get('playlists')
    @ApiOperation({ summary: 'Get personalized playlists' })
    @ApiResponse({ status: 200, description: 'Returns personalized playlists' })
    async getPersonalizedPlaylists(@CurrentUser() user: any) {
        return this.recommendationsService.getPersonalizedPlaylists(user.id);
    }
}
