import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Global search' })
    @ApiResponse({ status: 200, description: 'Returns search results' })
    async search(@Query('q') query: string, @Query('type') type: string = 'all') {
        return this.searchService.globalSearch(query, type);
    }

    @Public()
    @Get('autocomplete')
    @ApiOperation({ summary: 'Autocomplete suggestions' })
    @ApiResponse({ status: 200, description: 'Returns autocomplete suggestions' })
    async autocomplete(@Query('q') query: string) {
        return this.searchService.autocomplete(query);
    }
}
