// ============================================================
// Momentum — Productivity Goal Tracker
// ============================================================

const App = (() => {
  // --- State ---
  let state = {
    goals: [],
    tasks: [],
    reminders: [],
    streak: { count: 0, lastDate: null, history: [] },
    currentPage: 'Dashboard',
    currentGoalFilter: 'all',
    currentCommunityFilter: 'all',
  };

  // --- Community Mock Data ---
  const communityPeople = [
    { id: 1, name: 'Sarah Chen', avatar: 'SC', color: 'bg-violet-100 text-violet-700', goal: 'Run a marathon', category: 'fitness', streak: 42, bio: 'Training for my first marathon. Currently at 15 miles!', mutual: true },
    { id: 2, name: 'Marcus Johnson', avatar: 'MJ', color: 'bg-amber-100 text-amber-700', goal: 'Learn Spanish', category: 'learning', streak: 28, bio: 'Duolingo streak going strong. Looking for conversation partners.', mutual: false },
    { id: 3, name: 'Aisha Patel', avatar: 'AP', color: 'bg-emerald-100 text-emerald-700', goal: 'Launch a startup', category: 'career', streak: 65, bio: 'Building an ed-tech platform. Always happy to chat about startups.', mutual: true },
    { id: 4, name: 'Tom Erikson', avatar: 'TE', color: 'bg-sky-100 text-sky-700', goal: 'Meditate daily', category: 'health', streak: 90, bio: '90 days of meditation and counting. Mindfulness changed my life.', mutual: false },
    { id: 5, name: 'Luna Martinez', avatar: 'LM', color: 'bg-rose-100 text-rose-700', goal: 'Write a novel', category: 'personal', streak: 33, bio: 'NaNoWriMo winner, working on my second draft. Science fiction.', mutual: false },
    { id: 6, name: 'James Wei', avatar: 'JW', color: 'bg-teal-100 text-teal-700', goal: 'Get fit — lose 20 lbs', category: 'fitness', streak: 15, bio: 'Down 8 lbs so far. Gym 5x/week, meal prepping on Sundays.', mutual: true },
    { id: 7, name: 'Priya Sharma', avatar: 'PS', color: 'bg-indigo-100 text-indigo-700', goal: 'Master Python', category: 'learning', streak: 55, bio: 'Software engineer learning ML/AI. Currently building side projects.', mutual: false },
    { id: 8, name: 'David Kim', avatar: 'DK', color: 'bg-orange-100 text-orange-700', goal: 'Read 50 books this year', category: 'personal', streak: 19, bio: '23 books done. Mostly non-fiction, philosophy, and sci-fi.', mutual: true },
    { id: 9, name: 'Elena Popova', avatar: 'EP', color: 'bg-pink-100 text-pink-700', goal: 'Quit smoking', category: 'health', streak: 120, bio: '120 days smoke-free! Happy to support others on the same journey.', mutual: false },
    { id: 10, name: 'Ryan O\'Brien', avatar: 'RO', color: 'bg-cyan-100 text-cyan-700', goal: 'Get promoted to Senior', category: 'career', streak: 38, bio: 'Working on leadership skills and system design. Open to mentorship.', mutual: true },
    { id: 11, name: 'Fatima Al-Said', avatar: 'FA', color: 'bg-lime-100 text-lime-700', goal: 'Morning routine habit', category: 'health', streak: 72, bio: 'Wake at 5am, journal, workout, plan. Most productive I\'ve ever been.', mutual: false },
    { id: 12, name: 'Chris Nolan', avatar: 'CN', color: 'bg-fuchsia-100 text-fuchsia-700', goal: 'Learn guitar', category: 'learning', streak: 45, bio: 'Can now play 20+ songs. Working on fingerpicking and music theory.', mutual: false },
  ];

  // --- Quotes ---
  const quotes = [
    { text: '"The secret of getting ahead is getting started."', author: '— Mark Twain' },
    { text: '"It does not matter how slowly you go as long as you do not stop."', author: '— Confucius' },
    { text: '"Success is the sum of small efforts repeated day in and day out."', author: '— Robert Collier' },
    { text: '"Don\'t watch the clock; do what it does. Keep going."', author: '— Sam Levenson' },
    { text: '"The only way to do great work is to love what you do."', author: '— Steve Jobs' },
    { text: '"Motivation gets you going, habit keeps you going."', author: '— Jim Rohn' },
    { text: '"A goal without a plan is just a wish."', author: '— Antoine de Saint-Exupéry' },
    { text: '"Small daily improvements are the key to staggering long-term results."', author: '— Unknown' },
    { text: '"You are never too old to set another goal or to dream a new dream."', author: '— C.S. Lewis' },
    { text: '"What you get by achieving your goals is not as important as what you become."', author: '— Zig Ziglar' },
  ];

  // --- Persistence ---
  function save() {
    localStorage.setItem('momentum_state', JSON.stringify(state));
  }

  function load() {
    const saved = localStorage.getItem('momentum_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }

  // --- Utilities ---
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 0 && diff <= 7) return `In ${diff} days`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  }

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('flex');
    }, 2500);
  }

  function getCategoryColor(cat) {
    const colors = {
      health: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      career: 'bg-blue-50 text-blue-600 border-blue-200',
      learning: 'bg-violet-50 text-violet-600 border-violet-200',
      personal: 'bg-amber-50 text-amber-600 border-amber-200',
      fitness: 'bg-rose-50 text-rose-600 border-rose-200',
    };
    return colors[cat] || 'bg-surface-100 text-surface-600 border-surface-200';
  }

  function getCategoryIcon(cat) {
    const icons = {
      health: '💚',
      career: '💼',
      learning: '📚',
      personal: '✨',
      fitness: '🏃',
    };
    return icons[cat] || '🎯';
  }

  // --- Streak Logic ---
  function checkStreak() {
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (state.streak.lastDate === today) return;

    if (state.streak.lastDate === yesterday) {
      // streak continues
    } else if (state.streak.lastDate && state.streak.lastDate !== today) {
      // streak broken
      state.streak.count = 0;
      state.streak.history = [];
    }
  }

  function completeStreakDay() {
    const today = getToday();
    if (state.streak.lastDate === today) return;

    if (state.streak.lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.streak.lastDate !== yesterday && state.streak.lastDate !== today) {
        state.streak.count = 0;
        state.streak.history = [];
      }
    }

    state.streak.count++;
    state.streak.lastDate = today;
    if (!state.streak.history.includes(today)) {
      state.streak.history.push(today);
    }
    if (state.streak.history.length > 7) {
      state.streak.history = state.streak.history.slice(-7);
    }
    save();
  }

  // --- Rendering ---
  function renderDashboard() {
    document.getElementById('greeting').textContent = getGreeting();

    // Streak
    checkStreak();
    const streakEl = document.getElementById('streakCount');
    streakEl.textContent = state.streak.count;

    const todayCompleted = state.tasks.filter(t => t.date === getToday() && t.completed).length;
    const todayTotal = state.tasks.filter(t => t.date === getToday()).length;
    const progress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

    document.getElementById('streakRing').style.setProperty('--progress', `${progress}%`);

    // Streak dots
    const dotsContainer = document.getElementById('streakDots');
    dotsContainer.innerHTML = '';
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isActive = state.streak.history.includes(dateStr);
      const isToday = dateStr === getToday();

      const dot = document.createElement('div');
      dot.className = 'flex-1 flex flex-col items-center gap-1';
      dot.innerHTML = `
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
          isActive ? 'bg-brand-500 text-white' : isToday ? 'bg-brand-50 text-brand-500 border border-brand-200' : 'bg-surface-100 text-surface-400'
        }">${dayLabels[i]}</div>
      `;
      dotsContainer.appendChild(dot);
    }

    // Streak message
    const msgEl = document.getElementById('streakMessage');
    if (state.streak.count === 0) {
      msgEl.textContent = 'Complete today\'s tasks to start a streak!';
    } else if (state.streak.count < 7) {
      msgEl.textContent = `${7 - state.streak.count} more days to your first week streak!`;
    } else if (state.streak.count < 30) {
      msgEl.textContent = `Amazing! ${30 - state.streak.count} days to a monthly streak!`;
    } else {
      msgEl.textContent = `Incredible ${state.streak.count}-day streak! You\'re unstoppable!`;
    }

    // Stats
    const activeGoals = state.goals.filter(g => !g.completed).length;
    const completedGoals = state.goals.filter(g => g.completed).length;
    const activeReminders = state.reminders.filter(r => !r.done).length;
    document.getElementById('statGoals').textContent = activeGoals;
    document.getElementById('statCompleted').textContent = completedGoals;
    document.getElementById('statReminders').textContent = activeReminders;

    // Today's tasks
    renderTodayTasks();

    // Quote
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = quote.author;

    // Notification badge
    const upcomingCount = state.reminders.filter(r => {
      if (r.done) return false;
      const d = new Date(r.date + 'T' + (r.time || '23:59'));
      const now = new Date();
      const diff = d - now;
      return diff > 0 && diff < 86400000;
    }).length;
    const badge = document.getElementById('notifBadge');
    if (upcomingCount > 0) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
      badge.textContent = upcomingCount;
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }

  function renderTodayTasks() {
    const container = document.getElementById('todayTasks');
    const today = getToday();
    const todayTasks = state.tasks.filter(t => t.date === today);

    if (todayTasks.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center">
          <div class="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <p class="text-surface-400 text-sm">No tasks for today. Add one to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = todayTasks.map(task => `
      <div class="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors group">
        <button onclick="App.toggleTask('${task.id}')" class="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed ? 'bg-brand-500 border-brand-500' : 'border-surface-300 hover:border-brand-400'
        }">
          ${task.completed ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
        </button>
        <span class="flex-1 text-sm ${task.completed ? 'line-through text-surface-400' : 'text-surface-700'}">${task.title}</span>
        ${task.goalId ? `<span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(state.goals.find(g => g.id === task.goalId)?.category || '')} border">${state.goals.find(g => g.id === task.goalId)?.title.slice(0, 12) || 'Goal'}${state.goals.find(g => g.id === task.goalId)?.title.length > 12 ? '...' : ''}</span>` : ''}
        <button onclick="App.deleteTask('${task.id}')" class="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `).join('');
  }

  function renderGoals() {
    const container = document.getElementById('goalsList');
    let filtered = [...state.goals];

    if (state.currentGoalFilter === 'active') {
      filtered = filtered.filter(g => !g.completed);
    } else if (state.currentGoalFilter === 'completed') {
      filtered = filtered.filter(g => g.completed);
    } else if (state.currentGoalFilter !== 'all') {
      filtered = filtered.filter(g => g.category === state.currentGoalFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl p-10 text-center shadow-sm border border-surface-200">
          <div class="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="font-semibold text-surface-700 mb-1">No goals yet</h3>
          <p class="text-surface-400 text-sm">Set your first goal and start tracking progress</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(goal => {
      const tasks = state.tasks.filter(t => t.goalId === goal.id);
      const completedTasks = tasks.filter(t => t.completed).length;
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : (goal.completed ? 100 : 0);

      return `
        <div class="goal-card bg-white rounded-2xl p-5 shadow-sm border border-surface-200 cursor-pointer" onclick="App.showGoalDetail('${goal.id}')">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">${getCategoryIcon(goal.category)}</span>
              <div>
                <h3 class="font-semibold text-surface-900 ${goal.completed ? 'line-through opacity-60' : ''}">${goal.title}</h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(goal.category)} border font-medium uppercase tracking-wider">${goal.category}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-surface-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ${goal.deadline ? formatDate(goal.deadline) : 'No deadline'}
            </div>
          </div>
          ${goal.description ? `<p class="text-sm text-surface-500 mb-3 line-clamp-2">${goal.description}</p>` : ''}
          <div class="flex items-center gap-3">
            <div class="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
              <div class="progress-bar h-full rounded-full ${goal.completed ? 'bg-emerald-500' : 'bg-brand-500'}" style="width: ${progress}%"></div>
            </div>
            <span class="text-xs font-semibold ${goal.completed ? 'text-emerald-500' : 'text-surface-500'}">${progress}%</span>
          </div>
          ${tasks.length > 0 ? `<p class="text-[11px] text-surface-400 mt-2">${completedTasks} of ${tasks.length} milestones completed</p>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderCommunity(searchQuery = '') {
    const container = document.getElementById('communityList');
    let filtered = [...communityPeople];

    if (state.currentCommunityFilter !== 'all') {
      filtered = filtered.filter(p => p.category === state.currentCommunityFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl p-10 text-center shadow-sm border border-surface-200">
          <div class="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <h3 class="font-semibold text-surface-700 mb-1">No matches found</h3>
          <p class="text-surface-400 text-sm">Try a different search or category</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(person => `
      <div class="person-card bg-white rounded-2xl p-5 shadow-sm border border-surface-200">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full ${person.color} flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold">${person.avatar}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900 text-sm">${person.name}</h3>
              ${person.mutual ? '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 font-medium">Mutual</span>' : ''}
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-surface-500">🎯 ${person.goal}</span>
            </div>
            <p class="text-xs text-surface-400 mt-1.5 leading-relaxed">${person.bio}</p>
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-3">
                <span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(person.category)} border font-medium">${person.category}</span>
                <span class="text-[11px] text-surface-400 flex items-center gap-1">🔥 ${person.streak} day streak</span>
              </div>
              <button onclick="App.connectPerson(${person.id})" class="text-xs font-medium text-brand-500 hover:text-brand-600 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors">Connect</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderReminders() {
    const upcoming = state.reminders.filter(r => !r.done).sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')));
    const past = state.reminders.filter(r => r.done).sort((a, b) => new Date(b.date) - new Date(a.date));

    const upcomingContainer = document.getElementById('upcomingReminders');
    const pastContainer = document.getElementById('pastReminders');

    if (upcoming.length === 0) {
      upcomingContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 text-center shadow-sm border border-surface-200">
          <p class="text-surface-400 text-sm">No upcoming reminders</p>
        </div>
      `;
    } else {
      upcomingContainer.innerHTML = upcoming.map(r => {
        const isOverdue = new Date(r.date + 'T' + (r.time || '23:59')) < new Date();
        return `
          <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-surface-200 flex items-center gap-3 group hover:shadow-md transition-shadow">
            <button onclick="App.toggleReminder('${r.id}')" class="w-5 h-5 rounded-md border-2 border-surface-300 hover:border-brand-400 flex-shrink-0 transition-colors"></button>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-800 truncate">${r.title}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[11px] ${isOverdue ? 'text-red-500 font-medium' : 'text-surface-400'}">${formatDate(r.date)}</span>
                ${r.time ? `<span class="text-[11px] text-surface-400">${formatTime(r.time)}</span>` : ''}
                ${r.repeat !== 'none' ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-500 border border-surface-200">${r.repeat}</span>` : ''}
              </div>
            </div>
            <button onclick="App.deleteReminder('${r.id}')" class="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;
      }).join('');
    }

    if (past.length === 0) {
      pastContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 text-center shadow-sm border border-surface-200">
          <p class="text-surface-400 text-sm">No past reminders</p>
        </div>
      `;
    } else {
      pastContainer.innerHTML = past.slice(0, 10).map(r => `
        <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-surface-200 flex items-center gap-3 opacity-60">
          <div class="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-surface-500 line-through truncate">${r.title}</p>
            <span class="text-[11px] text-surface-400">${formatDate(r.date)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // --- Navigation ---
  function navigate(page) {
    state.currentPage = page;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page${page}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
      const isActive = n.dataset.page === page;
      n.classList.toggle('active', isActive);
      n.classList.toggle('text-surface-400', !isActive);
      n.querySelector('.nav-dot').classList.toggle('bg-brand-500', isActive);
      n.querySelector('.nav-dot').classList.toggle('bg-transparent', !isActive);
    });

    if (page === 'Dashboard') renderDashboard();
    if (page === 'Goals') renderGoals();
    if (page === 'Community') renderCommunity();
    if (page === 'Reminders') renderReminders();
  }

  // --- Modals ---
  function showModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }

  // --- Add Task ---
  function showAddTask() {
    const goalOptions = state.goals.filter(g => !g.completed).map(g =>
      `<option value="${g.id}">${g.title}</option>`
    ).join('');

    showModal(`
      <div class="p-6">
        <h2 class="font-display text-lg font-bold text-surface-900 mb-4">Add Task</h2>
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Task name</label>
            <input type="text" id="taskTitle" placeholder="What do you need to do?" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white" autofocus>
          </div>
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Date</label>
            <input type="date" id="taskDate" value="${getToday()}" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
          </div>
          ${goalOptions ? `
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Link to goal (optional)</label>
            <select id="taskGoal" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
              <option value="">No goal</option>
              ${goalOptions}
            </select>
          </div>
          ` : ''}
          <div class="flex gap-3 pt-2">
            <button onclick="App.closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">Cancel</button>
            <button onclick="App.addTask()" class="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shadow-sm">Add Task</button>
          </div>
        </div>
      </div>
    `);
  }

  function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const date = document.getElementById('taskDate').value;
    const goalEl = document.getElementById('taskGoal');
    const goalId = goalEl ? goalEl.value : '';

    if (!title) return;

    state.tasks.push({
      id: generateId(),
      title,
      date,
      goalId,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    save();
    closeModal();
    showToast('Task added');

    if (state.currentPage === 'Dashboard') renderDashboard();
    if (state.currentPage === 'Goals') renderGoals();
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;

    // Check if all today's tasks are done for streak
    const todayTasks = state.tasks.filter(t => t.date === getToday());
    const allDone = todayTasks.length > 0 && todayTasks.every(t => t.completed);
    if (allDone) {
      completeStreakDay();
      showToast('All tasks done! Streak updated 🔥');
    }

    save();
    renderDashboard();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
    renderDashboard();
  }

  // --- Add Goal ---
  function showAddGoal() {
    showModal(`
      <div class="p-6">
        <h2 class="font-display text-lg font-bold text-surface-900 mb-4">Create New Goal</h2>
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Goal title</label>
            <input type="text" id="goalTitle" placeholder="What do you want to achieve?" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white" autofocus>
          </div>
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Description (optional)</label>
            <textarea id="goalDesc" rows="2" placeholder="Why is this important to you?" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-surface-500 mb-1.5 block">Category</label>
              <select id="goalCategory" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="career">Career</option>
                <option value="learning">Learning</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 mb-1.5 block">Deadline</label>
              <input type="date" id="goalDeadline" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Milestones (one per line, optional)</label>
            <textarea id="goalMilestones" rows="3" placeholder="e.g.&#10;Research options&#10;Create plan&#10;Start executing" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button onclick="App.closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">Cancel</button>
            <button onclick="App.addGoal()" class="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shadow-sm">Create Goal</button>
          </div>
        </div>
      </div>
    `);
  }

  function addGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const description = document.getElementById('goalDesc').value.trim();
    const category = document.getElementById('goalCategory').value;
    const deadline = document.getElementById('goalDeadline').value;
    const milestonesText = document.getElementById('goalMilestones').value.trim();

    if (!title) return;

    const goalId = generateId();
    state.goals.push({
      id: goalId,
      title,
      description,
      category,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    // Create milestone tasks
    if (milestonesText) {
      const milestones = milestonesText.split('\n').filter(m => m.trim());
      milestones.forEach(m => {
        state.tasks.push({
          id: generateId(),
          title: m.trim(),
          date: deadline || getToday(),
          goalId,
          completed: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    save();
    closeModal();
    showToast('Goal created');
    renderGoals();
  }

  function showGoalDetail(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    const tasks = state.tasks.filter(t => t.goalId === id);
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : (goal.completed ? 100 : 0);

    showModal(`
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">${getCategoryIcon(goal.category)}</span>
            <div>
              <h2 class="font-display text-lg font-bold text-surface-900">${goal.title}</h2>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(goal.category)} border font-medium uppercase tracking-wider">${goal.category}</span>
            </div>
          </div>
          <button onclick="App.closeModal()" class="text-surface-400 hover:text-surface-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        ${goal.description ? `<p class="text-sm text-surface-500 mb-4">${goal.description}</p>` : ''}

        <div class="flex items-center gap-3 mb-4">
          <div class="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden">
            <div class="progress-bar h-full rounded-full ${goal.completed ? 'bg-emerald-500' : 'bg-brand-500'}" style="width: ${progress}%"></div>
          </div>
          <span class="text-sm font-bold ${goal.completed ? 'text-emerald-500' : 'text-brand-500'}">${progress}%</span>
        </div>

        ${goal.deadline ? `<p class="text-xs text-surface-400 mb-4 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Deadline: ${formatDate(goal.deadline)}
        </p>` : ''}

        ${tasks.length > 0 ? `
          <h3 class="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Milestones</h3>
          <div class="space-y-1 mb-4">
            ${tasks.map(task => `
              <div class="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-surface-50 transition-colors">
                <button onclick="App.toggleMilestone('${task.id}', '${goal.id}')" class="w-4.5 h-4.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-brand-500 border-brand-500' : 'border-surface-300 hover:border-brand-400'
                }" style="width:18px;height:18px">
                  ${task.completed ? '<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
                </button>
                <span class="text-sm ${task.completed ? 'line-through text-surface-400' : 'text-surface-700'}">${task.title}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Add milestone inline -->
        <div class="flex gap-2 mb-4">
          <input type="text" id="newMilestone" placeholder="Add a milestone..." class="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" onkeydown="if(event.key==='Enter')App.addMilestone('${goal.id}')">
          <button onclick="App.addMilestone('${goal.id}')" class="px-3 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors">
            <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>

        <div class="flex gap-2 pt-2 border-t border-surface-100">
          ${!goal.completed ? `<button onclick="App.completeGoal('${goal.id}')" class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Mark Complete</button>` : `<button onclick="App.uncompleteGoal('${goal.id}')" class="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-medium transition-colors">Reactivate</button>`}
          <button onclick="App.deleteGoal('${goal.id}')" class="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">Delete</button>
        </div>
      </div>
    `);
  }

  function addMilestone(goalId) {
    const input = document.getElementById('newMilestone');
    const title = input.value.trim();
    if (!title) return;

    const goal = state.goals.find(g => g.id === goalId);
    state.tasks.push({
      id: generateId(),
      title,
      date: goal?.deadline || getToday(),
      goalId,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    save();
    showGoalDetail(goalId);
    showToast('Milestone added');
  }

  function toggleMilestone(taskId, goalId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      save();
      showGoalDetail(goalId);
    }
  }

  function completeGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.completed = true;
      state.tasks.filter(t => t.goalId === id).forEach(t => t.completed = true);
      save();
      closeModal();
      showToast('Goal completed! 🎉');
      renderGoals();
      renderDashboard();
    }
  }

  function uncompleteGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.completed = false;
      save();
      closeModal();
      renderGoals();
    }
  }

  function deleteGoal(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    state.tasks = state.tasks.filter(t => t.goalId !== id);
    save();
    closeModal();
    showToast('Goal deleted');
    renderGoals();
    renderDashboard();
  }

  function filterGoals(filter) {
    state.currentGoalFilter = filter;
    document.querySelectorAll('.goal-filter').forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.className = `goal-filter ${isActive ? 'active' : ''} whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isActive ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
      }`;
    });
    renderGoals();
  }

  // --- Community ---
  function searchCommunity(query) {
    renderCommunity(query);
  }

  function filterCommunity(filter) {
    state.currentCommunityFilter = filter;
    document.querySelectorAll('.community-filter').forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.className = `community-filter ${isActive ? 'active' : ''} whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isActive ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
      }`;
    });
    renderCommunity(document.getElementById('communitySearch')?.value || '');
  }

  function connectPerson(id) {
    const person = communityPeople.find(p => p.id === id);
    if (person) {
      showToast(`Connection request sent to ${person.name}`);
    }
  }

  // --- Reminders ---
  function showAddReminder() {
    showModal(`
      <div class="p-6">
        <h2 class="font-display text-lg font-bold text-surface-900 mb-4">New Reminder</h2>
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Reminder</label>
            <input type="text" id="reminderTitle" placeholder="What should you remember?" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white" autofocus>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-surface-500 mb-1.5 block">Date</label>
              <input type="date" id="reminderDate" value="${getToday()}" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 mb-1.5 block">Time</label>
              <input type="time" id="reminderTime" value="09:00" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-surface-500 mb-1.5 block">Repeat</label>
            <select id="reminderRepeat" class="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white">
              <option value="none">Don't repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button onclick="App.closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">Cancel</button>
            <button onclick="App.addReminder()" class="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shadow-sm">Set Reminder</button>
          </div>
        </div>
      </div>
    `);
  }

  function addReminder() {
    const title = document.getElementById('reminderTitle').value.trim();
    const date = document.getElementById('reminderDate').value;
    const time = document.getElementById('reminderTime').value;
    const repeat = document.getElementById('reminderRepeat').value;

    if (!title || !date) return;

    state.reminders.push({
      id: generateId(),
      title,
      date,
      time,
      repeat,
      done: false,
      createdAt: new Date().toISOString(),
    });

    save();
    closeModal();
    showToast('Reminder set');
    renderReminders();
    renderDashboard();
  }

  function toggleReminder(id) {
    const reminder = state.reminders.find(r => r.id === id);
    if (!reminder) return;

    if (reminder.repeat !== 'none') {
      // Create next occurrence
      const nextDate = new Date(reminder.date);
      if (reminder.repeat === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      if (reminder.repeat === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      if (reminder.repeat === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

      state.reminders.push({
        id: generateId(),
        title: reminder.title,
        date: nextDate.toISOString().split('T')[0],
        time: reminder.time,
        repeat: reminder.repeat,
        done: false,
        createdAt: new Date().toISOString(),
      });
    }

    reminder.done = true;
    save();
    showToast('Reminder completed');
    renderReminders();
    renderDashboard();
  }

  function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    save();
    renderReminders();
    renderDashboard();
  }

  // --- Notification button ---
  function setupNotifButton() {
    document.getElementById('notifBtn').addEventListener('click', () => {
      const upcoming = state.reminders.filter(r => {
        if (r.done) return false;
        const d = new Date(r.date + 'T' + (r.time || '23:59'));
        const now = new Date();
        const diff = d - now;
        return diff > 0 && diff < 86400000;
      });

      if (upcoming.length === 0) {
        showToast('No upcoming notifications');
        return;
      }

      const list = upcoming.map(r => `• ${r.title} (${formatTime(r.time) || 'Today'})`).join('\n');

      showModal(`
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-lg font-bold text-surface-900">Upcoming</h2>
            <button onclick="App.closeModal()" class="text-surface-400 hover:text-surface-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="space-y-2">
            ${upcoming.map(r => `
              <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span class="text-amber-500">⏰</span>
                <div>
                  <p class="text-sm font-medium text-surface-800">${r.title}</p>
                  <p class="text-xs text-surface-400">${formatTime(r.time) || 'All day'}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `);
    });
  }

  // --- Keyboard shortcut for adding tasks ---
  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // --- Init ---
  function init() {
    load();
    checkStreak();
    renderDashboard();
    setupNotifButton();
    setupKeyboard();

    // Clean up old tasks (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    state.tasks = state.tasks.filter(t => t.date >= thirtyDaysAgo || t.goalId);
    save();
  }

  // --- Public API ---
  return {
    navigate,
    showAddTask,
    addTask,
    toggleTask,
    deleteTask,
    showAddGoal,
    addGoal,
    showGoalDetail,
    addMilestone,
    toggleMilestone,
    completeGoal,
    uncompleteGoal,
    deleteGoal,
    filterGoals,
    searchCommunity,
    filterCommunity,
    connectPerson,
    showAddReminder,
    addReminder,
    toggleReminder,
    deleteReminder,
    closeModal,
    init,
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);