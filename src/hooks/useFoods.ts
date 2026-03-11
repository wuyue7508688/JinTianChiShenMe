import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Food, Filters, SortConfig, SortField, SortOrder } from '@/types/food';

const STORAGE_KEY = 'shidmie_foods_data';

// Generate unique ID
const generateId = () => `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default foods data
const defaultFoods: Omit<Food, 'id'>[] = [
  { name: "红烧茄子", desc: "下饭神器，米饭杀手", time: "正餐", taste: "重口味", cuisine: "中式", isCustom: false },
  { name: "宫保鸡丁", desc: "鸡肉嫩滑，花生酥脆", time: "正餐", taste: "辣", cuisine: "中式", isCustom: false },
  { name: "麻婆豆腐", desc: "麻辣鲜香，豆腐嫩滑", time: "正餐", taste: "辣", cuisine: "中式", isCustom: false },
  { name: "番茄炒蛋", desc: "酸甜开胃，家常味道", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "糖醋里脊", desc: "外酥里嫩，酸甜可口", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "鱼香肉丝", desc: "咸甜酸辣，五味俱全", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "回锅肉", desc: "肥而不腻，香辣下饭", time: "正餐", taste: "重口味", cuisine: "中式", isCustom: false },
  { name: "酸菜鱼", desc: "鱼肉鲜嫩，酸菜爽口", time: "正餐", taste: "辣", cuisine: "中式", isCustom: false },
  { name: "小炒肉", desc: "青椒肉片，香辣下饭", time: "正餐", taste: "辣", cuisine: "中式", isCustom: false },
  { name: "蒸蛋羹", desc: "嫩滑如豆腐，入口即化", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "白切鸡", desc: "皮爽肉嫩，原汁原味", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "猪脚饭", desc: "软糯入味，胶原蛋白满满", time: "正餐", taste: "重口味", cuisine: "中式", isCustom: false },
  { name: "煲仔饭", desc: "锅巴香脆，腊味飘香", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "云吞面", desc: "皮薄馅大，汤鲜味美", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "肠粉", desc: "滑嫩爽口，酱汁香浓", time: "早餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "兰州拉面", desc: "汤鲜味美，面条劲道", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "黄焖鸡米饭", desc: "鸡肉嫩滑，汤汁浓郁", time: "正餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "包子", desc: "皮薄馅大，汁水丰富", time: "早餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "煎饼果子", desc: "酥脆可口，早餐首选", time: "早餐", taste: "适中", cuisine: "中式", isCustom: false },
  { name: "肉夹馍", desc: "馍酥肉香，一口满足", time: "正餐", taste: "重口味", cuisine: "中式", isCustom: false },
  { name: "牛排", desc: "外焦里嫩，肉汁丰富", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "意大利面", desc: "面条劲道，酱汁浓郁", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "披萨", desc: "芝士拉丝，配料丰富", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "汉堡", desc: "肉饼多汁，层层满足", time: "正餐", taste: "重口味", cuisine: "西式", isCustom: false },
  { name: "三明治", desc: "清爽健康，层次丰富", time: "早餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "凯撒沙拉", desc: "清爽解腻，健康轻食", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "炸鱼薯条", desc: "外酥里嫩，经典搭配", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "奶油蘑菇汤", desc: "浓郁香滑，暖胃首选", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "烤鸡", desc: "皮脆肉嫩，香气四溢", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "肉酱千层面", desc: "层层芝士，浓郁满足", time: "正餐", taste: "重口味", cuisine: "西式", isCustom: false },
  { name: "麦当劳", desc: "经典快餐，快乐源泉", time: "正餐", taste: "重口味", cuisine: "西式", isCustom: false },
  { name: "肯德基", desc: "炸鸡薯条，罪恶美味", time: "正餐", taste: "重口味", cuisine: "西式", isCustom: false },
  { name: "必胜客", desc: "披萨意面，聚会首选", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "赛百味", desc: "新鲜现做，健康选择", time: "正餐", taste: "适中", cuisine: "西式", isCustom: false },
  { name: "寿司", desc: "新鲜食材，一口满足", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "拉面", desc: "汤头浓郁，面条劲道", time: "正餐", taste: "重口味", cuisine: "日韩", isCustom: false },
  { name: "石锅拌饭", desc: "锅巴香脆，配料丰富", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "日式咖喱饭", desc: "咖喱浓郁，米饭香甜", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "天妇罗", desc: "轻薄酥脆，保留原味", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "泡菜汤", desc: "酸辣开胃，暖胃暖心", time: "正餐", taste: "辣", cuisine: "日韩", isCustom: false },
  { name: "烤鳗鱼饭", desc: "鳗鱼肥美，酱汁香甜", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "冷面", desc: "冰凉爽口，夏日首选", time: "正餐", taste: "适中", cuisine: "日韩", isCustom: false },
  { name: "冬阴功汤", desc: "酸辣鲜香，开胃神器", time: "正餐", taste: "辣", cuisine: "东南亚", isCustom: false },
  { name: "泰式炒河粉", desc: "酸甜适口，花生香脆", time: "正餐", taste: "适中", cuisine: "东南亚", isCustom: false },
  { name: "海南鸡饭", desc: "鸡肉嫩滑，米饭油香", time: "正餐", taste: "适中", cuisine: "东南亚", isCustom: false },
  { name: "越南河粉", desc: "汤清味鲜，牛肉嫩滑", time: "正餐", taste: "适中", cuisine: "东南亚", isCustom: false },
  { name: "咖喱叻沙", desc: "椰香浓郁，香辣过瘾", time: "正餐", taste: "辣", cuisine: "东南亚", isCustom: false },
  { name: "沙爹串", desc: "肉香四溢，花生酱香", time: "正餐", taste: "适中", cuisine: "东南亚", isCustom: false },
  { name: "芒果糯米饭", desc: "甜糯香浓，椰浆浓郁", time: "正餐", taste: "适中", cuisine: "东南亚", isCustom: false },
  { name: "炸鸡", desc: "外酥里嫩，酱汁诱人", time: "宵夜", taste: "重口味", cuisine: "", isCustom: false },
  { name: "烧烤", desc: "炭火香气，啤酒绝配", time: "宵夜", taste: "重口味", cuisine: "", isCustom: false },
  { name: "麻辣烫", desc: "自选食材，麻辣过瘾", time: "宵夜", taste: "辣", cuisine: "", isCustom: false },
];

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filters, setFilters] = useState<Filters>({
    time: '全部',
    taste: '全部',
    cuisine: '全部'
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'time',
    order: 'default'
  });
  const [loading, setLoading] = useState(true);

  // Load foods from localStorage or use defaults
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFoods(parsed);
        setLoading(false);
        return;
      } catch {
        console.error('Failed to parse stored foods');
      }
    }
    
    // Initialize with default foods
    const foodsWithIds = defaultFoods.map(f => ({
      ...f,
      id: generateId(),
      image: `/food_images/${f.name}.png`,
      isBlocked: false
    }));
    setFoods(foodsWithIds);
    setLoading(false);
  }, []);

  // Save to localStorage whenever foods change
  useEffect(() => {
    if (foods.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
    }
  }, [foods]);

  // Get available foods (not blocked)
  const availableFoods = useMemo(() => {
    return foods.filter(f => !f.isBlocked);
  }, [foods]);

  // Filter foods for draw
  const filteredFoods = useMemo(() => {
    return availableFoods.filter(food => {
      const timeMatch = filters.time === '全部' || food.time === filters.time;
      const tasteMatch = filters.taste === '全部' || food.taste === filters.taste;
      let cuisineMatch = true;
      if (filters.time !== '宵夜') {
        cuisineMatch = filters.cuisine === '全部' || food.cuisine === filters.cuisine;
      }
      return timeMatch && tasteMatch && cuisineMatch;
    });
  }, [availableFoods, filters]);

  // Sort foods for library display
  const sortedFoods = useMemo(() => {
    const orderMap: Record<string, number> = {
      '早餐': 1, '正餐': 2, '宵夜': 3,
      '适中': 1, '重口味': 2, '辣': 3,
      '中式': 1, '西式': 2, '日韩': 3, '东南亚': 4, '': 5
    };

    return [...foods].sort((a, b) => {
      if (sortConfig.order === 'default') return 0;
      
      const aVal = orderMap[a[sortConfig.field]] || 0;
      const bVal = orderMap[b[sortConfig.field]] || 0;
      
      return sortConfig.order === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [foods, sortConfig]);

  const getRandomFood = useCallback(() => {
    if (filteredFoods.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredFoods.length);
    return filteredFoods[randomIndex];
  }, [filteredFoods]);

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'time' && value === '宵夜') {
        newFilters.cuisine = '全部';
      }
      return newFilters;
    });
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, order: 'asc' };
      }
      // Cycle: default -> asc -> desc -> default
      const orderCycle: Record<SortOrder, SortOrder> = {
        'default': 'asc',
        'asc': 'desc',
        'desc': 'default'
      };
      return { field, order: orderCycle[prev.order] };
    });
  }, []);

  const addFood = useCallback((food: Omit<Food, 'id' | 'isBlocked' | 'isCustom'>) => {
    const newFood: Food = {
      ...food,
      id: generateId(),
      isBlocked: false,
      isCustom: true
    };
    setFoods(prev => [...prev, newFood]);
    return newFood;
  }, []);

  const updateFood = useCallback((id: string, updates: Partial<Food>) => {
    setFoods(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  }, []);

  const deleteFood = useCallback((id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  }, []);

  const toggleBlock = useCallback((id: string) => {
    setFoods(prev => prev.map(f => 
      f.id === id ? { ...f, isBlocked: !f.isBlocked } : f
    ));
  }, []);

  return {
    foods,
    availableFoods,
    sortedFoods,
    filters,
    sortConfig,
    filteredFoods,
    loading,
    getRandomFood,
    updateFilter,
    toggleSort,
    addFood,
    updateFood,
    deleteFood,
    toggleBlock
  };
}
