import { supabase } from '../lib/supabaseClient';

const baseSelect = 'id,name,money,date,category_id,type_id,status_id,created_at';

export const getOperations = async (userId, filters = {}) => {
  let query = supabase.from('operations').select(baseSelect).eq('user_id', userId).order('date', { ascending: false }).order('created_at', { ascending: false });

  if (filters.fromDate) {
    query = query.gte('date', filters.fromDate);
  }
  if (filters.toDate) {
    query = query.lte('date', filters.toDate);
  }
  if (filters.typeId) {
    query = query.eq('type_id', filters.typeId);
  }
  if (filters.statusId) {
    query = query.eq('status_id', filters.statusId);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    throw new Error('Unable to load operations');
  }
  return data || [];
};

export const createOperation = async (userId, payload) => {
  const insertPayload = {
    user_id: userId,
    name: payload.name,
    money: payload.money,
    date: payload.date,
    category_id: payload.category_id || null,
    type_id: payload.type_id,
    status_id: payload.status_id || null
  };

  const { data, error } = await supabase.from('operations').insert(insertPayload).select(baseSelect).single();
  if (error) {
    console.error(error);
    throw new Error('Unable to create operation');
  }
  return data;
};

export const updateOperation = async (userId, operationId, patch) => {
  const { data, error } = await supabase
    .from('operations')
    .update({ ...patch })
    .eq('user_id', userId)
    .eq('id', operationId)
    .select(baseSelect)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error('Unable to update operation');
  }
  return data;
};

export const deleteOperation = async (userId, operationId) => {
  const { error } = await supabase.from('operations').delete().eq('user_id', userId).eq('id', operationId);
  if (error) {
    console.error(error);
    throw new Error('Unable to delete operation');
  }
};
