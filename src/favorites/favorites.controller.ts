import { Controller, Post, Delete, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
    constructor(private favoritesService: FavoritesService) { }

    @Post('songs/:id')
    @ApiOperation({ summary: 'Add song to favorites' })
    @ApiResponse({ status: 200, description: 'Song added to favorites' })
    async addFavorite(@CurrentUser() user: any, @Param('id') songId: string) {
        return this.favoritesService.addFavorite(user.id, songId);
    }

    @Delete('songs/:id')
    @ApiOperation({ summary: 'Remove song from favorites' })
    @ApiResponse({ status: 200, description: 'Song removed from favorites' })
    async removeFavorite(@CurrentUser() user: any, @Param('id') songId: string) {
        return this.favoritesService.removeFavorite(user.id, songId);
    }

    @Get('songs')
    @ApiOperation({ summary: 'Get all favorite songs' })
    @ApiResponse({ status: 200, description: 'Returns favorite songs' })
    async getFavoriteSongs(@CurrentUser() user: any) {
        return this.favoritesService.getFavoriteSongs(user.id);
    }
}
