export interface Food {
  id: string;
  name: string;
  desc: string;
  time: '早餐' | '正餐' | '宵夜';
  taste: '适中' | '重口味' | '辣';
  cuisine: '中式' | '西式' | '日韩' | '东南亚' | '';
  image?: string;
  isBlocked?: boolean;
  isCustom?: boolean;
}

export type TimeFilter = '全部' | '早餐' | '正餐' | '宵夜';
export type TasteFilter = '全部' | '适中' | '重口味' | '辣';
export type CuisineFilter = '全部' | '中式' | '西式' | '日韩' | '东南亚';

export interface Filters {
  time: TimeFilter;
  taste: TasteFilter;
  cuisine: CuisineFilter;
}

export type SortField = 'time' | 'taste' | 'cuisine';
export type SortOrder = 'default' | 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
