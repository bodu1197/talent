import { FULL_CATEGORIES } from '../src/data/categories-full'
import fs from 'fs'
import path from 'path'

// Generate SQL migration from categories-full.ts
function generateCategoriesMigration() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '')
  const migrationPath = path.join(__dirname, '../supabase/migrations', `${timestamp}_insert_all_categories.sql`)

  let sql = `-- Insert all categories from categories-full.ts into database
-- This migration populates the categories table with all predefined categories

-- First, clear any existing categories (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE categories CASCADE;

`

  // Function to recursively generate INSERT statements
  function generateInserts(categories: typeof FULL_CATEGORIES, level = 0): string {
    let inserts = ''

    for (const category of categories) {
      const { id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, is_popular, is_ai } = category

      // Escape single quotes in strings
      const escapedName = name.replace(/'/g, "''")
      const escapedDescription = description?.replace(/'/g, "''") || null
      const escapedKeywords = keywords ? `ARRAY[${keywords.map(k => `'${k.replace(/'/g, "''")}'`).join(', ')}]` : 'NULL'
      const parentIdValue = parent_id ? `'${parent_id}'` : 'NULL'
      const iconValue = icon ? `'${icon}'` : 'NULL'
      const descriptionValue = description ? `'${escapedDescription}'` : 'NULL'
      const serviceCountValue = service_count || 0
      const popularityScoreValue = popularity_score || 0

      inserts += `INSERT INTO categories (id, name, slug, icon, description, keywords, parent_id, service_count, popularity_score, display_order, is_active)
VALUES ('${id}', '${escapedName}', '${slug}', ${iconValue}, ${descriptionValue}, ${escapedKeywords}, ${parentIdValue}, ${serviceCountValue}, ${popularityScoreValue}, ${level}, true)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  parent_id = EXCLUDED.parent_id,
  service_count = EXCLUDED.service_count,
  popularity_score = EXCLUDED.popularity_score,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

`

      // Recursively process children
      if (category.children && category.children.length > 0) {
        inserts += generateInserts(category.children, level + 1)
      }
    }

    return inserts
  }

  sql += generateInserts(FULL_CATEGORIES)

  sql += `
-- Verify the insert
SELECT
  COUNT(*) as total_categories,
  COUNT(DISTINCT parent_id) as unique_parents,
  COUNT(*) FILTER (WHERE parent_id IS NULL) as top_level_categories
FROM categories;
`

  // Write to migration file
  fs.writeFileSync(migrationPath, sql, 'utf-8')
  console.log(`✅ Migration file generated: ${migrationPath}`)
  console.log(`📊 Total categories processed: ${countCategories(FULL_CATEGORIES)}`)
}

// Count total categories recursively
function countCategories(categories: typeof FULL_CATEGORIES): number {
  let count = categories.length
  for (const category of categories) {
    if (category.children && category.children.length > 0) {
      count += countCategories(category.children)
    }
  }
  return count
}

// Run the generator
generateCategoriesMigration()
