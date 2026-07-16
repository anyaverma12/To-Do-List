alert("Welcome!")
        // State Management
        let tasks = JSON.parse(localStorage.getItem('proTasks')) || [];
        let currentFilter = 'all';

        // DOM Elements
        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const taskCategory = document.getElementById('task-category');
        const taskPriority = document.getElementById('task-priority');
        const taskList = document.getElementById('task-list');
        const taskStats = document.getElementById('task-stats');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Security: Basic HTML escape to prevent XSS
        const escapeHTML = (str) => {
            const div = document.createElement('div');
            div.innerText = str;
            return div.innerHTML;
        };

        // Save to Local Storage
        const saveTasks = () => {
            localStorage.setItem('proTasks', JSON.stringify(tasks));
        };

        // Format Date
        const formatDate = (dateString) => {
            const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        };

        // Render Tasks
        const renderTasks = () => {
            taskList.innerHTML = '';
            
            // Apply Filters
            let filteredTasks = tasks;
            if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
            if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

            // Empty State
            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-clipboard-list"></i>
                        <p>No tasks found in this view.</p>
                    </div>`;
            } else {
                // Build DOM
                filteredTasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = `task-item ${task.completed ? 'completed' : ''}`;
                    li.innerHTML = `
                        <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                        <div class="task-content">
                            <span class="task-title">${escapeHTML(task.title)}</span>
                            <div class="task-meta">
                                <span class="badge priority-${task.priority}">${task.priority}</span>
                                <span class="badge category-badge"><i class="fa-regular fa-folder" style="margin-right: 3px;"></i> ${task.category}</span>
                                <span><i class="fa-regular fa-clock" style="margin-right: 3px;"></i> ${formatDate(task.createdAt)}</span>
                            </div>
                        </div>
                        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    `;
                    taskList.appendChild(li);
                });
            }
            updateStats();
        };

        // Add Task
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = taskInput.value.trim();
            if (!title) return;

            const newTask = {
                id: Date.now(),
                title: title,
                category: taskCategory.value,
                priority: taskPriority.value,
                completed: false,
                createdAt: new Date().toISOString()
            };

            // Add to beginning of array
            tasks.unshift(newTask);
            saveTasks();
            
            // Reset input
            taskInput.value = '';
            
            // Reset filter to 'All' if adding a new task to ensure visibility
            document.querySelector('[data-filter="all"]').click();
            renderTasks();
        });

        // Toggle Task Completion (Called from HTML inline onclick)
        window.toggleTask = (id) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        };

        // Delete Task (Called from HTML inline onclick)
        window.deleteTask = (id) => {
            // Optional: Confirm deletion
            // if(!confirm('Are you sure you want to delete this task?')) return;
            
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        };

        // Filter Logic
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button styling
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update state and re-render
                currentFilter = e.target.getAttribute('data-filter');
                renderTasks();
            });
        });

        // Update Statistics
        const updateStats = () => {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            taskStats.textContent = `${completed} / ${total} Completed`;
        };

        // Initial Render
        renderTasks();