export interface FilterListComponent<T> {
  collection: T[];
  filteredCollection: T[];
  isFiltering: boolean;
  filterCollection: (q?: string) => void;
}
