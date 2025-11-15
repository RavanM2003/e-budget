export const resolveTypeLabel = (type, t) => {
  if (!type) return '';
  const nature = type.nature || (type.slug === 'income' ? 'income' : type.slug === 'expense' ? 'expense' : null);
  if (nature === 'income') {
    return t('transactions.filters.income');
  }
  if (nature === 'expense') {
    return t('transactions.filters.expense');
  }
  return type.name || '';
};
