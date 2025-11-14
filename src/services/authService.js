import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'eb_current_user';

const sanitizeUser = (user) => (user ? { id: user.id, email: user.email, created_at: user.created_at } : null);

const persistUser = (user) => {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

export const logout = () => {
  persistUser(null);
};

export const register = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Email and password are required');
  }

  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingError) {
    console.error(existingError);
    throw new Error('Unable to verify email');
  }

  if (existing) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email: normalizedEmail, password: passwordHash })
    .select('id,email,created_at')
    .single();

  if (error) {
    console.error(error);
    throw new Error('Unable to register user');
  }

  const user = sanitizeUser(data);
  persistUser(user);
  return user;
};

export const login = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase
    .from('users')
    .select('id,email,password,created_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error('Unable to login right now');
  }

  if (!data) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, data.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const user = sanitizeUser(data);
  persistUser(user);
  return user;
};

export const forgotPassword = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  return { message: 'Password reset is not available yet. Please contact support.' };
};
