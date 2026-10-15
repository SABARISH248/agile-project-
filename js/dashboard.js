/**
 * Student Task Manager - Dashboard Logic
 * Key: LocalStorage "studentTasks"
 */

const STORAGE_KEY = 'studentTasks';

// Initial Sample Data (used if LocalStorage is empty)
const SAMPLE_TASKS = [
  {
    id: 'task-101',
    title: 'Complete Mathematics Assignment 4',
    description: 'Solve calculus integration problems 1 through 15.',
    category: 'Mathematics',
    dueDate: '2026-10-05',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-10-01T09:00:00.000Z'
  },
  {
    id: 'task-102',
    title: 'Submit Physics Lab Report',
    description: 'Format raw data tables and write conclusion for Optics lab.',
    category: 'Physics',
    dueDate: '2026-09-28',
    priority: 'High',
    status: 'Overdue',
    createdAt: '2026-09-24T14:30:00.000Z'
  },
  {
    id: 'task-103',
    title: 'Read Computer Science Chapter 5',
    description: 'Study Binary Search Trees and Heap Algorithms.',
    category: 'Computer Science',
    dueDate: '2026-10-04',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2026-09-30T11:15:00.000Z'
  },
  {
    id: 'task-104',
    title: 'History Presentation Slides',
    description: 'Create 10 slides summarizing the Industrial Revolution.',
    category: 'History',
    dueDate: '2026-09-30',
    priority: 'Low',
    status: 'Completed',
    createdAt: '2026-09-20T16:00:00.000Z'
  },
  {
    id: 'task-105',
    title: 'Database ER Diagram Draft',
    description: 'Design schema for student portal project in 3NF.',
    category: 'Computer Science',
    dueDate: '2026-10-08',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-10-02T10:00:00.000Z'
  }
];

let currentFilter = 'all';

// Initialize Dashboard on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  updateDateDisplay();
  setupEventListeners();
  refreshDashboard();
});

/**
 * Ensures LocalStorage contains data. If empty, seeds with sample data.
 */
function initStorage() {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData || JSON.parse(existingData).length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TASKS));
  }
}

/**
 * Retrieves tasks array from LocalStorage
 */
function getTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing tasks from LocalStorage:', error);
    return [];
  }
}

/**
 * Saves tasks array back to LocalStorage
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to LocalStorage:', error);
  }
}

/**
 * Updates top navbar formatted date
 */
function updateDateDisplay() {
  const dateEl = document.getElementById('currentDateText');
  if (!dateEl) return;

  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Setup Mobile Sidebar and Filter event listeners
 */
function setupEventListeners() {
  // Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggleBtn && sidebar && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    };

    toggleBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  }

  // Task Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderRecentTasks();
    });
  });
}

/**
 * Refreshes all dashboard statistics, charts, and recent tasks
 */
function refreshDashboard() {
  const tasks = getTasks();
  const stats = calculateStats(tasks);
  
  renderStats(stats);
  renderProgress(stats);
  renderRecentTasks(tasks);
  updateBadgeCounts(stats);
}

/**
 * Calculates Total, Completed, Pending, and Overdue task metrics
 */
function calculateStats(tasks) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  let total = tasks.length;
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  tasks.forEach(task => {
    if (task.status === 'Completed') {
      completed++;
    } else {
      // Check if task is overdue by explicit status OR by past due date
      const isPastDueDate = task.dueDate && task.dueDate < todayStr;
      if (task.status === 'Overdue' || isPastDueDate) {
        overdue++;
      } else {
        pending++;
      }
    }
  });

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    overdue,
    completionPercentage
  };
}

/**
 * Renders four key statistic cards
 */
function renderStats(stats) {
  const totalEl = document.getElementById('totalTasksCount');
  const completedEl = document.getElementById('completedTasksCount');
  const pendingEl = document.getElementById('pendingTasksCount');
  const overdueEl = document.getElementById('overdueTasksCount');

  if (totalEl) totalEl.textContent = stats.total;
  if (completedEl) completedEl.textContent = stats.completed;
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (overdueEl) overdueEl.textContent = stats.overdue;

  // Update stat subtexts with relative percentages
  const completedSubtext = document.getElementById('completedSubtext');
  if (completedSubtext) {
    completedSubtext.textContent = `${stats.completionPercentage}% of total tasks finished`;
  }
}

/**
 * Renders task completion progress ring and linear breakdown bars
 */
function renderProgress(stats) {
  const percentageEl = document.getElementById('progressPercentage');
  const circleEl = document.getElementById('progressCircle');

  if (percentageEl) {
    percentageEl.textContent = `${stats.completionPercentage}%`;
  }

  if (circleEl) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // Approx 439.8
    const offset = circumference - (stats.completionPercentage / 100) * circumference;
    circleEl.style.strokeDasharray = `${circumference}`;
    circleEl.style.strokeDashoffset = `${offset}`;
  }

  // Update Linear Progress Bars
  const total = stats.total || 1; // avoid division by zero
  const completedWidth = (stats.completed / total) * 100;
  const pendingWidth = (stats.pending / total) * 100;
  const overdueWidth = (stats.overdue / total) * 100;

  const barCompleted = document.getElementById('barFillCompleted');
  const barPending = document.getElementById('barFillPending');
  const barOverdue = document.getElementById('barFillOverdue');

  const valCompleted = document.getElementById('valCompleted');
  const valPending = document.getElementById('valPending');
  const valOverdue = document.getElementById('valOverdue');

  if (barCompleted) barCompleted.style.width = `${completedWidth}%`;
  if (barPending) barPending.style.width = `${pendingWidth}%`;
  if (barOverdue) barOverdue.style.width = `${overdueWidth}%`;

  if (valCompleted) valCompleted.textContent = `${stats.completed} (${Math.round(completedWidth)}%)`;
  if (valPending) valPending.textContent = `${stats.pending} (${Math.round(pendingWidth)}%)`;
  if (valOverdue) valOverdue.textContent = `${stats.overdue} (${Math.round(overdueWidth)}%)`;
}

/**
 * Updates sidebar badge counters
 */
function updateBadgeCounts(stats) {
  const totalBadge = document.getElementById('sidebarTotalBadge');
  if (totalBadge) {
    totalBadge.textContent = stats.total;
  }
}

/**
 * Renders Recent Tasks in the main card
 */
function renderRecentTasks(tasksList) {
  const container = document.getElementById('recentTasksList');
  if (!container) return;

  const tasks = tasksList || getTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks based on current selected tab filter
  let filteredTasks = tasks.filter(task => {
    const isPastDue = task.dueDate && task.dueDate < todayStr && task.status !== 'Completed';
    const computedStatus = task.status === 'Completed' ? 'Completed' : (isPastDue || task.status === 'Overdue' ? 'Overdue' : 'Pending');

    if (currentFilter === 'pending') return computedStatus === 'Pending';
    if (currentFilter === 'completed') return computedStatus === 'Completed';
    if (currentFilter === 'overdue') return computedStatus === 'Overdue';
    return true;
  });

  // Sort tasks by creation date / due date descending
  filteredTasks.sort((a, b) => new Date(b.dueDate || b.createdAt) - new Date(a.dueDate || a.createdAt));

  // Take top 5 for Recent section
  const recentTasks = filteredTasks.slice(0, 5);

  if (recentTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="ri-checkbox-circle-line"></i>
        </div>
        <h3>No ${currentFilter !== 'all' ? currentFilter : ''} tasks found</h3>
        <p>You have no tasks in this category right now. Great job keeping up with your studies!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recentTasks.map(task => {
    const isCompleted = task.status === 'Completed';
    const isPastDue = task.dueDate && task.dueDate < todayStr && !isCompleted;
    const computedStatus = isCompleted ? 'completed' : (isPastDue || task.status === 'Overdue' ? 'overdue' : 'pending');
    
    // Priority styling
    const priorityClass = (task.priority || 'medium').toLowerCase();
    
    // Formatted Due Date
    const formattedDueDate = formatDueDate(task.dueDate);

    return `
      <div class="task-item ${isCompleted ? 'completed' : ''}">
        <div class="task-left">
          <div class="task-checkbox-wrapper">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${isCompleted ? 'checked' : ''}
              onchange="toggleTaskStatus('${task.id}')"
              title="Mark as ${isCompleted ? 'pending' : 'completed'}"
            />
          </div>
          <div class="task-details">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <div class="task-meta">
              <span class="category-tag"><i class="ri-book-open-line"></i> ${escapeHtml(task.category || 'General')}</span>
              <span class="due-date-tag"><i class="ri-calendar-line"></i> ${formattedDueDate}</span>
            </div>
          </div>
        </div>
        <div class="task-right">
          <span class="priority-pill ${priorityClass}">
            <i class="ri-flag-fill"></i> ${task.priority || 'Medium'}
          </span>
          <span class="status-badge ${computedStatus}">
            ${computedStatus}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Toggles a task's status between Completed and Pending/Overdue
 */
function toggleTaskStatus(taskId) {
  const tasks = getTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      if (task.status === 'Completed') {
        // Revert to Pending or Overdue depending on due date
        const isPastDue = task.dueDate && task.dueDate < todayStr;
        task.status = isPastDue ? 'Overdue' : 'Pending';
        showToast('Task marked as pending ⏳');
      } else {
        task.status = 'Completed';
        showToast('Task completed! Great job! 🎉');
      }
    }
    return task;
  });

  saveTasks(updatedTasks);
  refreshDashboard();
}

/**
 * Helper to format due dates nicely
 */
function formatDueDate(dueDateStr) {
  if (!dueDateStr) return 'No deadline';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '<strong style="color:#2563eb;">Due Today</strong>';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `<strong style="color:#ef4444;">${Math.abs(diffDays)}d overdue</strong>`;
  return `${diffDays} days left`;
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/**
 * Displays brief toast notification
 */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${message}`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
