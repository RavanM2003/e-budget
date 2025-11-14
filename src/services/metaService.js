import { supabase } from '../lib/supabaseClient';

const normalize = (value) => value?.toString().trim().toLowerCase().replace(/\s+/g, '_');

export const getTypes = async () => {
  const { data, error } = await supabase.from('type').select('id,name').order('id', { ascending: true });
  if (error) {
    console.error(error);
    throw new Error('Unable to load operation types');
  }
  return (data || []).map((item) => ({ ...item, slug: normalize(item.name) }));
};

export const getStatuses = async () => {
  const { data, error } = await supabase.from('status').select('id,name').order('id', { ascending: true });
  if (error) {
    console.error(error);
    throw new Error('Unable to load statuses');
  }
  return (data || []).map((item) => ({ ...item, slug: normalize(item.name) }));
};
