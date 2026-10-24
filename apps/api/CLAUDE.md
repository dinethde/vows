# apps/api

NestJS 11. The only thing that writes to the database.

- Four layers: controller (parse, authorise, call one service, shape the
  response), service (business rules, transactions, enqueue), repository
  (Drizzle only), module (wiring). A controller never touches the database.
- Request bodies are parsed by the Zod schema from `packages/contracts` before
  the controller sees them.
- Anything slower than ~300 ms is enqueued and answered with 202. The API's job
  is to answer and get out of the way.
- A job and the row it refers to are written in one transaction.
- Errors cross the boundary once, in the global exception filter, in the
  envelope from chapter 08. A controller never writes a status code for a
  failure.
- Every response carries the request id, including successes.
- Rate limits are counted in shared storage, never in process memory.

Full rules: `architecture.md` chapters 08, 09, 15 and 19.
