// --- Initial Setup ---
alert("Welcome!");
let tasks = JSON.parse(localStorage.getItem('proTasks')) || [];
let currentFilter = 'all';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const taskStats = document.getElementById('task-stats');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- Helper Functions ---
const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
};

const saveTasks = () => {
    localStorage.setItem('proTasks', JSON.stringify(tasks));
};

const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const updateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    taskStats.textContent = `${completed} / ${total} Completed`;
};

// --- Core Logic ---
const renderTasks = () => {
    taskList.innerHTML = '';
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p style="text-align:center; padding: 20px;">No tasks found.</p>`;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="task-content">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    <div class="task-meta">
                        <span class="badge priority-${task.priority}">${task.priority}</span>
                        <span class="badge category-badge">${task.category}</span>
                        <span>${formatDate(task.createdAt)}</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="editTask(${task.id})" title="Delete">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">❌</button>
            `;
            taskList.appendChild(li);
        });
    }
    updateStats();
};

// --- Event Handlers ---
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
    tasks.unshift(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
});

window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
};

window.editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newTitle = prompt("Edit your task:", task.title);
        if (newTitle !== null && newTitle.trim() !== "") {
            task.title = newTitle.trim();
            saveTasks();
            renderTasks();
        }
    }
};

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

// Initial Render
renderTasks();
