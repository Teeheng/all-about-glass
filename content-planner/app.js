(function () {
  "use strict";

  const STORAGE_KEY = "contentPlannerData_v1";
  const STATUS_LABELS = { idea: "Idea", draft: "Draft", review: "Review", published: "Published" };

  function uid() {
    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn("Could not parse stored data", e); }
    return {
      items: [],
      themes: [
        { id: uid(), name: "โปรโมชั่น", color: "#2f9e8f" },
        { id: uid(), name: "ให้ความรู้/เคล็ดลับ", color: "#4a7bd8" },
        { id: uid(), name: "รีวิวลูกค้า", color: "#c98a2d" }
      ],
      settings: { apiKey: "" }
    };
  }

  let data = loadData();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ---------- Theme (light/dark) ----------
  const themeToggleBtn = document.getElementById("theme-toggle");
  function applyUiTheme(mode) {
    if (mode) document.documentElement.setAttribute("data-theme", mode);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyUiTheme(localStorage.getItem("cp_ui_theme") || "");
  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : current === "light" ? "" : "dark";
    applyUiTheme(next);
    localStorage.setItem("cp_ui_theme", next);
  });

  // ---------- Tabs ----------
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      views.forEach((v) => v.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("view-" + tab.dataset.view).classList.add("active");
      if (tab.dataset.view === "calendar") renderCalendar();
      if (tab.dataset.view === "kanban") renderKanban();
      if (tab.dataset.view === "ideas") renderIdeas();
    });
  });

  // ---------- Theme select helpers ----------
  function populateThemeSelects() {
    const selects = [document.getElementById("item-theme"), document.getElementById("idea-theme-filter")];
    selects.forEach((sel) => {
      const keepValue = sel.value;
      const isFilter = sel.id === "idea-theme-filter";
      sel.innerHTML = isFilter ? '<option value="">ทุกธีม</option>' : '<option value="">— ไม่มี —</option>';
      data.themes.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.name;
        opt.textContent = t.name;
        sel.appendChild(opt);
      });
      sel.value = keepValue;
    });
  }

  function themeColor(name) {
    const t = data.themes.find((x) => x.name === name);
    return t ? t.color : null;
  }

  // ---------- Item Modal (add/edit content item) ----------
  const itemModalOverlay = document.getElementById("item-modal-overlay");
  const itemModalTitle = document.getElementById("item-modal-title");
  const fTitle = document.getElementById("item-title");
  const fPlatform = document.getElementById("item-platform");
  const fStatus = document.getElementById("item-status");
  const fDate = document.getElementById("item-date");
  const fTheme = document.getElementById("item-theme");
  const fTags = document.getElementById("item-tags");
  const fNotes = document.getElementById("item-notes");
  const itemDeleteBtn = document.getElementById("item-delete");

  let editingItemId = null;

  function openItemModal(opts) {
    opts = opts || {};
    populateThemeSelects();
    editingItemId = opts.id || null;
    itemModalTitle.textContent = editingItemId ? "แก้ไขงาน Content" : "เพิ่มงาน Content";
    if (editingItemId) {
      const item = data.items.find((i) => i.id === editingItemId);
      fTitle.value = item.title || "";
      fPlatform.value = item.platform || "Facebook";
      fStatus.value = item.status || "idea";
      fDate.value = item.date || "";
      fTheme.value = item.theme || "";
      fTags.value = (item.tags || []).join(", ");
      fNotes.value = item.notes || "";
      itemDeleteBtn.style.display = "inline-block";
    } else {
      fTitle.value = "";
      fPlatform.value = "Facebook";
      fStatus.value = opts.status || "idea";
      fDate.value = opts.date || "";
      fTheme.value = "";
      fTags.value = "";
      fNotes.value = "";
      itemDeleteBtn.style.display = "none";
    }
    itemModalOverlay.classList.add("open");
    fTitle.focus();
  }

  function closeItemModal() {
    itemModalOverlay.classList.remove("open");
    editingItemId = null;
  }

  document.getElementById("item-modal-close").addEventListener("click", closeItemModal);
  document.getElementById("item-cancel").addEventListener("click", closeItemModal);
  itemModalOverlay.addEventListener("click", (e) => { if (e.target === itemModalOverlay) closeItemModal(); });

  document.getElementById("item-save").addEventListener("click", () => {
    const title = fTitle.value.trim();
    if (!title) { fTitle.focus(); return; }
    const tags = fTags.value.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title,
      platform: fPlatform.value,
      status: fStatus.value,
      date: fDate.value || "",
      theme: fTheme.value || "",
      tags,
      notes: fNotes.value
    };
    if (editingItemId) {
      const item = data.items.find((i) => i.id === editingItemId);
      Object.assign(item, payload);
    } else {
      data.items.push(Object.assign({ id: uid(), createdAt: Date.now() }, payload));
    }
    save();
    closeItemModal();
    renderAll();
  });

  itemDeleteBtn.addEventListener("click", () => {
    if (!editingItemId) return;
    if (!confirm("ลบงานนี้?")) return;
    data.items = data.items.filter((i) => i.id !== editingItemId);
    save();
    closeItemModal();
    renderAll();
  });

  document.getElementById("cal-add").addEventListener("click", () => openItemModal({}));
  document.getElementById("kanban-add").addEventListener("click", () => openItemModal({}));

  // ---------- Calendar ----------
  let calYear, calMonth; // calMonth 0-11
  (function initCalDate() {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
  })();

  const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  function renderCalendarWeekdays() {
    const el = document.getElementById("cal-weekdays");
    el.innerHTML = "";
    WEEKDAYS_TH.forEach((d) => {
      const div = document.createElement("div");
      div.className = "weekday";
      div.textContent = d;
      el.appendChild(div);
    });
  }

  function fmtDateISO(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function renderCalendar() {
    const monthNames = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    document.getElementById("cal-title").textContent = `${monthNames[calMonth]} ${calYear + 543}`;

    const grid = document.getElementById("cal-grid");
    grid.innerHTML = "";

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayISO = fmtDateISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = fmtDateISO(calYear, calMonth, day);
      const cell = document.createElement("div");
      cell.className = "day-cell" + (iso === todayISO ? " today" : "");
      const num = document.createElement("div");
      num.className = "day-num";
      num.textContent = day;
      cell.appendChild(num);

      data.items.filter((i) => i.date === iso).forEach((item) => {
        const chip = document.createElement("div");
        chip.className = "item-chip status-" + item.status;
        chip.textContent = item.title;
        const color = themeColor(item.theme);
        if (color) { chip.style.background = color + "22"; chip.style.color = color; chip.style.borderLeftColor = color; }
        chip.title = `${item.platform} · ${STATUS_LABELS[item.status]}`;
        chip.addEventListener("click", (e) => { e.stopPropagation(); openItemModal({ id: item.id }); });
        cell.appendChild(chip);
      });

      cell.addEventListener("click", () => openItemModal({ date: iso }));
      grid.appendChild(cell);
    }
  }

  document.getElementById("cal-prev").addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // ---------- Kanban ----------
  function renderKanban() {
    ["idea", "draft", "review", "published"].forEach((status) => {
      const list = document.getElementById("list-" + status);
      list.innerHTML = "";
      const itemsForStatus = data.items.filter((i) => i.status === status);
      document.getElementById("count-" + status).textContent = itemsForStatus.length;
      itemsForStatus.forEach((item) => {
        const card = document.createElement("div");
        card.className = "kanban-card";
        card.draggable = true;
        card.dataset.id = item.id;

        const title = document.createElement("div");
        title.className = "card-title";
        title.textContent = item.title;
        card.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "card-meta";
        const platformPill = document.createElement("span");
        platformPill.className = "tag-pill";
        platformPill.textContent = item.platform;
        meta.appendChild(platformPill);
        if (item.date) {
          const datePill = document.createElement("span");
          datePill.textContent = item.date;
          meta.appendChild(datePill);
        }
        if (item.theme) {
          const themePill = document.createElement("span");
          themePill.className = "tag-pill";
          themePill.textContent = item.theme;
          const color = themeColor(item.theme);
          if (color) { themePill.style.background = color + "22"; themePill.style.color = color; }
          meta.appendChild(themePill);
        }
        card.appendChild(meta);

        card.addEventListener("click", () => openItemModal({ id: item.id }));
        card.addEventListener("dragstart", () => card.classList.add("dragging"));
        card.addEventListener("dragend", () => card.classList.remove("dragging"));

        list.appendChild(card);
      });
    });
  }

  document.querySelectorAll(".kanban-list").forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      list.classList.add("drag-over");
    });
    list.addEventListener("dragleave", () => list.classList.remove("drag-over"));
    list.addEventListener("drop", (e) => {
      e.preventDefault();
      list.classList.remove("drag-over");
      const dragging = document.querySelector(".kanban-card.dragging");
      if (!dragging) return;
      const id = dragging.dataset.id;
      const item = data.items.find((i) => i.id === id);
      const newStatus = list.closest(".kanban-col").dataset.status;
      if (item) {
        item.status = newStatus;
        save();
        renderKanban();
        if (document.getElementById("view-calendar").classList.contains("active")) renderCalendar();
      }
    });
  });

  // ---------- Ideas library ----------
  function renderIdeas() {
    populateThemeSelects();
    const grid = document.getElementById("idea-grid");
    grid.innerHTML = "";
    const search = document.getElementById("idea-search").value.trim().toLowerCase();
    const themeFilter = document.getElementById("idea-theme-filter").value;

    const filtered = data.items.filter((item) => {
      if (themeFilter && item.theme !== themeFilter) return false;
      if (!search) return true;
      const hay = [item.title, item.notes, item.theme, ...(item.tags || [])].join(" ").toLowerCase();
      return hay.includes(search);
    });

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "ยังไม่มี idea ที่ตรงกับเงื่อนไข ลองเพิ่ม idea ใหม่ หรือใช้ AI Assist ช่วยคิด";
      grid.appendChild(empty);
      return;
    }

    filtered
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((item) => {
        const card = document.createElement("div");
        card.className = "card idea-card";

        const title = document.createElement("div");
        title.className = "card-title";
        title.textContent = item.title;
        card.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "card-meta";
        meta.style.marginBottom = "8px";
        const statusPill = document.createElement("span");
        statusPill.className = "tag-pill";
        statusPill.textContent = STATUS_LABELS[item.status];
        meta.appendChild(statusPill);
        if (item.theme) {
          const themePill = document.createElement("span");
          themePill.className = "tag-pill";
          themePill.textContent = item.theme;
          meta.appendChild(themePill);
        }
        (item.tags || []).forEach((tag) => {
          const p = document.createElement("span");
          p.className = "tag-pill";
          p.textContent = "#" + tag;
          meta.appendChild(p);
        });
        card.appendChild(meta);

        if (item.notes) {
          const notes = document.createElement("div");
          notes.className = "card-notes";
          notes.textContent = item.notes.length > 140 ? item.notes.slice(0, 140) + "…" : item.notes;
          card.appendChild(notes);
        }

        const actions = document.createElement("div");
        actions.className = "card-actions";
        const editBtn = document.createElement("button");
        editBtn.className = "btn ghost";
        editBtn.textContent = "แก้ไข";
        editBtn.addEventListener("click", () => openItemModal({ id: item.id }));
        actions.appendChild(editBtn);
        card.appendChild(actions);

        grid.appendChild(card);
      });
  }

  document.getElementById("idea-add").addEventListener("click", () => openItemModal({}));
  document.getElementById("idea-search").addEventListener("input", renderIdeas);
  document.getElementById("idea-theme-filter").addEventListener("change", renderIdeas);

  // ---------- Theme manage modal ----------
  const themeModalOverlay = document.getElementById("theme-modal-overlay");
  document.getElementById("theme-manage-btn").addEventListener("click", () => {
    renderThemeList();
    themeModalOverlay.classList.add("open");
  });
  document.getElementById("theme-modal-close").addEventListener("click", () => themeModalOverlay.classList.remove("open"));
  document.getElementById("theme-modal-done").addEventListener("click", () => {
    themeModalOverlay.classList.remove("open");
    populateThemeSelects();
    renderIdeas();
  });
  themeModalOverlay.addEventListener("click", (e) => { if (e.target === themeModalOverlay) themeModalOverlay.classList.remove("open"); });

  function renderThemeList() {
    const list = document.getElementById("theme-list");
    list.innerHTML = "";
    data.themes.forEach((t) => {
      const row = document.createElement("div");
      row.className = "theme-row";
      const swatch = document.createElement("div");
      swatch.className = "theme-swatch";
      swatch.style.background = t.color;
      const name = document.createElement("span");
      name.textContent = t.name;
      const delBtn = document.createElement("button");
      delBtn.className = "btn ghost";
      delBtn.textContent = "ลบ";
      delBtn.addEventListener("click", () => {
        data.themes = data.themes.filter((x) => x.id !== t.id);
        save();
        renderThemeList();
      });
      row.appendChild(swatch);
      row.appendChild(name);
      row.appendChild(delBtn);
      list.appendChild(row);
    });
  }

  document.getElementById("theme-add-btn").addEventListener("click", () => {
    const nameInput = document.getElementById("theme-name-input");
    const colorInput = document.getElementById("theme-color-input");
    const name = nameInput.value.trim();
    if (!name) return;
    data.themes.push({ id: uid(), name, color: colorInput.value });
    save();
    nameInput.value = "";
    renderThemeList();
  });

  // ---------- AI Assist ----------
  const apiKeyInput = document.getElementById("api-key-input");
  const apiKeyStatus = document.getElementById("api-key-status");

  apiKeyInput.value = data.settings.apiKey || "";
  if (data.settings.apiKey) {
    apiKeyStatus.textContent = "บันทึก API key ไว้แล้ว";
    apiKeyStatus.className = "status-line ok";
  }

  document.getElementById("api-key-toggle").addEventListener("click", () => {
    apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
  });

  document.getElementById("api-key-save").addEventListener("click", () => {
    data.settings.apiKey = apiKeyInput.value.trim();
    save();
    apiKeyStatus.textContent = data.settings.apiKey ? "บันทึกแล้ว" : "ล้าง API key แล้ว";
    apiKeyStatus.className = "status-line ok";
  });

  function promptForMode(mode, context, platform) {
    if (mode === "ideas") {
      return `ช่วยคิดหัวข้อ/ไอเดีย content สำหรับธุรกิจกระจกและอลูมิเนียม (All About Glass) โพสต์ลง ${platform}\n\nบริบท: ${context}\n\nช่วยเสนอไอเดีย 5 หัวข้อ แต่ละหัวข้อมี: ชื่อหัวข้อสั้นๆ และคำอธิบาย 1-2 ประโยคว่าจะสื่อสารอะไร ตอบเป็นภาษาไทย เป็น list ที่อ่านง่าย`;
    }
    if (mode === "draft") {
      return `ช่วยร่าง caption/ข้อความสำหรับโพสต์ลง ${platform} ของธุรกิจกระจกและอลูมิเนียม (All About Glass)\n\nบริบท/โจทย์: ${context}\n\nเขียนเป็นภาษาไทย น้ำเสียงเป็นมิตร น่าเชื่อถือ มี call-to-action ท้ายข้อความ ความยาวเหมาะกับแพลตฟอร์มนั้นๆ`;
    }
    return `ช่วยวางแผน content calendar 1 เดือนสำหรับธุรกิจกระจกและอลูมิเนียม (All About Glass) โพสต์ลง ${platform}\n\nบริบท: ${context}\n\nเสนอเป็นรายการ content รายสัปดาห์ (4 สัปดาห์) แต่ละรายการมี: หัวข้อ, ธีม, สั้นๆว่าเนื้อหาคืออะไร ตอบเป็นภาษาไทย`;
  }

  async function callClaude(prompt, apiKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error ${res.status}: ${errBody.slice(0, 300)}`);
    }
    const json = await res.json();
    return (json.content || []).map((c) => c.text || "").join("\n").trim();
  }

  document.getElementById("ai-generate-btn").addEventListener("click", async () => {
    const apiKey = data.settings.apiKey;
    const output = document.getElementById("ai-output");
    if (!apiKey) {
      output.innerHTML = '<p class="status-line err">กรุณาใส่และบันทึก API key ก่อนใช้งาน AI Assist</p>';
      return;
    }
    const mode = document.getElementById("ai-mode").value;
    const context = document.getElementById("ai-context").value.trim();
    const platform = document.getElementById("ai-platform").value;
    if (!context) {
      output.innerHTML = '<p class="status-line err">กรุณาใส่บริบท/โจทย์ก่อน</p>';
      return;
    }

    output.innerHTML = '<p class="loading">กำลังคิด...</p>';
    try {
      const prompt = promptForMode(mode, context, platform);
      const text = await callClaude(prompt, apiKey);
      renderAiResult(text, { mode, platform, theme: "" });
    } catch (err) {
      output.innerHTML = `<p class="status-line err">เกิดข้อผิดพลาด: ${escapeHtml(err.message)}</p>`;
    }
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderAiResult(text, meta) {
    const output = document.getElementById("ai-output");
    output.innerHTML = "";
    const box = document.createElement("div");
    box.className = "ai-result";
    box.textContent = text;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "+ บันทึกเป็น Idea";
    addBtn.addEventListener("click", () => {
      data.items.push({
        id: uid(),
        title: text.split("\n")[0].slice(0, 80) || "AI idea",
        platform: meta.platform,
        status: "idea",
        date: "",
        theme: meta.theme || "",
        tags: ["ai-generated"],
        notes: text,
        createdAt: Date.now()
      });
      save();
      addBtn.textContent = "บันทึกแล้ว ✓";
      addBtn.disabled = true;
    });
    actions.appendChild(addBtn);
    box.appendChild(actions);
    output.appendChild(box);
  }

  // ---------- Init ----------
  function renderAll() {
    renderCalendarWeekdays();
    renderCalendar();
    renderKanban();
    renderIdeas();
    populateThemeSelects();
  }

  renderAll();
})();
