import { supabase } from '../lib/supabaseClient';

const baseSelect = 'id,name,type_id,color_code,created_at,user_id';

export const getCategories = async (userId) => {
  const { data, error } = await supabase.from('category').select(baseSelect).eq('user_id', userId).order('name', { ascending: true });
  if (error) {
    console.error(error);
    throw new Error('Unable to load categories');
  }
  return data || [];
};

export const createCategory = async (userId, payload) => {
  const { data, error } = await supabase
    .from('category')
    .insert({
      user_id: userId,
      name: payload.name,
      type_id: payload.type_id,
      color_code: payload.color_code || null
    })
    .select(baseSelect)
    .single();

  if (error) {
    console.error(error);
    throw new Error('Unable to create category');
  }
  return data;
};

export const updateCategory = async (userId, categoryId, patch) => {
  const { data, error } = await supabase
    .from('category')
    .update({ ...patch })
    .eq('user_id', userId)
    .eq('id', categoryId)
    .select(baseSelect)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error('Unable to update category');
  }
  return data;
};

export const deleteCategory = async (userId, categoryId) => {
  const { error } = await supabase.from('category').delete().eq('user_id', userId).eq('id', categoryId);
  if (error) {
    console.error(error);
    throw new Error('Unable to delete category');
  }
};
