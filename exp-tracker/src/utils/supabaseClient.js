import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://syjmvcafiimslaqrlhfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5am12Y2FmaWltc2xhcXJsaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjAyNTIsImV4cCI6MjA2NDg5NjI1Mn0.ULGE7jnGHsJ6z8ftxH-L7sM--5TR8h0cTjgLrwc3pGs';

export const supabase = createClient(supabaseUrl, supabaseKey);