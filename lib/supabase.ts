
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejlgxhqsfcnnbhryrrab.supabase.co';
const supabaseKey = 'sb_publishable_u1lvWmOeI0J2asede_jLHQ_HGqzPobm';

export const supabase = createClient(supabaseUrl, supabaseKey);
