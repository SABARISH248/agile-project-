/**
 * Student Task Manager - Add Task Module
 * Key requirements:
 * - LocalStorage key: "studentTasks"
 * - Append new tasks without overwriting existing ones
 * - Each task: { id, title, subject, description, priority, dueDate, status: "Pending" }
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const STORAGE_KEY = 'studentTasks';

  // Elements
  const taskForm = document.getElementById('taskForm');
  const taskTitleInput = document.getElementById('taskTitle');
  const subjectNameInput = document.getElementById('subjectName');
  const descriptionInput = document.getElementById('description');
  const dueDateInput = document.getElementById('dueDate');
  const priorityInputs = document.querySelectorAll('input[name="priority"]');
  
  const alertContainer = document.getElementById('alertContainer');
  const resetBtn = document.getElementById('resetBtn');
  
  // Mobile sidebar controls
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // Set default minimum date for Due Date input to today
  if (dueDateInput) {
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);
  }

  // --- Mobile Sidebar Toggle ---
  if (mobileMenuBtn && sidebar && sidebarBackdrop) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarBackdrop.classList.toggle('active');
    });

    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('active');
    });
  }

  // --- Real-time Validation / Clear Error on Input ---
  const formInputs = [taskTitleInput, subjectNameInput, descriptionInput, dueDateInput];
  formInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        clearInputError(input);
      });
    }
  });

  priorityInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      const priorityGroup = document.getElementById('priorityGroup');
      if (priorityGroup) {
        clearGroupError(priorityGroup);
      }
    });
  });

  // --- Form Reset Handler ---
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearAllErrors();
      hideAlert();
    });
  }

  // --- Form Submission Handler ---
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      clearAllErrors();
      hideAlert();

      // Collect form values
      const title = taskTitleInput.value.trim();
      const subject = subjectNameInput.value.trim();
      const description = descriptionInput.value.trim();
      const dueDate = dueDateInput.value;
      
      let selectedPriority = '';
      priorityInputs.forEach(radio => {
        if (radio.checked) {
          selectedPriority = radio.value;
        }
      });

      // Validate inputs
      const isValid = validateForm({ title, subject, description, selectedPriority, dueDate });

      if (!isValid) {
        return;
      }

      // Construct Task Object
      const newTask = {
        id: generateUniqueId(),
        title: title,
        subject: subject,
        description: description,
        priority: selectedPriority,
        dueDate: dueDate,
        status: 'Pending'
      };

      // Save to LocalStorage
      const saved = saveTaskToLocalStorage(newTask);

      if (saved) {
        // Display Success Alert
        showSuccessAlert(newTask);

        // Reset form inputs
        taskForm.reset();
        
        // Reset priority selection to default (e.g. Medium)
        const defaultPriority = document.getElementById('priorityMedium');
        if (defaultPriority) defaultPriority.checked = true;

        // Scroll to top of content for clear feedback
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showErrorAlert('Failed to save task to browser storage. Please try again.');
      }
    });
  }

  // --- Validation Logic ---
  function validateForm({ title, subject, description, selectedPriority, dueDate }) {
    let valid = true;

    if (!title) {
      showInputError(taskTitleInput, 'Task title is required');
      valid = false;
    } else if (title.length < 3) {
      showInputError(taskTitleInput, 'Task title should be at least 3 characters');
      valid = false;
    }

    if (!subject) {
      showInputError(subjectNameInput, 'Subject name is required');
      valid = false;
    }

    if (!description) {
      showInputError(descriptionInput, 'Description is required');
      valid = false;
    }

    if (!selectedPriority) {
      const priorityGroup = document.getElementById('priorityGroup');
      showGroupError(priorityGroup, 'Please select a priority level');
      valid = false;
    }

    if (!dueDate) {
      showInputError(dueDateInput, 'Due date is required');
      valid = false;
    }

    return valid;
  }

  // --- Helper Functions for Errors ---
  function showInputError(inputElement, message) {
    if (!inputElement) return;
    const group = inputElement.closest('.form-group');
    if (group) {
      group.classList.add('error');
      
      let errorElement = group.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        group.appendChild(errorElement);
      }
      errorElement.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${message}
      `;
    }
  }

  function clearInputError(inputElement) {
    if (!inputElement) return;
    const group = inputElement.closest('.form-group');
    if (group) {
      group.classList.remove('error');
      const errorElement = group.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  function showGroupError(groupElement, message) {
    if (!groupElement) return;
    groupElement.classList.add('error');
    let errorElement = groupElement.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      groupElement.appendChild(errorElement);
    }
    errorElement.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      ${message}
    `;
  }

  function clearGroupError(groupElement) {
    if (!groupElement) return;
    groupElement.classList.remove('error');
    const errorElement = groupElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  function clearAllErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => group.classList.remove('error'));
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }

  // --- LocalStorage Operations ---
  function getExistingTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error reading tasks from LocalStorage:', err);
      return [];
    }
  }

  function saveTaskToLocalStorage(newTask) {
    try {
      // Retrieve existing tasks array
      const tasks = getExistingTasks();
      
      // Append the new task to the array
      tasks.push(newTask);
      
      // Save updated list back to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (err) {
      console.error('Error saving task to LocalStorage:', err);
      return false;
    }
  }

  // --- Unique ID Generator ---
  function generateUniqueId() {
    // Generate robust unique ID string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `task_${timestamp}_${randomStr}`;
  }

  // --- Success & Alert Banner Display ---
  function showSuccessAlert(task) {
    if (!alertContainer) return;

    alertContainer.innerHTML = `
      <div class="alert alert-success" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="alert-content">
          <div class="alert-title">Task Created Successfully!</div>
          <div>"${escapeHtml(task.title)}" has been added to <strong>${escapeHtml(task.subject)}</strong> and stored in LocalStorage.</div>
        </div>
        <button type="button" class="alert-close" onclick="this.parentElement.remove()" aria-label="Close alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Also show toast popup notification for extra polish
    showToastNotification(`Task "${task.title}" added successfully!`);
  }

  function showErrorAlert(message) {
    if (!alertContainer) return;

    alertContainer.innerHTML = `
      <div class="alert alert-error" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="alert-content">
          <div class="alert-title">Error</div>
          <div>${escapeHtml(message)}</div>
        </div>
        <button type="button" class="alert-close" onclick="this.parentElement.remove()" aria-label="Close alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }

  function hideAlert() {
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }
  }

  function showToastNotification(text) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-title">Success</div>
        <div class="toast-message">${escapeHtml(text)}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
