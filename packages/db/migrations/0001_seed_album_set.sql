-- The album set is fixed at 22: one per tile on the home page. The Studio
-- fills them in. Nothing in the product creates an album or deletes one, so
-- these rows are part of the schema and not sample data.
INSERT INTO "album" ("id", "slug", "title", "sort_index")
SELECT
	'alb_' || lpad(n::text, 6, '0'),
	'album-' || lpad(n::text, 2, '0'),
	'Album ' || lpad(n::text, 2, '0'),
	23 - n
FROM generate_series(1, 22) AS n
ON CONFLICT ("id") DO NOTHING;
