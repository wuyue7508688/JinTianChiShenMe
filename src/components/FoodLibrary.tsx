import { useState, useRef } from 'react';
import type { Food, SortField } from '@/types/food';

interface FoodLibraryProps {
  foods: Food[];
  sortConfig: { field: SortField; order: 'default' | 'asc' | 'desc' };
  onClose: () => void;
  onToggleSort: (field: SortField) => void;
  onAddFood: (food: Omit<Food, 'id' | 'isBlocked' | 'isCustom'>) => void;
  onUpdateFood: (id: string, updates: Partial<Food>) => void;
  onDeleteFood: (id: string) => void;
  onToggleBlock: (id: string) => void;
}

const timeOptions = ['早餐', '正餐', '宵夜'];
const tasteOptions = ['适中', '重口味', '辣'];
const cuisineOptions = ['中式', '西式', '日韩', '东南亚'];

const cuisineColors: Record<string, string> = {
  '中式': '#FF8C42',
  '西式': '#FFD93D',
  '日韩': '#FF9AA2',
  '东南亚': '#A8E6CF',
  '': '#999'
};

export function FoodLibrary({ 
  foods, 
  sortConfig, 
  onClose, 
  onToggleSort, 
  onAddFood, 
  onUpdateFood, 
  onDeleteFood, 
  onToggleBlock 
}: FoodLibraryProps) {
  const [showTrash, setShowTrash] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    time: string;
    taste: string;
    cuisine: string;
    image: string;
  }>({
    name: '',
    time: '正餐',
    taste: '适中',
    cuisine: '中式',
    image: ''
  });

  const activeFoods = foods.filter(f => !f.isBlocked);
  const blockedFoods = foods.filter(f => f.isBlocked);
  const displayFoods = showTrash ? blockedFoods : activeFoods;

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return '▼';
    if (sortConfig.order === 'default') return '▼';
    return sortConfig.order === 'asc' ? '▲' : '▼';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    if (editingFood) {
      onUpdateFood(editingFood.id, {
        name: formData.name,
        time: formData.time as any,
        taste: formData.taste as any,
        cuisine: formData.cuisine as any,
        image: formData.image || editingFood.image
      });
    } else {
      onAddFood({
        name: formData.name,
        desc: '',
        time: formData.time as any,
        taste: formData.taste as any,
        cuisine: formData.cuisine as any,
        image: formData.image || '/food_images/包子.png'
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', time: '正餐', taste: '适中', cuisine: '中式', image: '' });
    setPreviewImage('');
    setShowAddModal(false);
    setEditingFood(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEditModal = (food: Food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      time: food.time,
      taste: food.taste,
      cuisine: food.cuisine || '中式',
      image: food.image || ''
    });
    setPreviewImage(food.image || '');
    setShowAddModal(true);
  };

  const getFoodImageUrl = (food: Food) => {
    if (food.image?.startsWith('data:')) return food.image;
    return food.image || `/food_images/${food.name}.png`;
  };

  return (
    <div className="food-library">
      {/* Header */}
      <div className="library-header">
        <button 
          className="trash-icon-btn"
          onClick={() => setShowTrash(!showTrash)}
        >
          {showTrash ? '←' : '🗑️'}
        </button>
        
        <div className="sort-texts">
          <span 
            className={`sort-text ${sortConfig.field === 'time' && sortConfig.order !== 'default' ? 'active' : ''}`}
            onClick={() => onToggleSort('time')}
          >
            时段 {getSortIcon('time')}
          </span>
          <span 
            className={`sort-text ${sortConfig.field === 'cuisine' && sortConfig.order !== 'default' ? 'active' : ''}`}
            onClick={() => onToggleSort('cuisine')}
          >
            菜系 {getSortIcon('cuisine')}
          </span>
          <span 
            className={`sort-text ${sortConfig.field === 'taste' && sortConfig.order !== 'default' ? 'active' : ''}`}
            onClick={() => onToggleSort('taste')}
          >
            口味 {getSortIcon('taste')}
          </span>
        </div>
        
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Food Grid */}
      <div className="food-grid">
        {displayFoods.map(food => (
          <div 
            key={food.id} 
            className={`library-card ${food.isCustom ? 'custom' : ''}`}
            onClick={() => !showTrash && openEditModal(food)}
          >
            {/* Cuisine tag */}
            <div 
              className="card-cuisine-tag"
              style={{ backgroundColor: cuisineColors[food.cuisine || ''] || '#999' }}
            >
              {food.cuisine || '宵夜'}
            </div>

            {/* Image */}
            <div className="card-image-container">
              <img 
                src={getFoodImageUrl(food)} 
                alt={food.name}
                className="card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/food_images/包子.png';
                }}
              />
            </div>

            {/* Info */}
            <div className="card-info">
              <h3 className="card-name">{food.name}</h3>
              <p className="card-tags">
                {food.time} · {food.cuisine || '不限'} · {food.taste}
              </p>
            </div>

            {/* Actions */}
            {showTrash ? (
              <button 
                className="action-btn restore"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBlock(food.id);
                }}
              >
                恢复
              </button>
            ) : (
              <div className="card-actions">
                <button 
                  className="action-btn block"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBlock(food.id);
                  }}
                >
                  屏蔽
                </button>
                {food.isCustom && (
                  <button 
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFood(food.id);
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Button */}
      {!showTrash && (
        <button 
          className="add-food-btn"
          onClick={() => setShowAddModal(true)}
        >
          +
        </button>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button className="modal-close-btn" onClick={resetForm}>✕</button>
            
            <h3>{editingFood ? '编辑食物' : '添加食物'}</h3>
            
            {/* Image Upload */}
            <div className="image-upload">
              <div 
                className="image-preview"
                style={{ backgroundImage: previewImage ? `url(${previewImage})` : 'none' }}
                onClick={triggerFileInput}
              >
                {!previewImage && <span>点击上传图片</span>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label>食物名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入食物名称"
              />
            </div>

            {/* Time Select */}
            <div className="form-group">
              <label>时段</label>
              <div className="option-buttons">
                {timeOptions.map(opt => (
                  <button
                    key={opt}
                    className={formData.time === opt ? 'active' : ''}
                    onClick={() => setFormData(prev => ({ ...prev, time: opt }))}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Select */}
            {formData.time !== '宵夜' && (
              <div className="form-group">
                <label>菜系</label>
                <div className="option-buttons">
                  {cuisineOptions.map(opt => (
                    <button
                      key={opt}
                      className={formData.cuisine === opt ? 'active' : ''}
                      onClick={() => setFormData(prev => ({ ...prev, cuisine: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Taste Select */}
            <div className="form-group">
              <label>口味</label>
              <div className="option-buttons">
                {tasteOptions.map(opt => (
                  <button
                    key={opt}
                    className={formData.taste === opt ? 'active' : ''}
                    onClick={() => setFormData(prev => ({ ...prev, taste: opt }))}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={resetForm}>取消</button>
              <button className="btn-confirm" onClick={handleSubmit}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
