-- GameStore TN — Cloudflare D1 schema
-- Apply locally:  npm run db:schema:local
-- Apply remote:   npx wrangler d1 execute gamestore_db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    category_id TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'TND',
    description_ar TEXT,
    description_fr TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    status TEXT CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD')) DEFAULT 'AVAILABLE',
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
