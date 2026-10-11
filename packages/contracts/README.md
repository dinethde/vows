# @vows/contracts

The shape of every request and response, written once as a Zod schema, with the
TypeScript type inferred from it. Imported by all three apps.

The point: the API validates an incoming body with the same schema the web app
used to build it, so a mismatch is a type error at build time rather than a 400
in production.

```
src/albums/        createAlbum, updateAlbum, albumResponse, albumListResponse
src/photographs/   uploadTicket, photographResponse, reorderRequest
src/enquiries/     enquiryRequest, enquiryResponse
src/settings/      settingsResponse, updateSettings
src/jobs/          one payload schema per pg-boss queue
src/shared/        pagination, ids, error shape, timestamps
```

Rules:

- a schema is defined here or nowhere. No app declares its own request shape.
- the error shape is shared: `{ error: { code, message, details? } }`.
- never export a type without the schema that produced it.
