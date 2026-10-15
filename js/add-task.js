/**
 * Student Task Manager - Add Task Module
 * Key: LocalStorage "studentTasks"
 * 
 * Features:
 * - Form validation (Task Title, Subject, Description, Priority, Due Date)
 * - Appends new task to existing tasks array in LocalStorage
 * - Real-time Live Card Preview updates
 * - Quick subject selector chips
 * - Success toast notification
 */

const STORAGE_KEY = 'studentTasks';

document.addEventListener('DOMContentLoaded', () => {
  initAddTaskPage();
});

/**
 * Initializes DOM elements, event handlers, and default states
 */
function initAddTaskPage() {
  const form = document.getElementById('addTaskForm');
  const btnReset = document.getElementById('btnReset');
  const toastCloseBtn = document.getElementById('toastCloseBtn');
  const chipBtns = document.querySelectorAll('.chip-btn');
  
  // Set minimum date picker to today
  setTodayMinDate();

  // Load sidebar badge count from LocalStorage
  updateSidebarCount();

  // Attach live input listeners for Live Preview & validation clearing
  setupLivePreviewListeners();

  // Attach quick subject chips handlers
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subjectInput = document.getElementById('taskSubject');
      const subjectVal = btn.getAttribute('data-subject');
      if (subjectInput && subjectVal) {
        subjectInput.value = subjectVal;
        clearFieldError('groupSubject', 'subjectError');
        updateLivePreview();
      }
    });
  });

  // Attach character count for description textarea
  const descTextarea = document.getElementById('taskDescription');
  const charCountSpan = document.getElementById('charCount');
  if (descTextarea && charCountSpan) {
    descTextarea.addEventListener('input', () => {
      const currentLength = descTextarea.value.length;
      charCountSpan.textContent = `${currentLength} / 500 characters`;
    });
  }

  // Handle Toast Close
  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', hideSuccessToast);
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Handle Form Reset
  if (btnReset) {
    btnReset.addEventListener('click', handleFormReset);
  }
}

/**
 * Sets the minimum allowed date in the datepicker to today
 */
function setTodayMinDate() {
  const dateInput = document.getElementById('taskDueDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Sets up live feedback listeners to update the card preview on the right
 */
function setupLivePreviewListeners() {
  const inputs = ['taskTitle', 'taskSubject', 'taskDueDate', 'taskDescription'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateLivePreview();
        clearErrorOnInput(id);
      });
      el.addEventListener('change', () => {
        updateLivePreview();
        clearErrorOnInput(id);
      });
    }
  });

  // Radio button change listeners for priority
  const priorityRadios = document.querySelectorAll('input[name="priority"]');
  priorityRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateLivePreview();
      clearFieldError('groupPriority', 'priorityError');
    });
  });
}

/**
 * Clears error visual state when user edits a field
 */
function clearErrorOnInput(fieldId) {
  const map = {
    'taskTitle': ['groupTitle', 'titleError'],
    'taskSubject': ['groupSubject', 'subjectError'],
    'taskDueDate': ['groupDueDate', 'dueDateError'],
    'taskDescription': ['groupDescription', 'descriptionError']
  };

  if (map[fieldId]) {
    const [groupId, errorId] = map[fieldId];
    clearFieldError(groupId, errorId);
  }
}

/**
 * Updates the Live Preview Card in real-time
 */
function updateLivePreview() {
  const titleVal = document.getElementById('taskTitle')?.value.trim();
  const subjectVal = document.getElementById('taskSubject')?.value.trim();
  const dueDateVal = document.getElementById('taskDueDate')?.value;
  const descVal = document.getElementById('taskDescription')?.value.trim();
  const selectedPriority = document.querySelector('input[name="priority"]:checked')?.value || 'Medium';

  // Preview elements
  const prevTitle = document.getElementById('previewTitle');
  const prevSubject = document.getElementById('previewSubject');
  const prevDueDate = document.getElementById('previewDueDate');
  const prevDesc = document.getElementById('previewDescription');
  const prevPriority = document.getElementById('previewPriority');

  if (prevTitle) {
    prevTitle.textContent = titleVal || 'Your Task Title Will Appear Here';
  }

  if (prevSubject) {
    prevSubject.textContent = subjectVal || 'Subject Name';
  }

  if (prevDesc) {
    prevDesc.textContent = descVal || 'Task description overview will display here in real-time as you type...';
  }

  if (prevDueDate) {
    if (dueDateVal) {
      const formattedDate = formatDateDisplay(dueDateVal);
      prevDueDate.textContent = `Due: ${formattedDate}`;
    } else {
      prevDueDate.textContent = 'Due: Select Date';
    }
  }

  if (prevPriority) {
    prevPriority.className = `priority-tag ${selectedPriority.toLowerCase()}`;
    let iconClass = 'ri-subtract-line';
    if (selectedPriority === 'Low') iconClass = 'ri-arrow-down-circle-line';
    if (selectedPriority === 'High') iconClass = 'ri-fire-line';
    
    prevPriority.innerHTML = `<i class="${iconClass}"></i> ${selectedPriority} Priority`;
  }
}

/**
 * Formats YYYY-MM-DD into readable date (e.g. Oct 5, 2026)
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Form Submission Handler
 */
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate form
  const isValid = validateTaskForm();
  if (!isValid) {
    return;
  }

  // Get field values
  const title = document.getElementById('taskTitle').value.trim();
  const subject = document.getElementById('taskSubject').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const description = document.getElementById('taskDescription').value.trim();
  const priority = document.querySelector('input[name="priority"]:checked').value;

  // Construct Task Object
  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title: title,
    subject: subject,
    category: subject, // Maintain backward compatibility with category
    description: description,
    priority: priority,
    dueDate: dueDate,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // Save to LocalStorage without overwriting existing tasks
  saveTaskToStorage(newTask);

  // Show Toast Success Notification
  showSuccessToast(`Task "${newTask.title}" created and saved successfully!`);

  // Reset Form and Preview
  handleFormReset();

  // Refresh Sidebar Count
  updateSidebarCount();
}

/**
 * Validates form inputs and renders error messages if invalid
 */
function validateTaskForm() {
  let isValid = true;

  const titleInput = document.getElementById('taskTitle');
  const subjectInput = document.getElementById('taskSubject');
  const dueDateInput = document.getElementById('taskDueDate');
  const descInput = document.getElementById('taskDescription');
  const priorityChecked = document.querySelector('input[name="priority"]:checked');

  // Title Validation
  if (!titleInput || !titleInput.value.trim()) {
    showFieldError('groupTitle', 'titleError', 'Task title is required.');
    isValid = false;
  } else if (titleInput.value.trim().length < 3) {
    showFieldError('groupTitle', 'titleError', 'Task title must be at least 3 characters long.');
    isValid = false;
  } else {
    clearFieldError('groupTitle', 'titleError');
  }

  // Subject Validation
  if (!subjectInput || !subjectInput.value.trim()) {
    showFieldError('groupSubject', 'subjectError', 'Subject name is required.');
    isValid = false;
  } else {
    clearFieldError('groupSubject', 'subjectError');
  }

  // Due Date Validation
  if (!dueDateInput || !dueDateInput.value) {
    showFieldError('groupDueDate', 'dueDateError', 'Please select a due date.');
    isValid = false;
  } else {
    clearFieldError('groupDueDate', 'dueDateError');
  }

  // Priority Validation
  if (!priorityChecked) {
    showFieldError('groupPriority', 'priorityError', 'Please select a priority level.');
    isValid = false;
  } else {
    clearFieldError('groupPriority', 'priorityError');
  }

  // Description Validation
  if (!descInput || !descInput.value.trim()) {
    showFieldError('groupDescription', 'descriptionError', 'Task description is required.');
    isValid = false;
  } else if (descInput.value.trim().length < 5) {
    showFieldError('groupDescription', 'descriptionError', 'Description must be at least 5 characters long.');
    isValid = false;
  } else {
    clearFieldError('groupDescription', 'descriptionError');
  }

  return isValid;
}

/**
 * Displays an error message for a specific form field
 */
function showFieldError(groupId, errorId, message) {
  const group = document.getElementById(groupId);
  const errorEl = document.getElementById(errorId);
  if (group) group.classList.add('has-error');
  if (errorEl) errorEl.textContent = message;
}

/**
 * Clears an error message for a specific form field
 */
function clearFieldError(groupId, errorId) {
  const group = document.getElementById(groupId);
  const errorEl = document.getElementById(errorId);
  if (group) group.classList.remove('has-error');
  if (errorEl) errorEl.textContent = '';
}

/**
 * Retrieves tasks from LocalStorage, appends new task, and writes back
 */
function saveTaskToStorage(newTask) {
  try {
    let tasks = [];
    const existing = localStorage.getItem(STORAGE_KEY);
    
    if (existing) {
      tasks = JSON.parse(existing);
      if (!Array.isArray(tasks)) {
        tasks = [];
      }
    }

    // Append new task to existing tasks array
    tasks.push(newTask);

    // Write back to LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving task to LocalStorage:', err);
    alert('Failed to save task to LocalStorage. Please check browser permissions.');
  }
}

/**
 * Displays global success toast notification
 */
function showSuccessToast(message) {
  const toast = document.getElementById('successToast');
  const toastMsg = document.getElementById('toastMessage');

  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('active');

    // Scroll smoothly to toast if page is scrolled down
    toast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      hideSuccessToast();
    }, 5000);
  }
}

/**
 * Hides global success toast notification
 */
function hideSuccessToast() {
  const toast = document.getElementById('successToast');
  if (toast) {
    toast.classList.remove('active');
  }
}

/**
 * Resets the task form to default state
 */
function handleFormReset() {
  const form = document.getElementById('addTaskForm');
  if (form) {
    form.reset();
  }

  // Clear errors
  ['groupTitle', 'groupSubject', 'groupDueDate', 'groupPriority', 'groupDescription'].forEach(g => {
    const errorId = g.replace('group', '').toLowerCase() + 'Error';
    clearFieldError(g, errorId);
  });

  // Reset char counter
  const charCountSpan = document.getElementById('charCount');
  if (charCountSpan) {
    charCountSpan.textContent = '0 / 500 characters';
  }

  // Reset default priority radio to Medium
  const defaultRadio = document.getElementById('prioMedium');
  if (defaultRadio) {
    defaultRadio.checked = true;
  }

  // Reset Live Preview
  updateLivePreview();
}

/**
 * Updates sidebar badge count with total tasks count from LocalStorage
 */
function updateSidebarCount() {
  const badge = document.getElementById('sidebarTotalBadge');
  if (!badge) return;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const tasks = existing ? JSON.parse(existing) : [];
    badge.textContent = tasks.length || 0;
  } catch (e) {
    badge.textContent = 0;
  }
}
