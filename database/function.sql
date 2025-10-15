-- NOTE: column "type" in categories must be either 'income' or 'expense' (see CHECK constraint).
-- Localize ONLY the category names, not the type values.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
        -- Insert profile (ignore conflict if already exists)
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
        ON CONFLICT (id) DO NOTHING;

        -- Default income categories (use 'income')
        INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
        SELECT NEW.id, c.name, 'income', c.color, c.icon, true
        FROM (VALUES
            ('Gajian', '#28a745', 'bi-cash-coin'),
            ('Freelance', '#17a2b8', 'bi-laptop'),
            ('Bisnis', '#6f42c1', 'bi-briefcase'),
            ('Investasi', '#fd7e14', 'bi-graph-up'),
            ('Pemasukan Lainnya', '#6c757d', 'bi-plus-circle')
        ) AS c(name,color,icon)
        ON CONFLICT (user_id, name, type) DO NOTHING;

        -- Default expense categories (use 'expense')
        INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
        SELECT NEW.id, c.name, 'expense', c.color, c.icon, true
        FROM (VALUES
            ('Belanja Makan', '#dc3545', 'bi-cart3'),
            ('Transportasi', '#ffc107', 'bi-fuel-pump'),
            ('Belanja Keinginan', '#e83e8c', 'bi-bag'),
            ('Entertainment', '#6f42c1', 'bi-film'),
            ('Biaya Bulanan', '#fd7e14', 'bi-receipt'),
            ('Biaya Kesehatan', '#20c997', 'bi-heart-pulse'),
            ('Biaya Pendidikan', '#0dcaf0', 'bi-book'),
            ('Pengeluaran Lainnya', '#6c757d', 'bi-circle')
        ) AS c(name,color,icon)
        ON CONFLICT (user_id, name, type) DO NOTHING;

        RETURN NEW;
END;
$$;

-- Recreate trigger safely (drop if exists then create)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
