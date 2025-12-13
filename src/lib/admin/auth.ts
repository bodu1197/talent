import { createClient } from '@/lib/supabase/server';

export async function checkAdminAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { isAdmin: false, user: null, error: 'Unauthorized' };
  }

  // Check if user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminData) {
    return { isAdmin: false, user, error: 'Not an admin' };
  }

  return { isAdmin: true, user, admin: adminData, error: null };
}

export async function requireAdmin() {
  const result = await checkAdminAuth();

  if (!result.isAdmin) {
    throw new Error(result.error || 'Admin access required');
  }

  return result;
}
