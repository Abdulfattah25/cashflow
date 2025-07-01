-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    -- Insert default income categories
    INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Salary', 'income', '#28a745', 'bi-cash-coin', true),
    (NEW.id, 'Freelance', 'income', '#17a2b8', 'bi-laptop', true),
    (NEW.id, 'Business', 'income', '#6f42c1', 'bi-briefcase', true),
    (NEW.id, 'Investment', 'income', '#fd7e14', 'bi-graph-up', true),
    (NEW.id, 'Other Income', 'income', '#6c757d', 'bi-plus-circle', true);
    
    -- Insert default expense categories
    INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Food & Dining', 'expense', '#dc3545', 'bi-cart3', true),
    (NEW.id, 'Transportation', 'expense', '#ffc107', 'bi-fuel-pump', true),
    (NEW.id, 'Shopping', 'expense', '#e83e8c', 'bi-bag', true),
    (NEW.id, 'Entertainment', 'expense', '#6f42c1', 'bi-film', true),
    (NEW.id, 'Bills & Utilities', 'expense', '#fd7e14', 'bi-receipt', true),
    (NEW.id, 'Healthcare', 'expense', '#20c997', 'bi-heart-pulse', true),
    (NEW.id, 'Education', 'expense', '#0dcaf0', 'bi-book', true),
    (NEW.id, 'Other Expense', 'expense', '#6c757d', 'bi-circle', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
