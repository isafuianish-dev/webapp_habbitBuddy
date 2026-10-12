(function () {
  'use strict';

  var APP_KEY = 'webapp_habbitBuddy';
  var APP_VERSION = '001.001';
  var HABITS_KEY = APP_KEY + '.habits.v1';
  var ACTIVE_KEY = APP_KEY + '.activeHabitId.v1';




  var ICONS = Object.assign({}, Buddy.ICONS, { music: Buddy.icon('music') });
  var escapeHtml = Buddy.escapeHtml;

  var ICON_CHOICES = ['target', 'zap', 'activity', 'heart', 'book', 'utensils', 'users', 'house',
    'sun', 'moon', 'music', 'briefcase', 'compass', 'trendingUp', 'checkCircle', 'award'];
  var COLOR_CHOICES = ['indigo', 'blue', 'green', 'rose', 'amber', 'purple'];
  var COLOR_HEX = {
    indigo: { c: '#4f46e5', l: '#eef2ff' },
    blue: { c: '#2563eb', l: '#eff6ff' },
    green: { c: '#16a34a', l: '#f0fdf4' },
    rose: { c: '#e11d48', l: '#fff1f2' },
    amber: { c: '#d97706', l: '#fffbeb' },
    purple: { c: '#7c3aed', l: '#f5f3ff' }
  };
  var MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var dom = {};
  var state = {
    habits: [],
    activeId: null,
    search: ''
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    initStaticIcons();
    bindGlobalEvents();

    state.habits = loadHabits();
    var savedActive = loadActiveId();
    if (savedActive && findHabit(savedActive)) state.activeId = savedActive;
    else if (state.habits.length) state.activeId = sortedHabits()[0].id;

    renderHabitList();
    renderHabitDetail();
  }

  function cacheDom() {
    dom.btnSettings = document.getElementById('btnSettings');

    dom.habitSearch = document.getElementById('habitSearch');
    dom.btnAddHabit = document.getElementById('btnAddHabit');
    dom.btnExportAll = document.getElementById('btnExportAll');
    dom.fileImportData = document.getElementById('fileImportData');
    dom.fileBtnIcon = document.getElementById('fileBtnIcon');
    dom.habitList = document.getElementById('habitList');
    dom.habitListEmpty = document.getElementById('habitListEmpty');

    dom.emptyState = document.getElementById('emptyState');

    dom.habitDetail = document.getElementById('habitDetail');
    dom.habitDetailIcon = document.getElementById('habitDetailIcon');
    dom.habitDetailTitle = document.getElementById('habitDetailTitle');
    dom.habitDetailSince = document.getElementById('habitDetailSince');
    dom.btnEditHabit = document.getElementById('btnEditHabit');
    dom.btnDeleteHabit = document.getElementById('btnDeleteHabit');

    dom.btnToggleToday = document.getElementById('btnToggleToday');
    dom.btnToggleTodayIcon = document.getElementById('btnToggleTodayIcon');
    dom.btnToggleTodayLabel = document.getElementById('btnToggleTodayLabel');

    dom.habitStats = document.getElementById('habitStats');
    dom.heatmapYear = document.getElementById('heatmapYear');
    dom.heatmapCalendar = document.getElementById('heatmapCalendar');

    dom.confettiLayer = document.getElementById('confettiLayer');
  }

  function initStaticIcons() {
    dom.btnSettings.innerHTML = ICONS.settings;
    dom.btnExportAll.innerHTML = ICONS.download;
    dom.fileBtnIcon.innerHTML = ICONS.upload;
    dom.btnEditHabit.innerHTML = ICONS.edit;
    dom.btnDeleteHabit.innerHTML = ICONS.trash;
  }

  function bindGlobalEvents() {
    dom.btnSettings.addEventListener('click', openSettingsModal);
    dom.btnAddHabit.addEventListener('click', function () { openHabitModal(null); });

    dom.btnExportAll.addEventListener('click', exportAllData);
    dom.fileImportData.addEventListener('change', function () {
      var file = this.files[0];
      if (file) importDataFromFile(file);
      this.value = '';
    });
    dom.habitListEmpty.addEventListener('click', function (e) {
      if (e.target.closest('#linkLoadSampleSidebar')) handleLoadSample(e);
    });

    dom.habitSearch.addEventListener('input', function () {
      state.search = dom.habitSearch.value;
      renderHabitList();
    });

    dom.btnEditHabit.addEventListener('click', function () {
      var habit = getActiveHabit();
      if (habit) openHabitModal(habit);
    });
    dom.btnDeleteHabit.addEventListener('click', function () {
      var habit = getActiveHabit();
      if (habit) confirmAndDeleteHabit(habit.id);
    });
    dom.btnToggleToday.addEventListener('click', function () {
      var habit = getActiveHabit();
      if (habit) toggleHabitToday(habit);
    });
  }



  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function toISODate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function formatFullDate(d) { return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }



  function loadHabits() {
    try {
      var raw = localStorage.getItem(HABITS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(function (h) {
        h.completions = h.completions || {};
        return h;
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHabits() {
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(state.habits)); } catch (e) {}
  }

  function loadActiveId() {
    try { return localStorage.getItem(ACTIVE_KEY); } catch (e) { return null; }
  }

  function saveActiveId() {
    try {
      if (state.activeId) localStorage.setItem(ACTIVE_KEY, state.activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch (e) {}
  }



  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function findHabit(id) {
    return state.habits.filter(function (h) { return h.id === id; })[0];
  }

  function getActiveHabit() {
    return state.activeId ? findHabit(state.activeId) : null;
  }

  function sortedHabits() {
    return state.habits.slice().sort(function (a, b) { return a.createdAt - b.createdAt; });
  }

  function filteredSortedHabits() {
    var q = state.search.trim().toLowerCase();
    var list = sortedHabits();
    if (!q) return list;
    return list.filter(function (h) { return (h.name || '').toLowerCase().indexOf(q) !== -1; });
  }

  function selectHabit(id) {
    if (state.activeId === id) return;
    state.activeId = id;
    saveActiveId();
    renderHabitList();
    renderHabitDetail();
  }

  function confirmAndDeleteHabit(id) {
    var habit = findHabit(id);
    if (!habit) return;
    openConfirmModal('Delete Habit', 'Delete "' + (habit.name || 'Untitled habit') + '" and all of its tracked history? This cannot be undone.', 'Delete', function () {
      state.habits = state.habits.filter(function (h) { return h.id !== id; });
      saveHabits();
      if (state.activeId === id) {
        var remaining = sortedHabits();
        state.activeId = remaining.length ? remaining[0].id : null;
        saveActiveId();
        renderHabitDetail();
      }
      renderHabitList();
    }, { danger: true });
  }

  function toggleHabitToday(habit) {
    var todayKey = toISODate(startOfDay(new Date()));
    var wasDone = !!habit.completions[todayKey];
    if (wasDone) delete habit.completions[todayKey];
    else habit.completions[todayKey] = true;
    saveHabits();
    renderHabitList();
    if (habit.id === state.activeId) renderHabitDetail();
    if (!wasDone) spawnConfetti();
  }



  function currentStreak(habit) {
    var today = startOfDay(new Date());
    var cursor = habit.completions[toISODate(today)] ? today : addDays(today, -1);
    var streak = 0;
    while (habit.completions[toISODate(cursor)]) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function bestStreak(habit) {
    var dates = Object.keys(habit.completions).filter(function (k) { return habit.completions[k]; }).sort();
    if (!dates.length) return 0;
    var best = 1, run = 1;
    for (var i = 1; i < dates.length; i++) {
      var diff = Math.round((new Date(dates[i] + 'T00:00:00') - new Date(dates[i - 1] + 'T00:00:00')) / 86400000);
      run = diff === 1 ? run + 1 : 1;
      if (run > best) best = run;
    }
    return best;
  }

  function totalDays(habit) {
    return Object.keys(habit.completions).filter(function (k) { return habit.completions[k]; }).length;
  }

  function completionRate30(habit) {
    var today = startOfDay(new Date());
    var count = 0;
    for (var i = 0; i < 30; i++) {
      if (habit.completions[toISODate(addDays(today, -i))]) count++;
    }
    return Math.round((count / 30) * 100);
  }



  function renderHabitList() {
    var list = filteredSortedHabits();
    var noMatches = state.habits.length > 0 && list.length === 0;
    if (state.habits.length === 0) {
      dom.habitListEmpty.hidden = false;
      dom.habitListEmpty.innerHTML = 'No habits yet. <a href="#" id="linkLoadSampleSidebar" class="link-accent">Load sample</a>.';
    } else if (noMatches) {
      dom.habitListEmpty.hidden = false;
      dom.habitListEmpty.textContent = 'No habits match your search.';
    } else {
      dom.habitListEmpty.hidden = true;
    }

    var todayKey = toISODate(startOfDay(new Date()));

    dom.habitList.innerHTML = list.map(function (h) {
      var hex = COLOR_HEX[h.color] || COLOR_HEX.indigo;
      var isDone = !!h.completions[todayKey];
      var streak = currentStreak(h);
      return '<li class="habit-item' + (h.id === state.activeId ? ' active' : '') + '" data-id="' + h.id + '" style="--habit-color:' + hex.c + ';--habit-color-light:' + hex.l + '">' +
        '<label class="checkbox-custom habit-check-wrap" title="Mark today done">' +
        '<input type="checkbox" class="habit-today-checkbox" data-id="' + h.id + '"' + (isDone ? ' checked' : '') + '>' +
        '<span class="checkbox-box">' + ICONS.check + '</span>' +
        '</label>' +
        '<span class="habit-item-icon">' + (ICONS[h.icon] || ICONS.target) + '</span>' +
        '<span class="habit-item-body">' +
        '<span class="habit-item-name">' + escapeHtml(h.name || 'Untitled habit') + '</span>' +
        '<span class="habit-item-streak">' + ICONS.zap + '<span>' + streak + (streak === 1 ? ' day' : ' days') + '</span></span>' +
        '</span>' +
        '<button type="button" class="habit-item-delete" data-id="' + h.id + '" title="Delete" aria-label="Delete habit">' + ICONS.trash + '</button>' +
        '</li>';
    }).join('');

    dom.habitList.querySelectorAll('.habit-item').forEach(function (li) {
      li.addEventListener('click', function (e) {
        if (e.target.closest('.habit-item-delete') || e.target.closest('.habit-check-wrap')) return;
        selectHabit(li.getAttribute('data-id'));
      });
    });
    dom.habitList.querySelectorAll('.habit-today-checkbox').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var habit = findHabit(cb.getAttribute('data-id'));
        if (habit) toggleHabitToday(habit);
      });
    });
    dom.habitList.querySelectorAll('.habit-item-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        confirmAndDeleteHabit(btn.getAttribute('data-id'));
      });
    });
  }



  function statCardHtml(icon, label, value) {
    return '<div class="stat-card"><span class="stat-icon">' + ICONS[icon] + '</span>' +
      '<div class="stat-body"><span class="stat-label">' + escapeHtml(label) + '</span>' +
      '<span class="stat-value">' + escapeHtml(value) + '</span></div></div>';
  }

  function renderHabitDetail() {
    var habit = getActiveHabit();
    if (!habit) {
      dom.emptyState.hidden = false;
      dom.habitDetail.hidden = true;
      return;
    }
    dom.emptyState.hidden = true;
    dom.habitDetail.hidden = false;

    var hex = COLOR_HEX[habit.color] || COLOR_HEX.indigo;
    dom.habitDetail.style.setProperty('--habit-color', hex.c);
    dom.habitDetail.style.setProperty('--habit-color-light', hex.l);

    dom.habitDetailIcon.innerHTML = ICONS[habit.icon] || ICONS.target;
    dom.habitDetailTitle.textContent = habit.name || 'Untitled habit';
    dom.habitDetailSince.textContent = 'Tracking since ' + formatFullDate(new Date(habit.createdAt));

    var todayKey = toISODate(startOfDay(new Date()));
    var isDoneToday = !!habit.completions[todayKey];
    dom.btnToggleToday.classList.toggle('is-done', isDoneToday);
    dom.btnToggleTodayIcon.innerHTML = ICONS.checkCircle;
    dom.btnToggleTodayLabel.textContent = isDoneToday ? 'Done today' : 'Mark today done';

    var streak = currentStreak(habit);
    var best = bestStreak(habit);
    var total = totalDays(habit);
    var rate = completionRate30(habit);

    dom.habitStats.innerHTML = [
      statCardHtml('zap', 'Current Streak', streak + (streak === 1 ? ' day' : ' days')),
      statCardHtml('award', 'Best Streak', best + (best === 1 ? ' day' : ' days')),
      statCardHtml('checkCircle', 'Total Days', String(total)),
      statCardHtml('trendingUp', 'Last 30 Days', rate + '%')
    ].join('');

    renderHeatmap(habit);
  }



  var CALENDAR_CELLS = 42;

  function monthCellsHtml(habit, year, month, today, todayKey) {
    var firstWeekday = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var html = '';
    for (var i = 0; i < firstWeekday; i++) html += '<span class="month-cell is-pad"></span>';

    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day);
      var key = toISODate(date);
      var isFuture = date > today;
      var isFilled = !isFuture && !!habit.completions[key];
      var cls = 'month-cell' + (isFuture ? ' is-future' : '') + (isFilled ? ' is-filled' : '') + (key === todayKey ? ' is-today' : '');
      var title = escapeHtml(formatFullDate(date)) + (isFilled ? ' — done' : '');
      html += '<span class="' + cls + '" title="' + title + '">' + day + '</span>';
    }

    var trailing = CALENDAR_CELLS - firstWeekday - daysInMonth;
    for (var t = 0; t < trailing; t++) html += '<span class="month-cell is-pad"></span>';

    return html;
  }

  var WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  var weekdayRowHtml = '<div class="month-weekday-row">' +
    WEEKDAY_LABELS.map(function (d) { return '<span>' + d + '</span>'; }).join('') +
    '</div>';

  function renderHeatmap(habit) {
    var today = startOfDay(new Date());
    var todayKey = toISODate(today);
    var year = today.getFullYear();
    dom.heatmapYear.textContent = String(year);

    var html = '';
    for (var m = 0; m < 12; m++) {
      html += '<div class="month-card">' +
        '<span class="month-card-label">' + MONTH_LABELS[m] + '</span>' +
        weekdayRowHtml +
        '<div class="month-grid">' + monthCellsHtml(habit, year, m, today, todayKey) + '</div>' +
        '</div>';
    }
    dom.heatmapCalendar.innerHTML = html;
  }



  function spawnConfetti() {
    if (window.Buddy && Buddy.theme && Buddy.theme.isMotionReduced()) return;
    var colors = ['#4f46e5', '#2563eb', '#16a34a', '#e11d48', '#d97706', '#7c3aed', '#eab308', '#0891b2'];
    var count = 60;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti-piece';

      var left = Math.random() * 100;
      var driftX = Math.round(Math.random() * 200 - 100);
      var fallY = window.innerHeight + 40;
      var spin = Math.round(Math.random() * 720 - 360);
      var duration = Math.round(1800 + Math.random() * 1400);
      var delay = Math.round(Math.random() * 400);
      var color = colors[Math.floor(Math.random() * colors.length)];

      piece.style.left = left + 'vw';
      piece.style.setProperty('--drift-x', driftX + 'px');
      piece.style.setProperty('--fall-y', fallY + 'px');
      piece.style.setProperty('--spin', spin + 'deg');
      piece.style.setProperty('--confetti-color', color);
      piece.style.animationDuration = duration + 'ms';
      piece.style.animationDelay = delay + 'ms';
      if (Math.random() < 0.5) piece.style.borderRadius = '50%';

      piece.addEventListener('animationend', function () { this.remove(); });
      dom.confettiLayer.appendChild(piece);
    }
  }



  function openHabitModal(existing) {
    var name = existing ? existing.name : '';
    var selectedIcon = existing ? existing.icon : ICON_CHOICES[0];
    var selectedColor = existing ? existing.color : COLOR_CHOICES[0];

    var iconButtonsHtml = ICON_CHOICES.map(function (ic) {
      return '<button type="button" class="icon-picker-btn' + (ic === selectedIcon ? ' active' : '') + '" data-icon="' + ic + '" title="' + ic + '" aria-label="' + ic + '">' + ICONS[ic] + '</button>';
    }).join('');

    var colorButtonsHtml = COLOR_CHOICES.map(function (cid) {
      return '<button type="button" class="accent-swatch' + (cid === selectedColor ? ' active' : '') + '" data-accent-choice="' + cid + '" title="' + cid + '" aria-label="' + cid + '">' + ICONS.check + '</button>';
    }).join('');

    var html =
      '<div class="form-group"><label for="habitNameInput">Name</label>' +
      '<input type="text" id="habitNameInput" class="form-control" placeholder="e.g. Drink water" value="' + escapeHtml(name) + '"></div>' +
      '<div class="form-group"><label>Icon</label><div class="icon-picker-grid" id="iconPickerGrid">' + iconButtonsHtml + '</div></div>' +
      '<div class="form-group"><label>Color</label><div class="accent-swatch-list" id="colorPickerList">' + colorButtonsHtml + '</div></div>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="btnHabitCancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="btnHabitSave">' + (existing ? 'Save' : 'Add Habit') + '</button>' +
      '</div>';

    openModal(existing ? 'Edit Habit' : 'Add Habit', html, function (body) {
      var nameInput = body.querySelector('#habitNameInput');
      nameInput.focus();

      body.querySelectorAll('#iconPickerGrid [data-icon]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectedIcon = btn.getAttribute('data-icon');
          body.querySelectorAll('#iconPickerGrid [data-icon]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        });
      });
      body.querySelectorAll('#colorPickerList [data-accent-choice]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectedColor = btn.getAttribute('data-accent-choice');
          body.querySelectorAll('#colorPickerList [data-accent-choice]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        });
      });

      body.querySelector('#btnHabitCancel').addEventListener('click', closeModal);
      body.querySelector('#btnHabitSave').addEventListener('click', function () {
        var val = nameInput.value.trim();
        if (!val) { nameInput.focus(); return; }

        if (existing) {
          existing.name = val;
          existing.icon = selectedIcon;
          existing.color = selectedColor;
        } else {
          var habit = { id: generateId(), name: val, icon: selectedIcon, color: selectedColor, createdAt: Date.now(), completions: {} };
          state.habits.push(habit);
          state.activeId = habit.id;
          saveActiveId();
        }
        saveHabits();
        closeModal();
        renderHabitList();
        renderHabitDetail();
      });
    }, { autoSize: true });
  }



  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportAllData() {
    var payload = { habits: state.habits };
    downloadFile('habitbuddy-export.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  function showImportError() {
    openInfoModal('Import Failed', 'Could not import that file. Make sure it is a HabitBuddy JSON export.');
  }

  function openImportConflictModal(onReplace, onAppend) {
    var html =
      '<p class="modal-message">You already have habits saved. Append the imported habits to what you have, ' +
      'or clean up and replace everything with the imported file?</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnImportAppend">Append</button>' +
      '<button class="btn btn-danger" id="btnImportReplace">Cleanup &amp; Replace</button>' +
      '</div>';
    openModal('Import Data', html, function (body) {
      body.querySelector('#btnImportAppend').addEventListener('click', function () {
        closeModal();
        onAppend();
      });
      body.querySelector('#btnImportReplace').addEventListener('click', function () {
        closeModal();
        onReplace();
      });
    }, { autoSize: true });
  }





  function remapPayload(data) {
    var incomingHabits = Array.isArray(data.habits) ? data.habits : (Array.isArray(data) ? data : []);
    var today = startOfDay(new Date());

    return incomingHabits.map(function (h) {
      var createdAt = typeof h.createdAtDaysAgo === 'number'
        ? addDays(today, -h.createdAtDaysAgo).getTime()
        : (h.createdAt || Date.now());

      var completions = {};
      if (Array.isArray(h.completionsDaysAgo)) {
        h.completionsDaysAgo.forEach(function (n) {
          if (typeof n === 'number' && n >= 0) completions[toISODate(addDays(today, -n))] = true;
        });
      } else if (h.completions && typeof h.completions === 'object') {
        Object.keys(h.completions).forEach(function (k) {
          if (h.completions[k]) completions[k] = true;
        });
      }

      return {
        id: generateId(),
        name: (h.name ? String(h.name).trim() : '') || 'Untitled habit',
        icon: ICONS[h.icon] ? h.icon : ICON_CHOICES[0],
        color: COLOR_HEX[h.color] ? h.color : COLOR_CHOICES[0],
        createdAt: createdAt,
        completions: completions
      };
    });
  }

  function applyImportedData(newHabits, replaceExisting) {
    if (replaceExisting) {
      state.habits = newHabits;
    } else {
      state.habits = state.habits.concat(newHabits);
    }
    saveHabits();
    if (!state.activeId || !findHabit(state.activeId)) {
      var sorted = sortedHabits();
      state.activeId = sorted.length ? sorted[0].id : null;
      saveActiveId();
    }
    renderHabitList();
    renderHabitDetail();
  }

  function importDataFromFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try {
        data = JSON.parse(reader.result);
      } catch (e) {
        showImportError();
        return;
      }

      if (!data || (!Array.isArray(data) && !Array.isArray(data.habits))) {
        showImportError();
        return;
      }

      var remapped = remapPayload(data);
      var hasExistingData = state.habits.length > 0;
      if (hasExistingData) {
        openImportConflictModal(
          function () { applyImportedData(remapped, true); },
          function () { applyImportedData(remapped, false); }
        );
      } else {
        applyImportedData(remapped, false);
      }
    };
    reader.readAsText(file);
  }

  function handleLoadSample(e) {
    e.preventDefault();
    if (window.location.protocol === 'file:') {
      openInfoModal(
        'Server Required',
        'Loading sample data needs the app to be served from a local or remote server — it can\'t read local files when index.html is opened directly from your file system. Instead, download habbitBuddy_sample.json from cdnBuddy/samples and use the Import button (top-left) to load it.'
      );
      return;
    }
    fetch('https://isafuianish-dev.github.io/webapp_cdnBuddy/samples/habbitBuddy_sample.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(function (parsed) {
        if (!parsed || !Array.isArray(parsed.habits) || !parsed.habits.length) throw new Error('Invalid data');
        applyImportedData(remapPayload(parsed), false);
      })
      .catch(function () {
        openInfoModal('Load Failed', 'Could not load the sample data.');
      });
  }



  var modalApi = Buddy.modal.init();
  var openModal = modalApi.open;
  var closeModal = modalApi.close;

  function openConfirmModal(title, message, confirmLabel, onConfirm, opts) {
    opts = opts || {};
    var danger = opts.danger ? 'btn-danger' : 'btn-primary';
    var html =
      '<p class="modal-message">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnConfirmNo">Cancel</button>' +
      '<button class="btn ' + danger + '" id="btnConfirmYes">' + escapeHtml(confirmLabel) + '</button>' +
      '</div>';
    openModal(title, html, function (body) {
      body.querySelector('#btnConfirmNo').addEventListener('click', closeModal);
      body.querySelector('#btnConfirmYes').addEventListener('click', function () {
        closeModal();
        onConfirm();
      });
    }, { autoSize: true });
  }

  function openInfoModal(title, message) {
    var html =
      '<p class="modal-message">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-primary" id="btnInfoOk">OK</button>' +
      '</div>';
    openModal(title, html, function (body) {
      body.querySelector('#btnInfoOk').addEventListener('click', closeModal);
    }, { autoSize: true });
  }

  function openSettingsModal() {
    Buddy.settings.open(APP_KEY, openModal, closeModal, { appVersion: APP_VERSION });
  }
})();
