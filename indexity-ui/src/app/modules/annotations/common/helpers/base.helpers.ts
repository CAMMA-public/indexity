export const msToTime = (ms: number): string => {
  return new Date(ms).toISOString().slice(11, -5);
};

export const escapeRegExp = (val: string): string => {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const msToSeconds = (ms: number): number => {
  return ms * 0.001;
};

export const getFormattedTimestamp = (
  ms: number,
  format: 'standard' | 'seconds',
): string => {
  if (format === 'standard') {
    return msToTime(ms);
  } else {
    return msToSeconds(ms).toFixed(0).toString();
  }
};

export const buildFiltersString = (
  ids?: number[],
  searchTerm?: string,
): string => {
  const idsFilter = ids && ids.length ? `id||notin||[${ids}]` : null;
  const searchFilter =
    searchTerm && searchTerm.length
      ? `name||cont||${searchTerm.toLowerCase()}`
      : null;
  const reqFilters = [idsFilter, searchFilter].filter((v) => !!v);
  const filtersString = reqFilters
    .map((f, i) => (i === 0 ? f : `&filter=${f}`))
    .join('');
  return filtersString.length ? filtersString : undefined;
};
