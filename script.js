const STORAGE_KEY = "personal-task-manager.tasks";

const elements = {
  form: document.querySelector("#taskForm"),
  input: document.querySelector("#taskInput"),
  priority: document.querySelector("#prioritySelect"),
  search: document.querySelector("#searchInput"),
  list: document.querySelector("#taskList"),
  template: document.querySelector("#taskTemplate"),
  emptyState: document.querySelector("#emptyState"),
  filters: document.querySelectorAll(".filter-button"),
  allCount: document.querySelector("#allCount"),
  activeCount: document.querySelector("#activeCount"),
  completedCount: document.querySelector("#completedCount"),
  totalStat: document.querySelector("#totalStat"),
  doneStat: document.querySelector("#doneStat"),
  progressStat: document.querySelector("#progressStat"),
  progressBar: document.querySelector("#progressBar"),
  clearCompleted: document.querySelector("#clearCompleted")
};

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    console.warn("Không thể đọc dữ liệu đã lưu:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title, priority) {
  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title: title.trim(),
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function getVisibleTasks() {
  return tasks.filter(task => {
    const matchesFilter = currentFilter === "all"
      || (currentFilter === "active" && !task.completed)
      || (currentFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLocaleLowerCase("vi").includes(searchTerm);
    return matchesFilter && matchesSearch;
  });
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(dateString));
}

function createTaskElement(task) {
  const item = elements.template.content.firstElementChild.cloneNode(true);
  item.dataset.id = task.id;
  item.classList.toggle("completed", task.completed);

  item.querySelector(".task-title").textContent = task.title;
  item.querySelector(".task-time").textContent = `Đã thêm ${formatTime(task.createdAt)}`;

  const badge = item.querySelector(".priority-badge");
  badge.textContent = task.priority === "high" ? "Quan trọng" : "Bình thường";
  badge.classList.toggle("high", task.priority === "high");

  item.querySelector(".check-button").setAttribute(
    "aria-label",
    task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"
  );
  item.querySelector(".check-button").addEventListener("click", () => toggleTask(task.id));
  item.querySelector(".delete-button").addEventListener("click", () => deleteTask(task.id));
  return item;
}

function render() {
  const visibleTasks = getVisibleTasks();
  elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
  elements.emptyState.classList.toggle("hidden", visibleTasks.length > 0);

  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  elements.allCount.textContent = tasks.length;
  elements.activeCount.textContent = active;
  elements.completedCount.textContent = completed;
  elements.totalStat.textContent = tasks.length;
  elements.doneStat.textContent = completed;
  elements.progressStat.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.clearCompleted.disabled = completed === 0;
}

function renderDate() {
  const now = new Date();
  document.querySelector("#weekday").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(now);
  document.querySelector("#dateNumber").textContent = String(now.getDate()).padStart(2, "0");
  document.querySelector("#monthYear").textContent = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(now);
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();
  if (!elements.input.value.trim()) return;
  addTask(elements.input.value, elements.priority.value);
  elements.form.reset();
  elements.input.focus();
});

elements.search.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLocaleLowerCase("vi");
  render();
});

elements.filters.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    elements.filters.forEach(filter => filter.classList.toggle("active", filter === button));
    render();
  });
});

elements.clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

renderDate();
render();
