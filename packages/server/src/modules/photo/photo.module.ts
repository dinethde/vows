import { Module } from "@nestjs/common";

import { AlbumModule } from "../album/album.module";
import { CleanupService } from "./cleanup.service";
import { DeriveService } from "./derive.service";
import { PhotoController } from "./photo.controller";
import { PhotoRepository } from "./photo.repository";
import { PhotoService } from "./photo.service";

@Module({
  imports: [AlbumModule],
  controllers: [PhotoController],
  providers: [PhotoService, PhotoRepository, DeriveService, CleanupService],
  exports: [PhotoService, PhotoRepository, DeriveService, CleanupService],
})
export class PhotoModule {}
