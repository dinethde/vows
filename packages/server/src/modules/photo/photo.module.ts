import { Module } from '@nestjs/common';

import { AlbumModule } from '../album/album.module';

import { DeriveService } from './derive.service';
import { PhotoController } from './photo.controller';
import { PhotoRepository } from './photo.repository';
import { PhotoService } from './photo.service';

@Module({
  imports: [AlbumModule],
  controllers: [PhotoController],
  providers: [PhotoService, PhotoRepository, DeriveService],
  exports: [PhotoService, PhotoRepository, DeriveService],
})
export class PhotoModule {}
