-- Change categories.id from UUID to TEXT to support slug-based IDs
-- This allows us to use human-readable IDs like 'ai-services' instead of UUIDs

-- Step 1: Find and drop ALL foreign key constraints that reference categories.id
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'categories'
        AND ccu.column_name IN ('id', 'parent_id')
        AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
        RAISE NOTICE 'Dropped constraint % from table %', r.constraint_name, r.table_name;
    END LOOP;
END $$;

-- Step 2: Change the id column type in categories table
ALTER TABLE categories ALTER COLUMN id TYPE TEXT;
ALTER TABLE categories ALTER COLUMN parent_id TYPE TEXT;

-- Step 3: Change category_id columns in all related tables to TEXT
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT
            table_name,
            column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'category_id'
        AND data_type = 'uuid'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' ALTER COLUMN ' || r.column_name || ' TYPE TEXT';
        RAISE NOTICE 'Changed %.% to TEXT', r.table_name, r.column_name;
    END LOOP;
END $$;

-- Step 4: Recreate foreign key constraints
-- services -> categories (if has category_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'services'
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE services
          ADD CONSTRAINT services_category_id_fkey
          FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE SET NULL;
    END IF;
END $$;

-- categories -> categories (self-referencing for parent_id)
ALTER TABLE categories
  ADD CONSTRAINT categories_parent_id_fkey
  FOREIGN KEY (parent_id)
  REFERENCES categories(id)
  ON DELETE CASCADE;

-- Dynamically recreate all category_id foreign keys
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'category_id'
        AND table_name != 'categories'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name ||
                ' ADD CONSTRAINT ' || r.table_name || '_category_id_fkey ' ||
                ' FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL';
        RAISE NOTICE 'Added foreign key constraint for %.category_id', r.table_name;
    END LOOP;
END $$;

-- Verify the changes
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  (table_name = 'categories' AND column_name IN ('id', 'parent_id'))
  OR (column_name = 'category_id')
)
ORDER BY table_name, column_name;
