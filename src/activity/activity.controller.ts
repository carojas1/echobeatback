import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
    constructor(private activityService: ActivityService) { }

    @Get('feed')
    @ApiOperation({ summary: 'Get activity feed' })
    @ApiResponse({ status: 200, description: 'Returns activity feed from followed users' })
    async getFeed(
        @CurrentUser() user: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.activityService.getFeed(user.id, parseInt(page), parseInt(limit));
    }

    @Get('history')
    @ApiOperation({ summary: 'Get play history' })
    @ApiResponse({ status: 200, description: 'Returns user play history' })
    async getHistory(
        @CurrentUser() user: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.activityService.getPlayHistory(user.id, parseInt(page), parseInt(limit));
    }

    @Get('recent')
    @ApiOperation({ summary: 'Get recently played songs' })
    @ApiResponse({ status: 200, description: 'Returns recently played songs' })
    async getRecent(@CurrentUser() user: any, @Query('limit') limit: string = '20') {
        return this.activityService.getRecentlyPlayed(user.id, parseInt(limit));
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get listening statistics' })
    @ApiResponse({ status: 200, description: 'Returns listening statistics' })
    async getStats(@CurrentUser() user: any) {
        return this.activityService.getListeningStats(user.id);
    }
}
