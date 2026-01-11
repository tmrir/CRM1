import { createClient } from '@supabase/supabase-js';

// بيانات قاعدة البيانات الجديدة
const supabaseUrl = 'https://spoceoewsaygajjoviip.supabase.co';
const supabaseAnonKey = 'sb_publishable_yn10ajMhBgi2cOnX2x6kfA_KZFYYJLa';

// بيانات الاتصال المباشر بقاعدة البيانات
export const POSTGRES_URL = 'postgresql://postgres:[YOUR-PASSWORD]@db.spoceoewsaygajjoviip.supabase.co:5432/postgres';
export const POSTGRES_HOST = 'db.spoceoewsaygajjoviip.supabase.co';
export const POSTGRES_USER = 'postgres';
export const POSTGRES_DATABASE = 'postgres';
export const SUPABASE_JWT_SECRET = 'nJ6wDUNn0otAkL86hfudDGBZfgEw0jEPIT5tiiz7qzva5ZIG4x/GrGn484Zkhktcgz5CAFwMDcUgcGeZIwttCQ==';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
