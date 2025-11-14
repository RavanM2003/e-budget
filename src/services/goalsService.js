import { supabase } from '../lib/supabaseClient';

const baseSelect = 'id,name,full_money,collected,deadline,user_id,created_at';

export const getGoals = async (userId) => {
  const { data, error } = await supabase.from('goals').select(baseSelect).eq('user_id', userId).order('created_at', { ascending: false });
  if (error) {
    console.error(error);
    throw new Error('Unable to load goals');
  }
  return data || [];
};

export const createGoal = async (userId, payload) => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: payload.name,
      full_money: payload.full_money,
      collected: payload.collected ?? 0,
      deadline: payload.deadline || null
    })
    .select(baseSelect)
    .single();

  if (error) {
    console.error(error);
    throw new Error('Unable to create goal');
  }
  return data;
};

export const updateGoal = async (userId, goalId, patch) => {
  const { data, error } = await supabase
    .from('goals')
    .update({ ...patch })
    .eq('user_id', userId)
    .eq('id', goalId)
    .select(baseSelect)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error('Unable to update goal');
  }
  return data;
};

export const deleteGoal = async (userId, goalId) => {
  const { error } = await supabase.from('goals').delete().eq('user_id', userId).eq('id', goalId);
  if (error) {
    console.error(error);
    throw new Error('Unable to delete goal');
  }
};
