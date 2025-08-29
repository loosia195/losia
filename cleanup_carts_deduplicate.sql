-- cleanup_carts_deduplicate.sql
-- Purpose: Deduplicate CartItem (cartId, productId), merge duplicate Carts by userId and anonId
-- Then you can safely add UNIQUE constraints via Prisma Migrate.

BEGIN;

-- (Optional but recommended) keep quick backups
-- Note: IF NOT EXISTS avoids failing if you re-run the script.
CREATE TABLE IF NOT EXISTS "_backup_Cart_20250819"    AS SELECT * FROM "Cart";
CREATE TABLE IF NOT EXISTS "_backup_CartItem_20250819" AS SELECT * FROM "CartItem";

-- ===== 0) (Optional) tighten runtime behavior inside this transaction
-- SET LOCAL lock_timeout = '5s';
-- SET LOCAL statement_timeout = '5min';

-- ===== 1) Deduplicate CartItem by (cartId, productId): keep 1 row and sum quantity
WITH ranked AS (
  SELECT
    id,
    "cartId",
    "productId",
    quantity,
    "unitPrice",
    ROW_NUMBER() OVER (PARTITION BY "cartId","productId" ORDER BY id) AS rn,
    SUM(quantity) OVER (PARTITION BY "cartId","productId") AS sum_q
  FROM "CartItem"
),
upd AS (
  UPDATE "CartItem" ci
  SET quantity = r.sum_q
  FROM ranked r
  WHERE ci.id = r.id AND r.rn = 1
  RETURNING ci.id
)
DELETE FROM "CartItem" d
USING ranked r
WHERE d.id = r.id AND r.rn > 1;

-- ===== 2) Merge duplicate Carts by userId (user logged-in carts)
-- Choose a keeper per userId (rn=1, by highest id); move items from non-keeper carts into keeper
WITH dup_users AS (
  SELECT "userId" FROM "Cart"
  WHERE "userId" IS NOT NULL
  GROUP BY "userId"
  HAVING COUNT(*) > 1
),
carts AS (
  SELECT c.*,
         ROW_NUMBER() OVER (PARTITION BY c."userId" ORDER BY c.id DESC) AS rn
  FROM "Cart" c
  JOIN dup_users d ON d."userId" = c."userId"
),
agg AS (
  SELECT keep.id AS keep_id,
         ci."productId",
         SUM(ci.quantity) AS total_qty,
         MAX(ci."unitPrice") AS unit_price
  FROM carts nonkeep
  JOIN "CartItem" ci ON ci."cartId" = nonkeep.id
  JOIN carts keep ON keep."userId" = nonkeep."userId" AND keep.rn = 1
  WHERE nonkeep.rn > 1
  GROUP BY keep.id, ci."productId"
),
updk AS (
  UPDATE "CartItem" k
  SET quantity = k.quantity + a.total_qty
  FROM agg a
  WHERE k."cartId" = a.keep_id AND k."productId" = a."productId"
  RETURNING k.id
),
ins AS (
  INSERT INTO "CartItem" ("cartId","productId","quantity","unitPrice")
  SELECT a.keep_id, a."productId", a.total_qty, a.unit_price
  FROM agg a
  LEFT JOIN "CartItem" k
    ON k."cartId" = a.keep_id AND k."productId" = a."productId"
  WHERE k.id IS NULL
  RETURNING id
),
del_items AS (
  DELETE FROM "CartItem" ci
  USING carts nonkeep
  WHERE ci."cartId" = nonkeep.id AND nonkeep.rn > 1
  RETURNING ci.id
)
DELETE FROM "Cart" c
USING carts nonkeep
WHERE c.id = nonkeep.id AND nonkeep.rn > 1;

-- ===== 3) Merge duplicate Carts by anonId (guest carts)
WITH dup_anon AS (
  SELECT "anonId" FROM "Cart"
  WHERE "anonId" IS NOT NULL
  GROUP BY "anonId"
  HAVING COUNT(*) > 1
),
carts AS (
  SELECT c.*,
         ROW_NUMBER() OVER (PARTITION BY c."anonId" ORDER BY c.id DESC) AS rn
  FROM "Cart" c
  JOIN dup_anon d ON d."anonId" = c."anonId"
),
agg AS (
  SELECT keep.id AS keep_id,
         ci."productId",
         SUM(ci.quantity) AS total_qty,
         MAX(ci."unitPrice") AS unit_price
  FROM carts nonkeep
  JOIN "CartItem" ci ON ci."cartId" = nonkeep.id
  JOIN carts keep ON keep."anonId" = nonkeep."anonId" AND keep.rn = 1
  WHERE nonkeep.rn > 1
  GROUP BY keep.id, ci."productId"
),
updk AS (
  UPDATE "CartItem" k
  SET quantity = k.quantity + a.total_qty
  FROM agg a
  WHERE k."cartId" = a.keep_id AND k."productId" = a."productId"
  RETURNING k.id
),
ins AS (
  INSERT INTO "CartItem" ("cartId","productId","quantity","unitPrice")
  SELECT a.keep_id, a."productId", a.total_qty, a.unit_price
  FROM agg a
  LEFT JOIN "CartItem" k
    ON k."cartId" = a.keep_id AND k."productId" = a."productId"
  WHERE k.id IS NULL
  RETURNING id
),
del_items AS (
  DELETE FROM "CartItem" ci
  USING carts nonkeep
  WHERE ci."cartId" = nonkeep.id AND nonkeep.rn > 1
  RETURNING ci.id
)
DELETE FROM "Cart" c
USING carts nonkeep
WHERE c.id = nonkeep.id AND nonkeep.rn > 1;

COMMIT;

-- ===== 4) Post-checks (run separately after COMMIT to verify) =====
-- Duplicate CartItem (should be 0 rows)
-- SELECT "cartId","productId", COUNT(*) AS n FROM "CartItem" GROUP BY 1,2 HAVING COUNT(*) > 1;
-- Duplicate userId carts (should be 0 rows)
-- SELECT "userId", COUNT(*) AS n FROM "Cart" WHERE "userId" IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1;
-- Duplicate anonId carts (should be 0 rows)
-- SELECT "anonId", COUNT(*) AS n FROM "Cart" WHERE "anonId" IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1;
