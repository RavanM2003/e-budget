import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as operationsService from '../services/operationsService';
import * as categoriesService from '../services/categoriesService';
import * as goalsService from '../services/goalsService';
import * as metaService from '../services/metaService';

const DataContext = createContext();

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};
const toSlug = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, '_');

const assignTypeNature = (list) => {
  let hasIncome = false;
  let hasExpense = false;
  const normalized = list.map((type) => {
    const slug = type.slug || toSlug(type.name);
    let nature = null;
    if (slug.includes('income')) {
      nature = 'income';
      hasIncome = true;
    } else if (slug.includes('expense')) {
      nature = 'expense';
      hasExpense = true;
    }
    return { ...type, slug, nature };
  });
  if (!hasIncome || !hasExpense) {
    const ordered = [...normalized].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    ordered.forEach((type) => {
      const target = normalized.find((item) => item.id === type.id);
      if (!target.nature) {
        if (!hasIncome) {
          target.nature = 'income';
          hasIncome = true;
        } else if (!hasExpense) {
          target.nature = 'expense';
          hasExpense = true;
        } else {
          target.nature = 'expense';
        }
      }
    });
  }
  return normalized;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [rawGoals, setRawGoals] = useState([]);
  const [rawTypes, setRawTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const types = useMemo(() => assignTypeNature(rawTypes), [rawTypes]);
  const typeById = useMemo(() => types.reduce((acc, type) => ({ ...acc, [type.id]: type }), {}), [types]);
  const typeIdBySlug = useMemo(() => types.reduce((acc, type) => ({ ...acc, [type.slug]: type.id }), {}), [types]);
  const typeNatureById = useMemo(
    () =>
      types.reduce((acc, type) => {
        acc[type.id] = type.nature || (type.slug === 'income' ? 'income' : type.slug === 'expense' ? 'expense' : 'expense');
        return acc;
      }, {}),
    [types]
  );

  const statusById = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status.id]: status }), {}), [statuses]);
  const statusIdBySlug = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status.slug]: status.id }), {}), [statuses]);

  const categories = useMemo(
    () =>
      rawCategories.map((category) => ({
        id: category.id,
        name: category.name,
        typeId: category.type_id,
        type: typeById[category.type_id]?.slug || 'expense',
        color: category.color_code || '#94a3b8',
        color_code: category.color_code,
        created_at: category.created_at
      })),
    [rawCategories, typeById]
  );

  const categoryById = useMemo(() => {
    const lookup = {};
    categories.forEach((category) => {
      lookup[category.id] = category;
    });
    return lookup;
  }, [categories]);

  const goals = useMemo(
    () =>
      rawGoals.map((goal) => ({
        id: goal.id,
        title: goal.name,
        target: toNumber(goal.full_money),
        saved: toNumber(goal.collected),
        due: goal.deadline || '',
        created_at: goal.created_at
      })),
    [rawGoals]
  );

  const transactions = useMemo(
    () =>
      rawTransactions.map((operation) => {
        const category = operation.category_id ? categoryById[operation.category_id] : null;
        const type = typeById[operation.type_id];
        const status = operation.status_id ? statusById[operation.status_id] : null;
        return {
          id: operation.id,
          title: operation.name,
          amount: toNumber(operation.money),
          date: operation.date,
          categoryId: operation.category_id || '',
          category: category?.name || null,
          typeId: operation.type_id,
          type: typeNatureById[operation.type_id] || (type?.slug === 'income' ? 'income' : 'expense'),
          typeKey: type?.slug || '',
          statusId: operation.status_id || null,
          status: status?.slug || null,
          created_at: operation.created_at
        };
      }),
    [rawTransactions, categoryById, typeById, typeNatureById, statusById]
  );

  const requireUser = useCallback(() => {
    if (!user) {
      throw new Error('You must be logged in');
    }
    return user.id;
  }, [user]);

  const resolveTypeId = useCallback(
    (value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'number') return value;
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber)) {
        return asNumber;
      }
      return typeIdBySlug[toSlug(value)] || null;
    },
    [typeIdBySlug]
  );

  const resolveStatusId = useCallback(
    (value) => {
      if (value === undefined || value === null || value === '') return null;
      if (typeof value === 'number') return value;
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber)) {
        return asNumber;
      }
      return statusIdBySlug[toSlug(value)] || null;
    },
    [statusIdBySlug]
  );

  const loadData = useCallback(async () => {
    if (!user) {
      setRawTransactions([]);
      setRawCategories([]);
      setRawGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [fetchedTypes, fetchedStatuses] = await Promise.all([metaService.getTypes(), metaService.getStatuses()]);
      setRawTypes(fetchedTypes);
      setStatuses(fetchedStatuses);
      const [categoriesData, operationsData, goalsData] = await Promise.all([
        categoriesService.getCategories(user.id),
        operationsService.getOperations(user.id),
        goalsService.getGoals(user.id)
      ]);
      setRawCategories(categoriesData);
      setRawTransactions(operationsData);
      setRawGoals(goalsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const saveTransaction = useCallback(
    async (payload) => {
      const userId = requireUser();
      const typeId = resolveTypeId(payload.type ?? payload.typeId);
      if (!typeId) {
        throw new Error('Operation type is required');
      }
      const statusId = resolveStatusId(payload.status ?? payload.statusId);
      const request = {
        name: (payload.title || '').trim(),
        money: toNumber(payload.amount),
        date: payload.date,
        category_id: payload.categoryId || null,
        type_id: typeId,
        status_id: statusId
      };
      if (!request.name || !request.date) {
        throw new Error('Title and date are required');
      }
      const result = payload.id
        ? await operationsService.updateOperation(userId, payload.id, request)
        : await operationsService.createOperation(userId, request);
      if (!result) return null;
      setRawTransactions((prev) => {
        if (payload.id) {
          return prev.map((item) => (item.id === result.id ? result : item));
        }
        return [result, ...prev];
      });
      return result;
    },
    [requireUser, resolveTypeId, resolveStatusId]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      const userId = requireUser();
      await operationsService.deleteOperation(userId, id);
      setRawTransactions((prev) => prev.filter((item) => item.id !== id));
    },
    [requireUser]
  );

  const saveCategory = useCallback(
    async (payload) => {
      const userId = requireUser();
      const typeId = resolveTypeId(payload.type ?? payload.typeId);
      if (!typeId) {
        throw new Error('Category type is required');
      }
      const request = {
        name: (payload.name || '').trim(),
        type_id: typeId,
        color_code: payload.color || payload.color_code || null
      };
      if (!request.name) {
        throw new Error('Category name is required');
      }
      const result = payload.id
        ? await categoriesService.updateCategory(userId, payload.id, request)
        : await categoriesService.createCategory(userId, request);
      if (!result) return null;
      setRawCategories((prev) => {
        if (payload.id) {
          return prev.map((item) => (item.id === result.id ? result : item));
        }
        return [result, ...prev];
      });
      return result;
    },
    [requireUser, resolveTypeId]
  );

  const deleteCategory = useCallback(
    async (id) => {
      const userId = requireUser();
      await categoriesService.deleteCategory(userId, id);
      setRawCategories((prev) => prev.filter((item) => item.id !== id));
    },
    [requireUser]
  );

  const saveGoal = useCallback(
    async (payload) => {
      const userId = requireUser();
      const request = {
        name: (payload.title || payload.name || '').trim(),
        full_money: toNumber(payload.target ?? payload.full_money),
        collected: toNumber(payload.saved ?? payload.collected),
        deadline: payload.due || payload.deadline || null
      };
      if (!request.name) {
        throw new Error('Goal name is required');
      }
      const result = payload.id
        ? await goalsService.updateGoal(userId, payload.id, request)
        : await goalsService.createGoal(userId, request);
      if (!result) return null;
      setRawGoals((prev) => {
        if (payload.id) {
          return prev.map((item) => (item.id === result.id ? result : item));
        }
        return [result, ...prev];
      });
      return result;
    },
    [requireUser]
  );

  const deleteGoal = useCallback(
    async (id) => {
      const userId = requireUser();
      await goalsService.deleteGoal(userId, id);
      setRawGoals((prev) => prev.filter((item) => item.id !== id));
    },
    [requireUser]
  );

  const value = useMemo(
    () => ({
      transactions,
      categories,
      goals,
      types,
      statuses,
      loading,
      error,
      refresh,
      saveTransaction,
      deleteTransaction,
      saveCategory,
      deleteCategory,
      saveGoal,
      deleteGoal
    }),
    [transactions, categories, goals, types, statuses, loading, error, refresh, saveTransaction, deleteTransaction, saveCategory, deleteCategory, saveGoal, deleteGoal]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
