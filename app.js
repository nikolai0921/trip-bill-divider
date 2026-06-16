const STORAGE_KEY = "splitwise-minimalist-activity";

const state = {
  activity: loadActivity(),
};

const els = {
  activityName: document.querySelector("#activity-name"),
  memberForm: document.querySelector("#member-form"),
  memberName: document.querySelector("#member-name"),
  memberList: document.querySelector("#member-list"),
  expenseForm: document.querySelector("#expense-form"),
  expenseFormTitle: document.querySelector("#expense-form-title"),
  editingExpenseId: document.querySelector("#editing-expense-id"),
  cancelEdit: document.querySelector("#cancel-edit"),
  expenseTitle: document.querySelector("#expense-title"),
  expenseAmount: document.querySelector("#expense-amount"),
  expensePayer: document.querySelector("#expense-payer"),
  participantOptions: document.querySelector("#participant-options"),
  selectedSplitBox: document.querySelector("#selected-split-box"),
  itemizedSplitBox: document.querySelector("#itemized-split-box"),
  itemizedList: document.querySelector("#itemized-list"),
  sharedExtra: document.querySelector("#shared-extra"),
  itemizedRemainder: document.querySelector("#itemized-remainder"),
  selectAllMembers: document.querySelector("#select-all-members"),
  expenseList: document.querySelector("#expense-list"),
  balanceSummary: document.querySelector("#balance-summary"),
  settlementList: document.querySelector("#settlement-list"),
  copyLineMessage: document.querySelector("#copy-line-message"),
  copyShareUrl: document.querySelector("#copy-share-url"),
  resetDemo: document.querySelector("#reset-demo"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  els.activityName.value = state.activity.name;
  bindEvents();
  registerServiceWorker();
  render();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(window.location.protocol)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still works without offline caching.
    });
  });
}

function bindEvents() {
  els.activityName.addEventListener("input", () => {
    state.activity.name = els.activityName.value.trim();
    saveAndRender();
  });

  els.memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addMember(els.memberName.value.trim());
    els.memberName.value = "";
  });

  els.memberList.addEventListener("input", (event) => {
    const input = event.target;
    const memberId = input.dataset.memberId;
    const field = input.dataset.field;
    if (!memberId || !field) return;

    const member = findMember(memberId);
    if (!member) return;

    if (field === "name") {
      member.name = input.value;
    } else {
      member.bank = member.bank || {};
      member.bank[field] = input.value;
    }

    state.activity.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.activity));
    renderPayerOptions();
    renderSplitControls();
    renderExpenses();
    renderSettlement();
  });

  els.memberList.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const memberId = button.dataset.memberId;
    if (button.dataset.action === "delete-member") {
      deleteMember(memberId);
    }

    if (button.dataset.action === "copy-bank") {
      const member = findMember(memberId);
      await copyText(formatBank(member));
      showToast("已複製銀行帳號");
    }
  });

  els.expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveExpenseFromForm();
  });

  document.querySelectorAll("input[name='split-mode']").forEach((input) => {
    input.addEventListener("change", () => {
      renderSplitControls();
      updateItemizedRemainder();
    });
  });

  els.expenseAmount.addEventListener("input", updateItemizedRemainder);
  els.sharedExtra.addEventListener("input", updateItemizedRemainder);
  els.itemizedList.addEventListener("input", updateItemizedRemainder);

  els.selectAllMembers.addEventListener("click", () => {
    els.participantOptions.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.checked = true;
    });
  });

  els.expenseList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const expenseId = button.dataset.expenseId;

    if (button.dataset.action === "edit-expense") {
      editExpense(expenseId);
    }

    if (button.dataset.action === "delete-expense") {
      deleteExpense(expenseId);
    }
  });

  els.cancelEdit.addEventListener("click", resetExpenseForm);

  els.copyLineMessage.addEventListener("click", async () => {
    const settlements = optimizeSettlements(calculateBalances(state.activity));
    await copyText(buildLineMessage(state.activity, settlements));
    showToast("已複製 LINE 催款文字");
  });

  els.copyShareUrl.addEventListener("click", async () => {
    await copyText(buildShareUrl());
    showToast("已複製分享網址");
  });

  els.resetDemo.addEventListener("click", () => {
    if (!confirm("確定要清空目前活動資料？")) return;
    state.activity = createEmptyActivity();
    localStorage.removeItem(STORAGE_KEY);
    resetExpenseForm();
    render();
    showToast("已清空");
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".mobile-section").forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${button.dataset.target}`).classList.add("active");
    });
  });

  els.settlementList.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.action === "copy-bank") {
      const member = findMember(button.dataset.memberId);
      await copyText(formatBank(member));
      showToast("已複製收款帳號");
    }

    if (button.dataset.action === "toggle-paid") {
      toggleSettlementPaid(button.dataset.settlementKey);
    }
  });
}

function loadActivity() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("data");

  if (encoded) {
    try {
      return normalizeActivity(decodeSharePayload(encoded));
    } catch {
      showInitialParseWarning();
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeActivity(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return createDemoActivity();
}

function showInitialParseWarning() {
  window.setTimeout(() => showToast("分享資料無法讀取，已載入本機資料"), 300);
}

function createEmptyActivity() {
  return {
    id: makeId("act"),
    name: "",
    currency: "TWD",
    members: [],
    expenses: [],
    settlementStatus: {},
    updatedAt: new Date().toISOString(),
  };
}

function createDemoActivity() {
  const members = [
    { id: makeId("m"), name: "小明", bank: { bankCode: "808", account: "123456789012" } },
    { id: makeId("m"), name: "小華", bank: { bankCode: "012", account: "223344556677" } },
    { id: makeId("m"), name: "大熊", bank: { bankCode: "812", account: "998877665544" } },
  ];

  return {
    id: makeId("act"),
    name: "週末聚餐",
    currency: "TWD",
    members,
    settlementStatus: {},
    expenses: [
      {
        id: makeId("e"),
        title: "麻辣鍋",
        amount: 2400,
        paidBy: members[2].id,
        splitMode: "equal",
        participants: members.map((member) => member.id),
        createdAt: new Date().toISOString(),
      },
      {
        id: makeId("e"),
        title: "酒錢",
        amount: 900,
        paidBy: members[0].id,
        splitMode: "selected_equal",
        participants: [members[0].id, members[1].id],
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeActivity(activity) {
  return {
    id: activity.id || makeId("act"),
    name: activity.name || "",
    currency: "TWD",
    members: Array.isArray(activity.members) ? activity.members : [],
    expenses: Array.isArray(activity.expenses) ? activity.expenses : [],
    settlementStatus: activity.settlementStatus && typeof activity.settlementStatus === "object"
      ? activity.settlementStatus
      : {},
    updatedAt: activity.updatedAt || new Date().toISOString(),
  };
}

function saveAndRender(options = {}) {
  state.activity.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.activity));
  render(options);
}

function render(options = {}) {
  if (!options.keepFocus) {
    els.activityName.value = state.activity.name;
  }
  renderMembers();
  renderPayerOptions();
  renderSplitControls();
  renderExpenses();
  renderSettlement();
}

function renderMembers() {
  if (state.activity.members.length === 0) {
    els.memberList.innerHTML = `<div class="empty-state">先新增成員，就能開始記帳。</div>`;
    return;
  }

  els.memberList.innerHTML = state.activity.members
    .map((member) => {
      const bank = member.bank || {};
      return `
        <article class="member-card">
          <div class="member-main">
            <div>
              <label class="field-label" for="member-name-${member.id}">姓名</label>
              <input id="member-name-${member.id}" class="text-input" data-member-id="${member.id}" data-field="name" value="${escapeHtml(member.name)}" />
            </div>
            <div class="row-actions">
              <button class="icon-button" type="button" data-action="copy-bank" data-member-id="${member.id}" title="複製銀行帳號">複製</button>
              <button class="icon-button danger" type="button" data-action="delete-member" data-member-id="${member.id}" title="刪除成員">刪除</button>
            </div>
          </div>
          <div class="member-bank">
            <input class="text-input" data-member-id="${member.id}" data-field="bankCode" value="${escapeHtml(bank.bankCode || "")}" placeholder="銀行代碼" />
            <input class="text-input" data-member-id="${member.id}" data-field="account" value="${escapeHtml(bank.account || "")}" placeholder="帳號" />
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPayerOptions() {
  const selectedPayer = els.expensePayer.value;
  els.expensePayer.innerHTML = state.activity.members
    .map((member) => `<option value="${member.id}">${escapeHtml(member.name || "未命名")}</option>`)
    .join("");

  if (state.activity.members.some((member) => member.id === selectedPayer)) {
    els.expensePayer.value = selectedPayer;
  }
}

function renderSplitControls() {
  const mode = getSplitMode();
  const showSelected = mode === "selected_equal";
  const showItemized = mode === "itemized_proportional";

  els.selectedSplitBox.classList.toggle("hidden", !showSelected);
  els.itemizedSplitBox.classList.toggle("hidden", !showItemized);

  const currentParticipants = new Set(getCheckedParticipantIds());
  const shouldCheckAll = currentParticipants.size === 0;

  els.participantOptions.innerHTML = state.activity.members
    .map((member) => {
      const checked = shouldCheckAll || currentParticipants.has(member.id) ? "checked" : "";
      return `
        <label class="check-pill">
          <input type="checkbox" value="${member.id}" ${checked} />
          <span>${escapeHtml(member.name || "未命名")}</span>
        </label>
      `;
    })
    .join("");

  const existingValues = getItemizedInputs();
  els.itemizedList.innerHTML = state.activity.members
    .map((member) => {
      const value = existingValues[member.id] ?? "";
      return `
        <label class="itemized-row">
          <span>${escapeHtml(member.name || "未命名")}</span>
          <input class="text-input itemized-input" data-member-id="${member.id}" type="number" min="0" step="1" inputmode="numeric" value="${value}" placeholder="0" />
        </label>
      `;
    })
    .join("");

  updateItemizedRemainder();
}

function renderExpenses() {
  if (state.activity.expenses.length === 0) {
    els.expenseList.innerHTML = `<div class="empty-state">尚無帳目。</div>`;
    return;
  }

  els.expenseList.innerHTML = state.activity.expenses
    .map((expense) => {
      const payer = findMember(expense.paidBy);
      const shares = getExpenseShares(expense, state.activity.members.map((member) => member.id));
      const shareLine = Object.entries(shares)
        .map(([memberId, amount]) => `${getMemberName(memberId)} ${formatMoney(amount)}`)
        .join("、");

      return `
        <article class="expense-card">
          <div class="expense-main">
            <div>
              <h3>${escapeHtml(expense.title)}</h3>
              <p class="expense-meta">${formatMoney(expense.amount)} · ${escapeHtml(payer?.name || "未知付款人")} 付款 · ${getSplitModeLabel(expense.splitMode)}</p>
            </div>
            <div class="row-actions">
              <button class="icon-button" type="button" data-action="edit-expense" data-expense-id="${expense.id}">編輯</button>
              <button class="icon-button danger" type="button" data-action="delete-expense" data-expense-id="${expense.id}">刪除</button>
            </div>
          </div>
          <p class="expense-meta">${escapeHtml(shareLine)}</p>
        </article>
      `;
    })
    .join("");
}

function renderSettlement() {
  const balances = calculateBalances(state.activity);
  const settlements = optimizeSettlements(balances);
  const memberTotals = calculateMemberTotals(state.activity);
  pruneSettlementStatus(settlements);

  if (state.activity.members.length === 0) {
    els.balanceSummary.innerHTML = "";
    els.settlementList.innerHTML = `<div class="empty-state">新增成員與帳目後，這裡會產生最佳化轉帳清單。</div>`;
    return;
  }

  els.balanceSummary.innerHTML = state.activity.members
    .map((member) => {
      const amount = balances[member.id] || 0;
      const kind = amount >= 0 ? "positive" : "negative";
      const label = amount >= 0 ? "應收" : "應付";
      const totals = memberTotals[member.id] || { paid: 0, share: 0 };
      return `
        <article class="balance-card ${kind}">
          <span class="muted">${escapeHtml(member.name || "未命名")} · ${label}</span>
          <strong>${formatMoney(Math.abs(amount))}</strong>
          <div class="balance-lines">
            <span>已墊付 ${formatMoney(totals.paid)}</span>
            <span>應分攤 ${formatMoney(totals.share)}</span>
          </div>
        </article>
      `;
    })
    .join("");

  if (settlements.length === 0) {
    els.settlementList.innerHTML = `<div class="empty-state">目前已經打平，不需要轉帳。</div>`;
    return;
  }

  els.settlementList.innerHTML = settlements
    .map((settlement) => {
      const receiver = findMember(settlement.to);
      const bank = formatBank(receiver);
      const hasBank = bank !== "尚未填寫銀行帳號";
      const settlementKey = getSettlementKey(settlement);
      const isPaid = state.activity.settlementStatus?.[settlementKey] === "paid";
      return `
        <article class="settlement-card ${isPaid ? "is-paid" : ""}">
          <div class="settlement-main">
            <div>
              <div class="settlement-route">
                <span>${escapeHtml(getMemberName(settlement.from))}</span>
                <span>轉給</span>
                <span>${escapeHtml(getMemberName(settlement.to))}</span>
                <span class="amount-badge">${formatMoney(settlement.amount)}</span>
                <span class="status-pill ${isPaid ? "paid" : "unpaid"}">${isPaid ? "已付款" : "待付款"}</span>
              </div>
              <p class="settlement-meta">${escapeHtml(bank)}</p>
            </div>
            <div class="settlement-actions">
              <button class="icon-button" type="button" data-action="copy-bank" data-member-id="${settlement.to}" ${hasBank ? "" : "disabled"}>複製帳號</button>
              <button class="icon-button" type="button" data-action="toggle-paid" data-settlement-key="${settlementKey}">${isPaid ? "取消已付" : "標記已付"}</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function addMember(name) {
  if (!name) {
    showToast("請輸入成員姓名");
    return;
  }

  state.activity.members.push({
    id: makeId("m"),
    name,
    bank: { bankCode: "", account: "" },
  });
  saveAndRender();
}

function deleteMember(memberId) {
  const hasExpense = state.activity.expenses.some((expense) => {
    return (
      expense.paidBy === memberId ||
      (expense.participants || []).includes(memberId) ||
      Object.prototype.hasOwnProperty.call(expense.itemizedAmounts || {}, memberId)
    );
  });

  if (hasExpense && !confirm("這位成員已出現在帳目中，刪除後相關分攤也會移除。確定刪除？")) {
    return;
  }

  state.activity.members = state.activity.members.filter((member) => member.id !== memberId);
  state.activity.expenses = state.activity.expenses
    .filter((expense) => expense.paidBy !== memberId)
    .map((expense) => ({
      ...expense,
      participants: (expense.participants || []).filter((id) => id !== memberId),
      itemizedAmounts: Object.fromEntries(
        Object.entries(expense.itemizedAmounts || {}).filter(([id]) => id !== memberId),
      ),
    }));

  saveAndRender();
}

function saveExpenseFromForm() {
  if (state.activity.members.length === 0) {
    showToast("請先新增成員");
    return;
  }

  const title = els.expenseTitle.value.trim();
  const amount = parseMoneyInput(els.expenseAmount.value);
  const paidBy = els.expensePayer.value;
  const splitMode = getSplitMode();

  if (!title || amount <= 0 || !paidBy) {
    showToast("請完整填寫帳目資料");
    return;
  }

  const expense = {
    id: els.editingExpenseId.value || makeId("e"),
    title,
    amount,
    paidBy,
    splitMode,
    participants: [],
    itemizedAmounts: {},
    sharedExtraAmount: 0,
    createdAt: new Date().toISOString(),
  };

  if (splitMode === "equal") {
    expense.participants = state.activity.members.map((member) => member.id);
  }

  if (splitMode === "selected_equal") {
    expense.participants = getCheckedParticipantIds();
    if (expense.participants.length === 0) {
      showToast("請至少選擇一位分攤成員");
      return;
    }
  }

  if (splitMode === "itemized_proportional") {
    const itemizedAmounts = getItemizedInputs(true);
    const itemizedTotal = sum(Object.values(itemizedAmounts));
    const sharedExtraAmount = parseMoneyInput(els.sharedExtra.value);

    if (itemizedTotal + sharedExtraAmount !== amount) {
      showToast("個別金額加公共費用需等於總金額");
      return;
    }

    expense.itemizedAmounts = itemizedAmounts;
    expense.sharedExtraAmount = sharedExtraAmount;
  }

  const existingIndex = state.activity.expenses.findIndex((item) => item.id === expense.id);
  if (existingIndex >= 0) {
    expense.createdAt = state.activity.expenses[existingIndex].createdAt;
    state.activity.expenses[existingIndex] = expense;
  } else {
    state.activity.expenses.unshift(expense);
  }

  resetExpenseForm();
  saveAndRender();
  showToast("帳目已儲存");
}

function editExpense(expenseId) {
  const expense = state.activity.expenses.find((item) => item.id === expenseId);
  if (!expense) return;

  els.expenseFormTitle.textContent = "編輯帳目";
  els.editingExpenseId.value = expense.id;
  els.cancelEdit.classList.remove("hidden");
  els.expenseTitle.value = expense.title;
  els.expenseAmount.value = String(expense.amount);
  els.expensePayer.value = expense.paidBy;
  document.querySelector(`input[name='split-mode'][value='${expense.splitMode}']`).checked = true;
  els.sharedExtra.value = String(expense.sharedExtraAmount || 0);

  renderSplitControls();

  if (expense.splitMode === "selected_equal") {
    els.participantOptions.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.checked = (expense.participants || []).includes(checkbox.value);
    });
  }

  if (expense.splitMode === "itemized_proportional") {
    els.itemizedList.querySelectorAll(".itemized-input").forEach((input) => {
      input.value = expense.itemizedAmounts?.[input.dataset.memberId] || "";
    });
  }

  updateItemizedRemainder();
  document.querySelector("#section-expense").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteExpense(expenseId) {
  state.activity.expenses = state.activity.expenses.filter((expense) => expense.id !== expenseId);
  saveAndRender();
}

function resetExpenseForm() {
  els.expenseForm.reset();
  els.editingExpenseId.value = "";
  els.expenseFormTitle.textContent = "新增帳目";
  els.cancelEdit.classList.add("hidden");
  document.querySelector("input[name='split-mode'][value='equal']").checked = true;
  els.sharedExtra.value = "0";
  renderSplitControls();
}

function splitEvenly(amount, memberIds) {
  const result = {};
  if (memberIds.length === 0) return result;

  const base = Math.floor(amount / memberIds.length);
  let remainder = amount - base * memberIds.length;

  memberIds.forEach((id) => {
    result[id] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });

  return result;
}

function allocateProportionally(extraAmount, baseAmounts) {
  const ids = Object.keys(baseAmounts);
  const totalBase = sum(Object.values(baseAmounts));

  if (extraAmount <= 0) return Object.fromEntries(ids.map((id) => [id, 0]));
  if (totalBase === 0) return splitEvenly(extraAmount, ids);

  const sorted = ids
    .map((id) => {
      const raw = (extraAmount * baseAmounts[id]) / totalBase;
      const floor = Math.floor(raw);
      return { id, floor, fraction: raw - floor };
    })
    .sort((a, b) => b.fraction - a.fraction);

  const allocations = {};
  let allocated = 0;
  sorted.forEach((item) => {
    allocations[item.id] = item.floor;
    allocated += item.floor;
  });

  let remainder = extraAmount - allocated;
  sorted.forEach((item) => {
    if (remainder <= 0) return;
    allocations[item.id] += 1;
    remainder -= 1;
  });

  return allocations;
}

function getExpenseShares(expense, allMemberIds) {
  if (expense.splitMode === "equal") {
    return splitEvenly(expense.amount, allMemberIds);
  }

  if (expense.splitMode === "selected_equal") {
    return splitEvenly(expense.amount, expense.participants || []);
  }

  if (expense.splitMode === "itemized_proportional") {
    const itemized = expense.itemizedAmounts || {};
    const extraShares = allocateProportionally(expense.sharedExtraAmount || 0, itemized);
    return Object.fromEntries(
      Object.keys(itemized).map((id) => [id, itemized[id] + (extraShares[id] || 0)]),
    );
  }

  return {};
}

function calculateBalances(activity) {
  const balances = Object.fromEntries(activity.members.map((member) => [member.id, 0]));
  const memberIds = activity.members.map((member) => member.id);

  activity.expenses.forEach((expense) => {
    if (!Object.prototype.hasOwnProperty.call(balances, expense.paidBy)) return;
    balances[expense.paidBy] += expense.amount;

    const shares = getExpenseShares(expense, memberIds);
    Object.entries(shares).forEach(([memberId, shareAmount]) => {
      if (Object.prototype.hasOwnProperty.call(balances, memberId)) {
        balances[memberId] -= shareAmount;
      }
    });
  });

  return balances;
}

function calculateMemberTotals(activity) {
  const totals = Object.fromEntries(
    activity.members.map((member) => [member.id, { paid: 0, share: 0 }]),
  );
  const memberIds = activity.members.map((member) => member.id);

  activity.expenses.forEach((expense) => {
    if (totals[expense.paidBy]) {
      totals[expense.paidBy].paid += expense.amount;
    }

    const shares = getExpenseShares(expense, memberIds);
    Object.entries(shares).forEach(([memberId, shareAmount]) => {
      if (totals[memberId]) {
        totals[memberId].share += shareAmount;
      }
    });
  });

  return totals;
}

function optimizeSettlements(balances) {
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < 0)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({ from: debtor.id, to: creditor.id, amount });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return settlements;
}

function getSettlementKey(settlement) {
  return [settlement.from, settlement.to, settlement.amount].join("__");
}

function toggleSettlementPaid(settlementKey) {
  if (!settlementKey) return;

  state.activity.settlementStatus = state.activity.settlementStatus || {};
  if (state.activity.settlementStatus[settlementKey] === "paid") {
    delete state.activity.settlementStatus[settlementKey];
  } else {
    state.activity.settlementStatus[settlementKey] = "paid";
  }

  saveAndRender();
}

function pruneSettlementStatus(settlements) {
  const currentKeys = new Set(settlements.map(getSettlementKey));
  const status = state.activity.settlementStatus || {};
  const nextStatus = {};

  Object.entries(status).forEach(([key, value]) => {
    if (currentKeys.has(key) && value === "paid") {
      nextStatus[key] = value;
    }
  });

  state.activity.settlementStatus = nextStatus;
}

function buildLineMessage(activity, settlements) {
  if (settlements.length === 0) {
    return `活動：${activity.name || "未命名活動"} 結算\n目前已經打平，不需要轉帳。`;
  }

  const unpaidSettlements = settlements.filter((item) => {
    return activity.settlementStatus?.[getSettlementKey(item)] !== "paid";
  });

  if (unpaidSettlements.length === 0) {
    return `活動：${activity.name || "未命名活動"} 結算\n所有轉帳都已標記完成。`;
  }

  const lines = unpaidSettlements.map((item) => {
    const receiver = findMember(item.to);
    const bank = formatBank(receiver);
    const bankText = bank === "尚未填寫銀行帳號" ? "" : `（${bank}）`;
    return `${getMemberName(item.from)} 需轉帳 ${formatMoney(item.amount)} 給 ${getMemberName(item.to)}${bankText}`;
  });

  return [`活動：${activity.name || "未命名活動"} 結算`, ...lines].join("\n");
}

function getSplitMode() {
  return document.querySelector("input[name='split-mode']:checked").value;
}

function getCheckedParticipantIds() {
  return Array.from(els.participantOptions.querySelectorAll("input[type='checkbox']:checked")).map(
    (input) => input.value,
  );
}

function getItemizedInputs(omitZero = false) {
  const entries = Array.from(els.itemizedList.querySelectorAll(".itemized-input")).map((input) => [
    input.dataset.memberId,
    parseMoneyInput(input.value),
  ]);

  return Object.fromEntries(omitZero ? entries.filter(([, value]) => value > 0) : entries);
}

function updateItemizedRemainder() {
  const amount = parseMoneyInput(els.expenseAmount.value);
  const itemizedTotal = sum(Object.values(getItemizedInputs()));
  const extra = parseMoneyInput(els.sharedExtra.value);
  const remainder = amount - itemizedTotal - extra;

  els.itemizedRemainder.textContent =
    remainder === 0
      ? "已完整分配"
      : `${remainder > 0 ? "尚未分配" : "超出"} ${formatMoney(Math.abs(remainder))}`;
}

function buildShareUrl() {
  const url = new URL(window.location.href);
  const payload = encodeSharePayload(state.activity);
  url.searchParams.set("data", payload);
  return url.toString();
}

function encodeSharePayload(activity) {
  const json = JSON.stringify(activity);
  const legacy = btoa(encodeURIComponent(json));
  const compressed = `v2.${bytesToBase64Url(packUint16(lzwCompress(json)))}`;
  return compressed.length < legacy.length ? compressed : legacy;
}

function decodeSharePayload(encoded) {
  if (encoded.startsWith("v2.")) {
    const codes = unpackUint16(base64UrlToBytes(encoded.slice(3)));
    return JSON.parse(lzwDecompress(codes));
  }

  return JSON.parse(decodeURIComponent(atob(encoded)));
}

function lzwCompress(text) {
  const bytes = new TextEncoder().encode(text);
  let input = "";
  bytes.forEach((byte) => {
    input += String.fromCharCode(byte);
  });

  const dictionary = new Map();
  for (let i = 0; i < 256; i += 1) {
    dictionary.set(String.fromCharCode(i), i);
  }

  let phrase = "";
  let nextCode = 256;
  const output = [];

  for (const char of input) {
    const combined = phrase + char;
    if (dictionary.has(combined)) {
      phrase = combined;
    } else {
      output.push(dictionary.get(phrase));
      if (nextCode <= 65535) {
        dictionary.set(combined, nextCode);
        nextCode += 1;
      }
      phrase = char;
    }
  }

  if (phrase) {
    output.push(dictionary.get(phrase));
  }

  return output;
}

function lzwDecompress(codes) {
  if (codes.length === 0) return "";

  const dictionary = new Map();
  for (let i = 0; i < 256; i += 1) {
    dictionary.set(i, String.fromCharCode(i));
  }

  let previous = dictionary.get(codes[0]);
  let output = previous;
  let nextCode = 256;

  for (let i = 1; i < codes.length; i += 1) {
    const code = codes[i];
    const entry = dictionary.has(code) ? dictionary.get(code) : previous + previous[0];
    output += entry;

    if (nextCode <= 65535) {
      dictionary.set(nextCode, previous + entry[0]);
      nextCode += 1;
    }

    previous = entry;
  }

  const bytes = Uint8Array.from(output, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function packUint16(codes) {
  const bytes = new Uint8Array(codes.length * 2);
  codes.forEach((code, index) => {
    bytes[index * 2] = code & 255;
    bytes[index * 2 + 1] = code >> 8;
  });
  return bytes;
}

function unpackUint16(bytes) {
  const codes = [];
  for (let i = 0; i < bytes.length; i += 2) {
    codes.push(bytes[i] | (bytes[i + 1] << 8));
  }
  return codes;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function copyText(text) {
  if (!text) {
    showToast("沒有可複製的內容");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function formatBank(member) {
  const bank = member?.bank || {};
  const parts = [bank.bankCode, bank.account].filter(Boolean);
  return parts.length ? parts.join(" ") : "尚未填寫銀行帳號";
}

function getMemberName(memberId) {
  return findMember(memberId)?.name || "未知成員";
}

function findMember(memberId) {
  return state.activity.members.find((member) => member.id === memberId);
}

function getSplitModeLabel(mode) {
  return {
    equal: "均分",
    selected_equal: "指定人分攤",
    itemized_proportional: "個別金額/比例",
  }[mode];
}

function parseMoneyInput(value) {
  return Math.max(0, Math.round(Number(value || 0)));
}

function formatMoney(amount) {
  return `$${Math.round(amount).toLocaleString("zh-TW")}`;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}
