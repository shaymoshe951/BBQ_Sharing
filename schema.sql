-- Items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table: which family is bringing which item
CREATE TABLE IF NOT EXISTS assignments (
  item_name TEXT PRIMARY KEY,
  family_name TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default items (only if table is empty)
INSERT INTO items (name, category, sort_order) VALUES
  ('כוסות',           'חד פעמי',   1),
  ('צלחות',           'חד פעמי',   2),
  ('סכום',            'חד פעמי',   3),
  ('מפות שולחן',      'חד פעמי',   4),
  ('בשרים',           'אוכל',      1),
  ('פיתות',           'אוכל',      2),
  ('סלטים',           'אוכל',      3),
  ('ציפס',            'אוכל',      4),
  ('חומוס',           'אוכל',      5),
  ('בצל',             'אוכל',      6),
  ('זיתים',           'אוכל',      7),
  ('קינוח לילדים',    'אוכל',      8),
  ('מרשמלו',          'אוכל',      9),
  ('שמן',             'תבלינים',   1),
  ('מלח',             'תבלינים',   2),
  ('תבלינים',         'תבלינים',   3),
  ('קטשופ',           'תבלינים',   4),
  ('שתייה',           'שתייה',     1),
  ('מנגל',            'ציוד',      1),
  ('פחמים',           'ציוד',      2),
  ('מבעירים',         'ציוד',      3),
  ('גזייה לציפס',     'ציוד',      4),
  ('שולחנות',         'ריהוט',     1),
  ('כיסאות',          'ריהוט',     2)
ON CONFLICT (name) DO NOTHING;
