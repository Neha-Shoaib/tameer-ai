-- Create projects table for storing user estimates
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL, -- Anonymous UUID from localStorage
    title TEXT NOT NULL,
    requirements JSONB NOT NULL,
    estimate JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create material rates table for the pricing agent
CREATE TABLE material_rates (
    material_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    rate_pkr NUMERIC NOT NULL,
    city TEXT NOT NULL,
    source TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_rates ENABLE ROW LEVEL SECURITY;

-- Permissive MVP Policies (NOTE: Tighten these before production)
CREATE POLICY "Allow anonymous select on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete on projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select on material_rates" ON material_rates FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update on material_rates" ON material_rates FOR UPDATE USING (true);

-- Seed Initial Material Rates (Karachi, Indicative Rates 2024)
INSERT INTO material_rates (material_key, name, unit, rate_pkr, city, source) VALUES
('cement', 'Cement (OPC)', 'bags', 1250, 'Karachi', 'Market Average'),
('steel', 'Steel (Grade-60)', 'kg', 260, 'Karachi', 'Market Average'),
('bricks', 'Awal Bricks', 'pieces', 16, 'Karachi', 'Market Average'),
('sand', 'Sand (Ravi/Chenab)', 'cft', 45, 'Karachi', 'Market Average'),
('crush', 'Crush (Margalla)', 'cft', 110, 'Karachi', 'Market Average'),
('tiles', 'Floor & Wall Tiles', 'sq_ft', 180, 'Karachi', 'Market Average'),
('paint', 'Paint & Primer', 'liters', 800, 'Karachi', 'Market Average'),
('doors', 'Wooden Doors & Frames', 'unit', 25000, 'Karachi', 'Market Average'),
('windows', 'Aluminum Windows', 'unit', 18000, 'Karachi', 'Market Average'),
('electrical', 'Electrical Wires & Switches', 'points', 2500, 'Karachi', 'Market Average'),
('plumbing', 'Plumbing Pipes & Fixtures', 'points', 15000, 'Karachi', 'Market Average'),
('labor_grey', 'Contractor Labor (Grey)', 'sq_ft', 450, 'Karachi', 'Market Average'),
('labor_finishing', 'Contractor Labor (Finishing)', 'sq_ft', 350, 'Karachi', 'Market Average')
ON CONFLICT (material_key) DO UPDATE SET rate_pkr = EXCLUDED.rate_pkr;
