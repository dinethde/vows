import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { albumId, createUploadUrl, photoId, reorderPhotos, updatePhoto } from "@vows/contracts";
import type {
  CreateUploadUrl,
  Photo,
  ReorderPhotos,
  UpdatePhoto,
  UploadTicket,
} from "@vows/contracts";

import { CurrentActor, RequestId, Roles } from "../../common/decorators/auth";
import { ZodPipe } from "../../common/pipes/zod.pipe";
import type { Actor } from "../../common/request";
import { PhotoService } from "./photo.service";

const KEY_MAX = 128;

@Controller("v1/studio")
@Roles("owner", "editor")
export class PhotoController {
  constructor(private readonly photos: PhotoService) {}

  @Get("albums/:id/photos")
  list(
    @Param("id", new ZodPipe(albumId)) id: string,
  ): Promise<{ data: Photo[]; nextCursor: null }> {
    return this.photos.list(id);
  }

  @Post("albums/:id/photos/upload-url")
  createUploadUrl(
    @Param("id", new ZodPipe(albumId)) id: string,
    @Body(new ZodPipe(createUploadUrl)) body: CreateUploadUrl,
    @Headers("idempotency-key") key: string | undefined,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<UploadTicket> {
    return this.photos.createUploadUrl(id, body, key?.slice(0, KEY_MAX), { actor, requestId });
  }

  /** 202: the derivatives are being made, not made. */
  @Post("photos/:id/uploaded")
  @HttpCode(202)
  markUploaded(
    @Param("id", new ZodPipe(photoId)) id: string,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<Photo> {
    return this.photos.markUploaded(id, { actor, requestId });
  }

  @Patch("photos/:id")
  update(
    @Param("id", new ZodPipe(photoId)) id: string,
    @Body(new ZodPipe(updatePhoto)) body: UpdatePhoto,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<Photo> {
    return this.photos.update(id, body, { actor, requestId });
  }

  @Delete("photos/:id")
  @HttpCode(204)
  remove(
    @Param("id", new ZodPipe(photoId)) id: string,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<void> {
    return this.photos.remove(id, { actor, requestId });
  }

  @Put("albums/:id/order")
  reorder(
    @Param("id", new ZodPipe(albumId)) id: string,
    @Body(new ZodPipe(reorderPhotos)) body: ReorderPhotos,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<{ data: Photo[]; nextCursor: null }> {
    return this.photos.reorder(id, body, { actor, requestId });
  }
}
