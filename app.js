document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('food-form');
  const foodNameInput = document.getElementById('food-name');
  const foodCaloriesInput = document.getElementById('food-calories');
  const list = document.getElementById('food-list');
  const emptyState = document.getElementById('empty-state');
  const summaryBar = document.getElementById('summary-bar');
  const progressBar = document.getElementById('progress-bar');
  const progressPercentage = document.getElementById('progress-percentage');
  const consumedCalories = document.getElementById('consumed-calories');
  const remainingCalories = document.getElementById('remaining-calories');
  const goalDisplay = document.getElementById('goal-display');
  const dateDisplay = document.getElementById('date-display');
  const foodCount = document.getElementById('food-count');
  const totalSummary = document.getElementById('total-summary');
  const clearDayBtn = document.getElementById('clear-day-btn');
  const goalModal = document.getElementById('goal-modal');
  const goalInput = document.getElementById('goal-input');
  const editGoalBtn = document.getElementById('edit-goal-btn');
  const cancelGoalBtn = document.getElementById('cancel-goal-btn');
  const saveGoalBtn = document.getElementById('save-goal-btn');

  const today = new Date().toISOString().split('T')[0];
  const storageKey = `calorieTracker_${today}`;

  let state = {
    goal: 2000,
    foods: []
  };

  function loadState() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = {
        goal: parsed.goal || 2000,
        foods: parsed.foods || []
      };
    } else {
      const globalGoal = localStorage.getItem('calorieGoal');
      state.goal = globalGoal ? parseInt(globalGoal) : 2000;
      state.foods = [];
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    localStorage.setItem('calorieGoal', state.goal.toString());
  }

  function formatDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function getTotalCalories() {
    return state.foods.reduce((sum, food) => sum + food.calories, 0);
  }

  function updateUI() {
    const total = getTotalCalories();
    const remaining = state.goal - total;
    const percentage = Math.min((total / state.goal) * 100, 100);
    const isOver = total > state.goal;

    consumedCalories.textContent = total;
    remainingCalories.textContent = Math.abs(remaining);
    
    const remainingStat = remainingCalories.closest('.stat');
    if (isOver) {
      remainingStat.classList.add('over');
      remainingCalories.textContent = remaining;
    } else {
      remainingStat.classList.remove('over');
      remainingCalories.textContent = remaining;
    }

    progressBar.style.width = `${percentage}%`;
    if (isOver) {
      progressBar.classList.add('over');
      progressPercentage.classList.add('over');
    } else {
      progressBar.classList.remove('over');
      progressPercentage.classList.remove('over');
    }
    progressPercentage.textContent = `${Math.round(percentage)}%`;

    goalDisplay.textContent = state.goal;
    dateDisplay.textContent = formatDate();

    if (state.foods.length === 0) {
      emptyState.classList.remove('hidden');
      emptyState.classList.remove('hidden');
      list.style.display = 'none';
      summaryBar.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      list.style.display = 'flex';
      summaryBar.classList.remove('hidden');
      foodCount.textContent = `${state.foods.length} item${state.foods.length !== 1 ? 's' : ''}`;
      totalSummary.textContent = `${total} cal`;
    }
  }

  function createFoodElement(food) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = food.id;

    li.innerHTML = `
      <div class="food-info">
        <span class="food-name">${escapeHtml(food.name)}</span>
        <span class="food-time">${formatTime(food.timestamp)}</span>
      </div>
      <span class="food-calories">${food.calories} cal</span>
      <button class="delete-btn" aria-label="Delete food">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
      </button>
    `;

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteFood(food.id, li));

    return li;
  }

  function renderFoods() {
    list.innerHTML = '';
    const sortedFoods = [...state.foods].sort((a, b) => b.timestamp - a.timestamp);
    sortedFoods.forEach(food => {
      list.appendChild(createFoodElement(food));
    });
    updateUI();
  }

  function addFood(name, calories) {
    const food = {
      id: Date.now().toString(),
      name: name.trim(),
      calories: parseInt(calories),
      timestamp: Date.now()
    };

    state.foods.push(food);
    saveState();

    const li = createFoodElement(food);
    list.prepend(li);

    updateUI();
  }

  function deleteFood(id, liElement) {
    liElement.classList.add('removing');

    liElement.addEventListener('animationend', () => {
      state.foods = state.foods.filter(food => food.id !== id);
      saveState();
      liElement.remove();
      updateUI();
    });
  }

  function clearDay() {
    if (state.foods.length === 0) return;
    
    if (confirm('Clear all food entries for today?')) {
      state.foods = [];
      saveState();
      renderFoods();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = foodNameInput.value.trim();
    const calories = foodCaloriesInput.value;

    if (name && calories && parseInt(calories) > 0) {
      addFood(name, calories);
      foodNameInput.value = '';
      foodCaloriesInput.value = '';
      foodNameInput.focus();
    }
  });

  clearDayBtn.addEventListener('click', clearDay);

  editGoalBtn.addEventListener('click', () => {
    goalInput.value = state.goal;
    goalModal.classList.add('active');
    goalInput.focus();
    goalInput.select();
  });

  cancelGoalBtn.addEventListener('click', () => {
    goalModal.classList.remove('active');
  });

  saveGoalBtn.addEventListener('click', () => {
    const newGoal = parseInt(goalInput.value);
    if (newGoal >= 500 && newGoal <= 10000) {
      state.goal = newGoal;
      saveState();
      updateUI();
      goalModal.classList.remove('active');
    } else {
      alert('Please enter a goal between 500 and 10,000 calories.');
    }
  });

  goalModal.addEventListener('click', (e) => {
    if (e.target === goalModal) {
      goalModal.classList.remove('active');
    }
  });

  goalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveGoalBtn.click();
    } else if (e.key === 'Escape') {
      goalModal.classList.remove('active');
    }
  });

  loadState();
  renderFoods();
});
