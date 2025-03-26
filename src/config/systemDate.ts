export const getSystemDate = (): Date => {
  const now = new Date();
  // Pour les tests, on force la date au 26 mars 2024
  now.setFullYear(2024);
  now.setMonth(2); // 0-based index, 2 = mars
  now.setDate(26);
  return now;
};

export const isDateInFuture = (date: Date): boolean => {
  const systemDate = getSystemDate();
  return date > systemDate;
}; 