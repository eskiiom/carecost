export const getSystemDate = (): Date => {
  return new Date();
};

export const isDateInFuture = (date: Date): boolean => {
  const systemDate = new Date();
  // On compare seulement les dates (pas l'heure)
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const systemDateWithoutTime = new Date(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate());
  return dateWithoutTime > systemDateWithoutTime;
}; 