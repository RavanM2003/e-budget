import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultState = {
  transactions: [],
  categories: [],
  budgets: [],
  goals: []
};

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useLocalStorage('eb:data', defaultState);

  const updateCollection = (key, updater) => {
    setData((prev) => ({
      ...prev,
      [key]: ensureArray(updater(prev[key] || []))
    }));
  };

  const saveItem = (key, payload) => {
    const withId = payload.id ? payload : { ...payload, id: createId() };
    updateCollection(key, (list) => {
      const exists = list.some((item) => item.id === withId.id);
      return exists ? list.map((item) => (item.id === withId.id ? withId : item)) : [withId, ...list];
    });
    return withId;
  };

  const deleteItem = (key, id) => {
    updateCollection(key, (list) => list.filter((item) => item.id !== id));
  };

  const value = useMemo(() => ({
    ...data,
    saveTransaction: (transaction) => saveItem('transactions', transaction),
    deleteTransaction: (id) => deleteItem('transactions', id),
    saveCategory: (category) => saveItem('categories', category),
    deleteCategory: (id) => deleteItem('categories', id),
    saveBudget: (budget) => saveItem('budgets', budget),
    deleteBudget: (id) => deleteItem('budgets', id),
    saveGoal: (goal) => saveItem('goals', goal),
    deleteGoal: (id) => deleteItem('goals', id)
  }), [data]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
