import { useState, useRef, useCallback } from 'react';
import { useFoods } from '@/hooks/useFoods';
import { FoodLibrary } from '@/components/FoodLibrary';
import type { Food, TimeFilter, TasteFilter, CuisineFilter } from '@/types/food';
import './App.css';

const timeOptions: TimeFilter[] = ['全部', '早餐', '正餐', '宵夜'];
const tasteOptions: TasteFilter[] = ['全部', '适中', '重口味', '辣'];
const cuisineOptions: CuisineFilter[] = ['全部', '中式', '西式', '日韩', '东南亚'];

const cuisineColors: Record<string, string> = {
  '中式': '#FF8C42',
  '西式': '#FFD93D',
  '日韩': '#FF9AA2',
  '东南亚': '#A8E6CF',
  '': '#FF8C42'
};

function App() {
  const { 
    foods, 
    sortedFoods,
    filters, 
    sortConfig,
    loading, 
    getRandomFood, 
    updateFilter, 
    toggleSort,
    addFood,
    updateFood,
    deleteFood,
    toggleBlock
  } = useFoods();
  
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessText, setShowSuccessText] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDrawCard = useCallback(() => {
    if (isFlipping || cardVisible || loading) return;
    
    const food = getRandomFood();
    if (food) {
      setIsFlipping(true);
      setCurrentFood(food);
      
      setTimeout(() => {
        setCardVisible(true);
        setIsFlipping(false);
      }, 300);
    }
  }, [getRandomFood, isFlipping, cardVisible, loading]);

  const handleDiscardAndDrawNext = useCallback(() => {
    setCardVisible(false);
    setCardPosition({ x: 0, y: 0 });
    
    setTimeout(() => {
      const food = getRandomFood();
      if (food) {
        setCurrentFood(food);
        setCardVisible(true);
      }
    }, 200);
  }, [getRandomFood]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!cardVisible) return;
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
  }, [cardVisible]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    setCardPosition({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const { x, y } = cardPosition;
    const threshold = 80;

    if (Math.abs(x) > threshold) {
      setCardPosition({ 
        x: x > 0 ? window.innerWidth : -window.innerWidth, 
        y 
      });
      setTimeout(() => {
        handleDiscardAndDrawNext();
      }, 300);
    } else if (y > threshold) {
      setShowConfetti(true);
      setShowSuccessText(true);
      
      setTimeout(() => {
        setShowConfetti(false);
        setShowSuccessText(false);
        setCardVisible(false);
        setCardPosition({ x: 0, y: 0 });
        setCurrentFood(null);
      }, 1000);
    } else {
      setCardPosition({ x: 0, y: 0 });
    }
  }, [isDragging, cardPosition, handleDiscardAndDrawNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => {
    handleDragEnd();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };
  const onMouseUp = () => {
    handleDragEnd();
  };
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: ['#FF8C42', '#FFD93D', '#FF9AA2', '#A8E6CF', '#FF6B6B'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.3
  }));

  const getFoodImageUrl = (foodName: string) => {
    return `/food_images/${foodName}.png`;
  };

  const isSupperMode = filters.time === '宵夜';
  const availableFoods = foods.filter(f => !f.isBlocked);
  const filteredFoods = availableFoods.filter(food => {
    const timeMatch = filters.time === '全部' || food.time === filters.time;
    const tasteMatch = filters.taste === '全部' || food.taste === filters.taste;
    let cuisineMatch = true;
    if (filters.time !== '宵夜') {
      cuisineMatch = filters.cuisine === '全部' || food.cuisine === filters.cuisine;
    }
    return timeMatch && tasteMatch && cuisineMatch;
  });

  if (showLibrary) {
    return (
      <FoodLibrary
        foods={sortedFoods}
        sortConfig={sortConfig}
        onClose={() => setShowLibrary(false)}
        onToggleSort={toggleSort}
        onAddFood={addFood}
        onUpdateFood={updateFood}
        onDeleteFood={deleteFood}
        onToggleBlock={toggleBlock}
      />
    );
  }

  return (
    <div className="app">
      {/* Header with logo, title and food library button */}
      <div className="header">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="main-title">今日食啲乜？</h1>
        <button className="library-entry-btn" onClick={() => setShowLibrary(true)}>
          <img src="/food_library_logo.png" alt="菜单" />
          <span>菜单</span>
        </button>
      </div>

      {/* Instruction text */}
      <div className="instruction-text-top">
        <p>点击抽卡，左右滑扔掉，下滑选择</p>
      </div>

      {/* Main content area */}
      <div className="main-area">
        {/* Card Stack */}
        {!cardVisible && (
          <div 
            className={`card-stack ${isFlipping ? 'flipping' : ''}`}
            onClick={handleDrawCard}
          >
            <img src="/card_stack.png" alt="卡牌堆" />
            <p className="hint-text">点击抽取你想吃的食物</p>
          </div>
        )}

        {/* Food Card */}
        {cardVisible && currentFood && (
          <div
            ref={cardRef}
            className={`food-card ${isDragging ? 'dragging' : ''}`}
            style={{
              transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) rotate(${cardPosition.x * 0.05}deg)`,
              borderColor: cuisineColors[currentFood.cuisine || ''] || '#FF8C42'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {currentFood.cuisine && (
              <div 
                className="cuisine-tag"
                style={{ backgroundColor: cuisineColors[currentFood.cuisine || ''] || '#FF8C42' }}
              >
                {currentFood.cuisine}
              </div>
            )}

            <div className="food-image-container">
              <img 
                src={currentFood.image?.startsWith('data:') ? currentFood.image : getFoodImageUrl(currentFood.name)} 
                alt={currentFood.name}
                className="food-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/food_images/包子.png';
                }}
              />
            </div>

            <div className="food-info">
              <h2 className="food-name">{currentFood.name}</h2>
              <p className="food-desc">{currentFood.desc}</p>
            </div>

            <div className="swipe-hints">
              <span className="hint left">← 不要</span>
              <span className="hint down">↓ 食呢个</span>
              <span className="hint right">不要 →</span>
            </div>
          </div>
        )}

        {/* Confetti effect */}
        {showConfetti && (
          <div className="confetti-container">
            {confettiParticles.map(particle => (
              <div
                key={particle.id}
                className="confetti"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  backgroundColor: particle.color,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Success text */}
        {showSuccessText && (
          <div className="success-text">
            <span>食呢个！</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredFoods.length === 0 && !cardVisible && (
          <div className="empty-state">
            <p>没有符合条件的食物</p>
            <p>试试其他筛选条件吧</p>
          </div>
        )}
      </div>

      {/* Current selection display */}
      <div className="current-selection">
        <p>{filters.time} · {filters.taste} · {isSupperMode ? '不限' : filters.cuisine}</p>
      </div>

      {/* Filter section */}
      <div className="filter-section">
        {/* Time filter */}
        <div className="filter-row">
          <span className="filter-label">时段</span>
          <div className="filter-options">
            {timeOptions.map(option => (
              <button
                key={option}
                className={`filter-btn ${filters.time === option ? 'active' : ''}`}
                onClick={() => updateFilter('time', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Taste filter */}
        <div className="filter-row">
          <span className="filter-label">口味</span>
          <div className="filter-options">
            {tasteOptions.map(option => (
              <button
                key={option}
                className={`filter-btn ${filters.taste === option ? 'active' : ''}`}
                onClick={() => updateFilter('taste', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine filter */}
        {!isSupperMode && (
          <div className="filter-row">
            <span className="filter-label">菜系</span>
            <div className="filter-options">
              {cuisineOptions.map(option => (
                <button
                  key={option}
                  className={`filter-btn ${filters.cuisine === option ? 'active' : ''}`}
                  onClick={() => updateFilter('cuisine', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
