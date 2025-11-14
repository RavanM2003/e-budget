const delay = (response, ms = 600) => new Promise((resolve) => setTimeout(() => resolve(response), ms));
const safeUUID = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2));

let currentUser = {
  id: 'user-001',
  name: 'Demo User',
  email: 'demo@ebudget.az',
  currency: 'AZN'
};

const generateToken = () => `token-${safeUUID()}`;

export const authService = {
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    currentUser = { ...currentUser, email };
    return delay({ user: currentUser, token: generateToken() });
  },
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }
    currentUser = {
      id: safeUUID(),
      name,
      email,
      currency: 'AZN',
    };
    return delay({ user: currentUser, token: generateToken() }, 850);
  },
  async forgotPassword(email) {
    if (!email) {
      throw new Error('Email is required');
    }
    return delay({ message: 'Reset instructions sent' }, 700);
  },
  logout() {
    return delay(true, 250);
  }
};
