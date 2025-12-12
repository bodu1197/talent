const fs = require('fs');

// TypeScript 타입에서 PostgreSQL 타입으로 매핑
const _typeMapping = {
  'string': 'TEXT',
  'string | null': 'TEXT',
  'number': 'INTEGER',
  'number | null': 'INTEGER',
  'boolean': 'BOOLEAN',
  'boolean | null': 'BOOLEAN',
  'string[]': 'TEXT[]',
  'string[] | null': 'TEXT[]',
  'Json': 'JSONB',
  'Json | null': 'JSONB',
  'unknown': 'INET',
};

const schema = {
  users: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      email: { type: 'TEXT', notNull: true, unique: true },
      name: { type: 'TEXT', notNull: true },
      phone: { type: 'TEXT' },
      profile_image: { type: 'TEXT' },
      bio: { type: 'TEXT' },
      email_verified: { type: 'BOOLEAN', default: 'false' },
      phone_verified: { type: 'BOOLEAN', default: 'false' },
      is_active: { type: 'BOOLEAN', default: 'true' },
      user_type: { type: 'TEXT', default: "'buyer'" },
      last_login_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_users_email', columns: ['email'] },
      { name: 'idx_users_phone', columns: ['phone'] },
    ]
  },
  seller_profiles: {
    columns: {
      user_id: { type: 'UUID', primaryKey: true, references: 'users(id)' },
      business_name: { type: 'TEXT' },
      description: { type: 'TEXT' },
      skills: { type: 'TEXT[]' },
      bank_name: { type: 'TEXT' },
      bank_account: { type: 'TEXT' },
      account_holder: { type: 'TEXT' },
      is_verified: { type: 'BOOLEAN', default: 'false' },
      rating: { type: 'DECIMAL(3,2)', default: '0' },
      total_sales: { type: 'INTEGER', default: '0' },
      total_reviews: { type: 'INTEGER', default: '0' },
      response_time: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    }
  },
  categories: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      name: { type: 'TEXT', notNull: true },
      slug: { type: 'TEXT', notNull: true, unique: true },
      description: { type: 'TEXT' },
      icon: { type: 'TEXT' },
      parent_id: { type: 'UUID', references: 'categories(id)' },
      level: { type: 'INTEGER', notNull: true, default: '0' },
      display_order: { type: 'INTEGER', default: '0' },
      is_active: { type: 'BOOLEAN', default: 'true' },
      is_featured: { type: 'BOOLEAN', default: 'false' },
      is_ai_category: { type: 'BOOLEAN', default: 'false' },
      service_count: { type: 'INTEGER', default: '0' },
      commission_rate: { type: 'DECIMAL(5,2)', default: '10.00' },
      keywords: { type: 'TEXT[]' },
      meta_title: { type: 'TEXT' },
      meta_description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_categories_parent_id', columns: ['parent_id'] },
      { name: 'idx_categories_slug', columns: ['slug'], unique: true },
    ]
  },
  services: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      seller_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      title: { type: 'TEXT', notNull: true },
      slug: { type: 'TEXT', notNull: true, unique: true },
      description: { type: 'TEXT', notNull: true },
      price: { type: 'INTEGER', notNull: true },
      price_unit: { type: 'TEXT', default: "'KRW'" },
      delivery_days: { type: 'INTEGER', notNull: true },
      revision_count: { type: 'INTEGER', default: '1' },
      express_delivery: { type: 'BOOLEAN', default: 'false' },
      express_days: { type: 'INTEGER' },
      express_price: { type: 'INTEGER' },
      thumbnail_url: { type: 'TEXT' },
      video_url: { type: 'TEXT' },
      portfolio_urls: { type: 'TEXT[]' },
      requirements: { type: 'TEXT' },
      status: { type: 'TEXT', default: "'draft'" },
      is_featured: { type: 'BOOLEAN', default: 'false' },
      featured_until: { type: 'TIMESTAMP WITH TIME ZONE' },
      views: { type: 'INTEGER', default: '0' },
      clicks: { type: 'INTEGER', default: '0' },
      orders_count: { type: 'INTEGER', default: '0' },
      completed_orders: { type: 'INTEGER', default: '0' },
      in_progress_orders: { type: 'INTEGER', default: '0' },
      rating: { type: 'DECIMAL(3,2)' },
      review_count: { type: 'INTEGER', default: '0' },
      meta_title: { type: 'TEXT' },
      meta_description: { type: 'TEXT' },
      version: { type: 'INTEGER', default: '1' },
      last_modified_by: { type: 'UUID', references: 'users(id)' },
      deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_services_seller_id', columns: ['seller_id'] },
      { name: 'idx_services_slug', columns: ['slug'], unique: true },
      { name: 'idx_services_status', columns: ['status'] },
    ]
  },
  favorites: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      service_id: { type: 'UUID', notNull: true, references: 'services(id)' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_favorites_user_service', columns: ['user_id', 'service_id'], unique: true },
    ]
  },
  orders: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      order_number: { type: 'TEXT', notNull: true, unique: true },
      buyer_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      seller_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      service_id: { type: 'UUID', notNull: true, references: 'services(id)' },
      title: { type: 'TEXT', notNull: true },
      description: { type: 'TEXT' },
      package_type: { type: 'TEXT' },
      requirements: { type: 'TEXT' },
      attachments: { type: 'TEXT[]' },
      base_amount: { type: 'INTEGER', notNull: true },
      express_amount: { type: 'INTEGER', default: '0' },
      additional_amount: { type: 'INTEGER', default: '0' },
      discount_amount: { type: 'INTEGER', default: '0' },
      total_amount: { type: 'INTEGER', notNull: true },
      commission_rate: { type: 'DECIMAL(5,2)', notNull: true },
      commission_fee: { type: 'INTEGER', notNull: true },
      seller_amount: { type: 'INTEGER', notNull: true },
      delivery_date: { type: 'TEXT', notNull: true },
      revision_count: { type: 'INTEGER', default: '1' },
      used_revisions: { type: 'INTEGER', default: '0' },
      status: { type: 'TEXT', default: "'pending'" },
      payment_status: { type: 'TEXT', default: "'unpaid'" },
      work_status: { type: 'TEXT', default: "'pending'" },
      paid_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      started_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      delivered_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      completed_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      cancelled_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      cancellation_reason: { type: 'TEXT' },
      auto_complete_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      buyer_satisfied: { type: 'BOOLEAN' },
      seller_rating: { type: 'INTEGER' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_orders_order_number', columns: ['order_number'], unique: true },
      { name: 'idx_orders_buyer_id', columns: ['buyer_id'] },
      { name: 'idx_orders_seller_id', columns: ['seller_id'] },
      { name: 'idx_orders_status', columns: ['status'] },
    ]
  },
  reviews: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      order_id: { type: 'UUID', notNull: true, unique: true, references: 'orders(id)' },
      buyer_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      seller_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      service_id: { type: 'UUID', notNull: true, references: 'services(id)' },
      rating: { type: 'INTEGER', notNull: true },
      communication_rating: { type: 'INTEGER' },
      quality_rating: { type: 'INTEGER' },
      delivery_rating: { type: 'INTEGER' },
      comment: { type: 'TEXT' },
      tags: { type: 'TEXT[]' },
      images: { type: 'TEXT[]' },
      seller_reply: { type: 'TEXT' },
      seller_reply_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      helpful_count: { type: 'INTEGER', default: '0' },
      not_helpful_count: { type: 'INTEGER', default: '0' },
      is_visible: { type: 'BOOLEAN', default: 'true' },
      is_featured: { type: 'BOOLEAN', default: 'false' },
      moderated: { type: 'BOOLEAN', default: 'false' },
      moderation_reason: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_reviews_order_id', columns: ['order_id'], unique: true },
      { name: 'idx_reviews_seller_id', columns: ['seller_id'] },
      { name: 'idx_reviews_service_id', columns: ['service_id'] },
    ]
  },
  conversations: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      participant1_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      participant2_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      order_id: { type: 'UUID', references: 'orders(id)' },
      is_active: { type: 'BOOLEAN', default: 'true' },
      last_message_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      last_message_preview: { type: 'TEXT' },
      participant1_last_read: { type: 'TIMESTAMP WITH TIME ZONE' },
      participant2_last_read: { type: 'TIMESTAMP WITH TIME ZONE' },
      participant1_unread_count: { type: 'INTEGER', default: '0' },
      participant2_unread_count: { type: 'INTEGER', default: '0' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_conversations_participants', columns: ['participant1_id', 'participant2_id'] },
    ]
  },
  messages: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      conversation_id: { type: 'UUID', notNull: true, references: 'conversations(id)' },
      sender_id: { type: 'UUID', notNull: true, references: 'users(id)' },
      content: { type: 'TEXT' },
      message_type: { type: 'TEXT', default: "'text'" },
      attachments: { type: 'JSONB' },
      is_read: { type: 'BOOLEAN', default: 'false' },
      read_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      is_edited: { type: 'BOOLEAN', default: 'false' },
      edited_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      is_deleted: { type: 'BOOLEAN', default: 'false' },
      deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_messages_conversation_id', columns: ['conversation_id'] },
      { name: 'idx_messages_sender_id', columns: ['sender_id'] },
    ]
  },
  payments: {
    columns: {
      id: { type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      order_id: { type: 'UUID', references: 'orders(id)' },
      transaction_id: { type: 'TEXT', notNull: true, unique: true },
      amount: { type: 'INTEGER', notNull: true },
      vat: { type: 'INTEGER' },
      payment_method: { type: 'TEXT', notNull: true },
      pg_provider: { type: 'TEXT', notNull: true },
      card_company: { type: 'TEXT' },
      card_number_masked: { type: 'TEXT' },
      installment_months: { type: 'INTEGER' },
      approval_number: { type: 'TEXT' },
      status: { type: 'TEXT', default: "'pending'" },
      pg_response: { type: 'JSONB' },
      paid_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      failed_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      cancelled_at: { type: 'TIMESTAMP WITH TIME ZONE' },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
    },
    indexes: [
      { name: 'idx_payments_transaction_id', columns: ['transaction_id'], unique: true },
      { name: 'idx_payments_order_id', columns: ['order_id'] },
    ]
  },
};

// SQL 생성 함수
function generateCreateTableSQL(tableName, tableSchema) {
  const { columns, indexes = [] } = tableSchema;
  let sql = `\n-- Table: ${tableName}\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

  const columnDefs = [];
  const primaryKeys = [];

  for (const [colName, colDef] of Object.entries(columns)) {
    let colSQL = `  ${colName} ${colDef.type}`;

    if (colDef.default) {
      colSQL += ` DEFAULT ${colDef.default}`;
    }

    if (colDef.notNull) {
      colSQL += ' NOT NULL';
    }

    if (colDef.unique && !colDef.primaryKey) {
      colSQL += ' UNIQUE';
    }

    if (colDef.primaryKey) {
      primaryKeys.push(colName);
    }

    columnDefs.push(colSQL);
  }

  if (primaryKeys.length > 0) {
    columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
  }

  sql += columnDefs.join(',\n');
  sql += '\n);\n';

  // Foreign keys
  for (const [colName, colDef] of Object.entries(columns)) {
    if (colDef.references) {
      const [refTable, refCol] = colDef.references.split('(');
      const refColumn = refCol.replace(')', '');
      sql += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${tableName}_${colName}_fkey `;
      sql += `FOREIGN KEY (${colName}) REFERENCES public.${refTable}(${refColumn});\n`;
    }
  }

  // Indexes
  for (const index of indexes) {
    const uniqueStr = index.unique ? 'UNIQUE ' : '';
    sql += `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${index.name} `;
    sql += `ON public.${tableName} (${index.columns.join(', ')});\n`;
  }

  return sql;
}

// 전체 SQL 덤프 생성
let fullSQL = `-- Supabase Complete Schema Dump
-- Generated: ${new Date().toISOString()}
-- Project: bpvfkkrlyrjkwgwmfrci
-- Database: postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

`;

// 테이블 순서 (FK 의존성 고려)
const tableOrder = [
  'users',
  'seller_profiles',
  'categories',
  'services',
  'favorites',
  'orders',
  'reviews',
  'conversations',
  'messages',
  'payments',
];

for (const tableName of tableOrder) {
  if (schema[tableName]) {
    fullSQL += generateCreateTableSQL(tableName, schema[tableName]);
  }
}

// 저장
fs.writeFileSync('supabase_complete_schema.sql', fullSQL);
console.log('✅ Complete schema dump generated: supabase_complete_schema.sql');
console.log(`Total tables: ${tableOrder.length}`);
