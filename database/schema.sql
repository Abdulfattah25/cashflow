-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT DEFAULT '#6c757d',
    icon TEXT DEFAULT 'bi-circle',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, type)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    notes TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_types table (NEW)
CREATE TABLE IF NOT EXISTS public.expense_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'bi-circle',
    color TEXT DEFAULT '#6c757d',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create expense_items table (NEW)
CREATE TABLE IF NOT EXISTS public.expense_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_type_id UUID REFERENCES public.expense_types(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(expense_type_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Expense Types policies (NEW)
CREATE POLICY "Users can view own expense types" ON public.expense_types
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expense types" ON public.expense_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expense types" ON public.expense_types
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expense types" ON public.expense_types
    FOR DELETE USING (auth.uid() = user_id);

-- Expense Items policies (NEW)
CREATE POLICY "Users can view own expense items" ON public.expense_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.expense_types 
            WHERE expense_types.id = expense_items.expense_type_id 
            AND expense_types.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own expense items" ON public.expense_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.expense_types 
            WHERE expense_types.id = expense_items.expense_type_id 
            AND expense_types.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own expense items" ON public.expense_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.expense_types 
            WHERE expense_types.id = expense_items.expense_type_id 
            AND expense_types.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own expense items" ON public.expense_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.expense_types 
            WHERE expense_types.id = expense_items.expense_type_id 
            AND expense_types.user_id = auth.uid()
        )
    );

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.expense_types
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.expense_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- License system
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_status') THEN
    CREATE TYPE public.license_status AS ENUM ('valid','used','revoked','expired');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status public.license_status NOT NULL DEFAULT 'valid',
  assigned_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_created ON public.licenses(created_at DESC);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO public;

DROP POLICY IF EXISTS "licenses admin read" ON public.licenses;
CREATE POLICY "licenses admin read" ON public.licenses
  FOR SELECT
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "licenses admin write" ON public.licenses;
CREATE POLICY "licenses admin write" ON public.licenses
  FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE OR REPLACE FUNCTION public.validate_license(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c INT;
BEGIN
  SELECT COUNT(*) INTO c
  FROM public.licenses
  WHERE code = UPPER(p_code) AND status = 'valid';
  RETURN c > 0;
END
$$;

GRANT EXECUTE ON FUNCTION public.validate_license(TEXT) TO public;

CREATE OR REPLACE FUNCTION public.use_license(p_code TEXT, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE public.licenses
     SET status = 'used',
         assigned_email = p_email,
         used_at = NOW()
   WHERE code = UPPER(p_code)
     AND status = 'valid';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END
$$;

GRANT EXECUTE ON FUNCTION public.use_license(TEXT, TEXT) TO public;

CREATE OR REPLACE FUNCTION public.admin_generate_license()
RETURNS public.licenses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  rec public.licenses;
  random_uuid TEXT;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Only admins can generate licenses';
  END IF; 

  LOOP
    random_uuid := REPLACE(gen_random_uuid()::TEXT, '-', '');
    new_code := UPPER(SUBSTR(random_uuid, 1, 6));

    BEGIN
      INSERT INTO public.licenses(code, status)
      VALUES (new_code, 'valid')
      RETURNING * INTO rec;
      RETURN rec;
    EXCEPTION
      WHEN unique_violation THEN
        CONTINUE;
    END;
  END LOOP;

  RETURN rec;
END
$$;

GRANT EXECUTE ON FUNCTION public.admin_generate_license() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
END
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.licenses TO authenticated;
