document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const taskCount = document.getElementById('task-count');

  // Load from local storage
  let todos = JSON.parse(localStorage.getItem('todos')) || [];

  // Init
  renderTodos();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    
    if (text) {
      addTodo(text);
      input.value = '';
      input.focus();
    }
  });

  function addTodo(text) {
    const todo = {
      id: Date.now().toString(),
      text,
      completed: false
    };
    
    todos.push(todo);
    saveTodos();
    
    // Animate item entry
    const li = createTodoElement(todo);
    list.prepend(li); // Add to top
    
    updateUI();
  }

  function toggleTodo(id) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    saveTodos();
    updateUI(false); // don't redraw everything, just update state
  }

  function deleteTodo(id, liElement) {
    // Add exit animation
    liElement.classList.add('removing');
    
    liElement.addEventListener('animationend', () => {
      todos = todos.filter(todo => todo.id !== id);
      saveTodos();
      liElement.remove();
      updateUI();
    });
  }

  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Sanitize input
    const span = document.createElement('span');
    span.textContent = todo.text;
    const safeText = span.innerHTML;

    li.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <span class="todo-text">${safeText}</span>
      <button class="delete-btn" aria-label="Delete task">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    `;

    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        li.classList.add('completed');
      } else {
        li.classList.remove('completed');
      }
      toggleTodo(todo.id);
    });

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      deleteTodo(todo.id, li);
    });

    return li;
  }

  function renderTodos() {
    list.innerHTML = '';
    
    // Render in reversed order so newest is at the top
    const reversedTodos = [...todos].reverse();
    
    reversedTodos.forEach(todo => {
      list.appendChild(createTodoElement(todo));
    });
    
    updateUI();
  }

  function updateUI(re_render = false) {
    // Update count
    const pendingTasks = todos.filter(t => !t.completed).length;
    taskCount.textContent = pendingTasks;
    
    if (todos.length === 0) {
      emptyState.classList.remove('hidden');
      list.style.display = 'none';
      taskCount.style.display = 'none';
    } else {
      emptyState.classList.add('hidden');
      list.style.display = 'flex';
      taskCount.style.display = 'flex';
    }
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
});
