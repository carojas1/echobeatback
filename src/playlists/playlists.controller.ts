import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddSongToPlaylistDto } from './dto/add-song.dto';

@ApiTags('playlists')
@ApiBearerAuth()
@Controller('playlists')
export class PlaylistsController {
    constructor(private playlistsService: PlaylistsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new playlist' })
    @ApiResponse({ status: 201, description: 'Playlist created successfully' })
    async create(@CurrentUser() user: any, @Body() createPlaylistDto: CreatePlaylistDto) {
        return this.playlistsService.create(user.id, createPlaylistDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user playlists' })
    @ApiResponse({ status: 200, description: 'Returns user playlists' })
    async findAll(@CurrentUser() user: any) {
        return this.playlistsService.findAll(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get playlist by ID' })
    @ApiResponse({ status: 200, description: 'Returns playlist details' })
    async findOne(@Param('id') id: string) {
        return this.playlistsService.findById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update playlist' })
    @ApiResponse({ status: 200, description: 'Playlist updated successfully' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() updatePlaylistDto: UpdatePlaylistDto,
    ) {
        return this.playlistsService.update(id, user.id, updatePlaylistDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete playlist' })
    @ApiResponse({ status: 200, description: 'Playlist deleted successfully' })
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.playlistsService.delete(id, user.id);
    }

    @Post(':id/songs')
    @ApiOperation({ summary: 'Add song to playlist' })
    @ApiResponse({ status: 200, description: 'Song added to playlist' })
    async addSong(
        @Param('id') playlistId: string,
        @Body() addSongDto: AddSongToPlaylistDto,
        @CurrentUser() user: any,
    ) {
        return this.playlistsService.addSong(playlistId, addSongDto.songId, user.id);
    }

    @Delete(':id/songs/:songId')
    @ApiOperation({ summary: 'Remove song from playlist' })
    @ApiResponse({ status: 200, description: 'Song removed from playlist' })
    async removeSong(
        @Param('id') playlistId: string,
        @Param('songId') songId: string,
        @CurrentUser() user: any,
    ) {
        return this.playlistsService.removeSong(playlistId, songId, user.id);
    }
}
