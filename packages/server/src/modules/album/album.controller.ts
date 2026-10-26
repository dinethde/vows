import { Body, Controller, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";

import { albumId, slug, updateAlbum } from "@vows/contracts";
import type {
  Album,
  AlbumSummary,
  StudioAlbum,
  StudioAlbumList,
  UpdateAlbum,
} from "@vows/contracts";

import { CurrentActor, RequestId, Roles } from "../../common/decorators/auth";
import { ZodPipe } from "../../common/pipes/zod.pipe";
import type { Actor } from "../../common/request";
import { AlbumService } from "./album.service";

/** There is no create and no delete. The set is 22, and unpublish is the strongest action. */
@Controller("v1")
export class AlbumController {
  constructor(private readonly albums: AlbumService) {}

  @Get("albums")
  listPublished(): Promise<{ data: AlbumSummary[]; nextCursor: null }> {
    return this.albums.listPublished();
  }

  @Get("albums/:slug")
  getPublished(@Param("slug", new ZodPipe(slug)) value: string): Promise<Album> {
    return this.albums.getPublished(value);
  }

  @Get("studio/albums")
  @Roles("owner", "editor")
  list(): Promise<StudioAlbumList> {
    return this.albums.listForStudio();
  }

  @Get("studio/albums/:id")
  @Roles("owner", "editor")
  get(@Param("id", new ZodPipe(albumId)) id: string): Promise<StudioAlbum> {
    return this.albums.getForStudio(id);
  }

  @Patch("studio/albums/:id")
  @Roles("owner", "editor")
  update(
    @Param("id", new ZodPipe(albumId)) id: string,
    @Body(new ZodPipe(updateAlbum)) body: UpdateAlbum,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<StudioAlbum> {
    return this.albums.update(id, body, { actor, requestId });
  }

  // 200, not Nest's 201: nothing is created, the album changes state.
  @Post("studio/albums/:id/publish")
  @HttpCode(200)
  @Roles("owner", "editor")
  publish(
    @Param("id", new ZodPipe(albumId)) id: string,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<StudioAlbum> {
    return this.albums.publish(id, { actor, requestId });
  }

  @Post("studio/albums/:id/unpublish")
  @HttpCode(200)
  @Roles("owner", "editor")
  unpublish(
    @Param("id", new ZodPipe(albumId)) id: string,
    @CurrentActor() actor: Actor,
    @RequestId() requestId: string,
  ): Promise<StudioAlbum> {
    return this.albums.unpublish(id, { actor, requestId });
  }
}
