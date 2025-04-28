//=============================================================================
// Gestor Financeiro - app-core.js - v1.9.21.4 (PIX + Refactor + Theme Debug)
// Descrição: Núcleo principal do aplicativo Gestor Financeiro.
//            Contém lógica, estado, UI e listeners. Importa de app-config.js.
// - Adicionado Banner e Lógica de Pagamento PIX (Simulado).
// - Código refatorado para separar configurações estáticas.
// - Adicionados logs para depuração da troca de tema.
//=============================================================================

// --- Imports ---
import * as config from './app-config.js'; // Importa TODAS as configs estáticas
import {
  initProFeatures,
  renderRecurringTransactions,
  checkRecurringTransactions,
  setupEditAttachmentUI,
  clearTemporaryAttachments,
  renderCashFlowReport,
  // Adicione outras importações PRO se necessário
} from './app-pro.js';
import {
  initBusinessFeatures,
  renderClients,
  renderProjects,
  renderInvoices,
  populateRecipientSelects,
  getClientNameById,
  getProjectNameById,
  renderSettingsBasedOnRole,
  getEmployeeNameById,
  renderDebtorsList,
  checkAllOverdueDebts,
  // Adicione outras importações BUSINESS se necessário
} from './app-business.js';

// --- Flags de Plano ---
export let isProPlan = true;
export let isBusinessPlan = true;

// --- Funções Utilitárias Essenciais ---
const safeGetElementById = (id) => document.getElementById(id);
const safeQuerySelector = (selector) => document.querySelector(selector);

export function getLocalDateString(date = new Date()) {
    // ... (código da função sem alterações)
    try {
        const d = date instanceof Date && !isNaN(date) ? date : new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dy}`;
    } catch (e) {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    }
}
export function formatDisplayDate(dateString) {
    // ... (código da função sem alterações)
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) return "Inválida";
    const p = dateString.split('-');
    if (p.length !== 3) return "Inválida";
    const [y, m, d] = p;
    return isNaN(parseInt(y)) || isNaN(parseInt(m)) || isNaN(parseInt(d)) ? "Inválida" : `${d}/${m}/${y}`;
}
export function formatDisplayDateTime(dateString, timeString) {
    // ... (código da função sem alterações)
    const formattedDate = formatDisplayDate(dateString);
    if (formattedDate === "Inválida") return "Data Inválida";
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return formattedDate;
    return `${formattedDate} às ${timeString}`;
}
export function parseDateInput(dateString) {
    // ... (código da função sem alterações)
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) return new Date(NaN);
    const p = dateString.split('-');
    if (p.length !== 3) return new Date(NaN);
    const [y, m, d] = p.map(Number);
    return isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31 ? new Date(NaN) : new Date(y, m - 1, d);
}
export function parseDateTimeInput(dateString, timeString) {
    // ... (código da função sem alterações)
    const datePart = parseDateInput(dateString);
    if (isNaN(datePart.getTime())) return new Date(NaN);
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
        datePart.setHours(0, 0, 0, 0);
        return datePart;
    }
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) {
        datePart.setHours(0, 0, 0, 0);
        return datePart;
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
        datePart.setHours(0, 0, 0, 0);
        return datePart;
    }
    datePart.setHours(hours, minutes, 0, 0);
    return datePart;
}
export function getMonthName(monthIndex) {
    // ... (código da função sem alterações)
    const m = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const v = Math.max(0, Math.min(11, monthIndex));
    return m[v];
}
export function formatCurrency(value) {
    // ... (código da função sem alterações, mas usa `currency` do estado global)
    if (valuesHidden) return 'R$ ***';
    if (typeof value !== 'number' || isNaN(value)) {
        value = parseFloat(String(value).replace(',', '.')) || 0;
    }
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL', // Usa a variável global `currency`
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function formatPlaceholderCurrency() {
    return valuesHidden ? '***' : '0,00';
}
export function escapeHtml(unsafe) {
    // ... (código da função sem alterações)
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
export function parseTags(tagString) {
    // ... (código da função sem alterações)
    if (!tagString || typeof tagString !== 'string') return [];
    return tagString.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
}
export function formatTags(tagsArray) {
    // ... (código da função sem alterações)
    if (!Array.isArray(tagsArray)) return '';
    return tagsArray.join(', ');
}
function truncateText(text, maxLength = 30) {
    // ... (código da função sem alterações)
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
export function isWithinGracePeriod(timestamp) {
    // Usa a constante importada
    return timestamp && (Date.now() - parseFloat(String(timestamp).replace(/[^\d.]/g, '')) < config.GRACE_PERIOD_MS);
}
export function calculateNextDueDate(baseDateStr, frequency) {
    // ... (código da função sem alterações)
    if (!baseDateStr || !frequency) return null;
    const baseDate = parseDateInput(baseDateStr);
    if (isNaN(baseDate.getTime())) return null;

    const currentYear = baseDate.getUTCFullYear();
    const currentMonth = baseDate.getUTCMonth();
    const currentDay = baseDate.getUTCDate();
    let nextDate = new Date(Date.UTC(currentYear, currentMonth, currentDay));

    switch (frequency) {
        case 'daily': nextDate.setUTCDate(nextDate.getUTCDate() + 1); break;
        case 'weekly': nextDate.setUTCDate(nextDate.getUTCDate() + 7); break;
        case 'monthly':
            let nextMonth = currentMonth + 1;
            let nextYear = currentYear;
            if (nextMonth > 11) { nextMonth = 0; nextYear++; }
            const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
            const targetDay = Math.min(currentDay, daysInNextMonth);
            nextDate = new Date(Date.UTC(nextYear, nextMonth, targetDay));
            break;
        case 'yearly':
            nextDate = new Date(Date.UTC(currentYear + 1, currentMonth, currentDay));
            if (currentMonth === 1 && currentDay === 29) { // Leap year check
                const nextYearIsLeap = (nextDate.getUTCFullYear() % 4 === 0 && nextDate.getUTCFullYear() % 100 !== 0) || (nextDate.getUTCFullYear() % 400 === 0);
                if (!nextYearIsLeap) { nextDate.setUTCDate(28); }
            }
            break;
        default: return null;
    }
    if (isNaN(nextDate.getTime())) return null;
    const y = nextDate.getUTCFullYear();
    const m = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(nextDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function debounce(func, wait) {
    // ... (código da função sem alterações)
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// --- Fim Funções Utilitárias ---

// --- Funções de Feedback Visual (Toast, Confirm, Success) ---
const popupContainer = document.getElementById('popup-container');
function showToast(message, type = 'info', duration = 4000) {
    // ... (código da função sem alterações)
    if (!popupContainer) {
        console.warn("Popup container não encontrado. Usando alert.");
        alert(message);
        return;
    }
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.innerHTML = `
        <span class="popup-icon"></span>
        <span class="popup-message">${message}</span>
        <button class="popup-close">&times;</button>
    `;
    popupContainer.prepend(popup);
    void popup.offsetWidth;
    popup.classList.add('show');
    let timeoutId;
    const removePopup = () => {
        popup.classList.remove('show');
        popup.classList.add('hide');
        popup.addEventListener('transitionend', () => {
            if (popup.parentNode === popupContainer) {
                popupContainer.removeChild(popup);
            }
        }, { once: true });
        clearTimeout(timeoutId);
    };
    if (duration > 0) {
        timeoutId = setTimeout(removePopup, duration);
    }
    popup.querySelector('.popup-close').addEventListener('click', removePopup);
}
export function showAlert(message, type = 'info', duration = 5000) {
    showToast(message, type, duration);
}
export function showConfirmModal(message, title = 'Confirmar Ação', confirmButtonClass = 'danger') {
    // ... (código da função sem alterações)
    const confirmModal = safeGetElementById('confirmModal');
    return new Promise((resolve) => {
        if (!confirmModal) {
            resolve(window.confirm(message.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(strong|b)>/gi, '')));
            return;
        }
        const msgElement = confirmModal.querySelector('#confirmMessage');
        const okButton = confirmModal.querySelector('#confirmAction');
        const cancelButton = confirmModal.querySelector('#cancelConfirm');
        const modalTitle = confirmModal.querySelector('.modal-title');
        const closeButton = confirmModal.querySelector('.modal-close');
        if (!msgElement || !okButton || !cancelButton || !modalTitle || !closeButton) {
            console.error("Elementos do Modal de Confirmação não encontrados!");
            resolve(window.confirm(message));
            return;
        }
        modalTitle.textContent = title;
        msgElement.innerHTML = message;
        okButton.className = `btn btn-${confirmButtonClass}`;
        confirmModal.classList.add('active');
        let handled = false;
        const cleanup = () => {
            okButton.onclick = null;
            cancelButton.onclick = null;
            closeButton.onclick = null;
            confirmModal.classList.remove('active');
        };
        const handleOk = () => { if (!handled) { handled = true; cleanup(); resolve(true); } };
        const handleCancel = () => { if (!handled) { handled = true; cleanup(); resolve(false); } };
        okButton.onclick = handleOk;
        cancelButton.onclick = handleCancel;
        closeButton.onclick = handleCancel;
    });
}
function showSuccessFeedback(button, message) {
    // ... (código da função sem alterações)
    if (!button) return;
    const originalHTML = button.innerHTML;
    const originalClass = button.className;
    const wasDisabled = button.disabled;
    button.innerHTML = `<i class="fas fa-check"></i> ${message}`;
    button.disabled = true;
    button.className = 'btn btn-success';
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClass;
        button.disabled = wasDisabled;
    }, 2000);
}
function showScheduledPaymentWarningModal() {
    // ... (código da função sem alterações)
    const scheduledWarningModal = safeGetElementById('scheduledWarningModal');
    return new Promise((resolve) => {
        if (hideScheduledPaymentWarning || !scheduledWarningModal) return resolve(true);
        const confirmBtn = document.getElementById('confirmScheduledWarning');
        const closeBtn = scheduledWarningModal.querySelector('.modal-close');
        const dontShowCheck = document.getElementById('dontShowWarningAgain');
        if (!confirmBtn || !closeBtn || !dontShowCheck) return resolve(true);
        let handled = false;
        const cleanup = () => {
            confirmBtn.onclick = null;
            closeBtn.onclick = null;
            scheduledWarningModal.removeEventListener('click', handleOverlayClick);
            scheduledWarningModal.classList.remove('active');
        };
        const handleConfirm = () => {
            if (!handled) {
                handled = true;
                if (dontShowCheck.checked) {
                    localStorage.setItem(config.LS_KEY_HIDE_SCHEDULED_WARNING, 'true'); // Usa config
                    hideScheduledPaymentWarning = true;
                }
                cleanup();
                resolve(true);
            }
        };
        const handleCancel = () => { if (!handled) { handled = true; cleanup(); resolve(false); } };
        const handleOverlayClick = (event) => { if (event.target === scheduledWarningModal) {} };
        confirmBtn.onclick = handleConfirm;
        closeBtn.onclick = handleCancel;
        scheduledWarningModal.addEventListener('click', handleOverlayClick);
        scheduledWarningModal.classList.add('active');
    });
}
// --- Fim Feedback Visual ---

// --- Seletores DOM ---
// (TODOS os seus seletores DOM ficam aqui, como antes)
export const body = document.body;
const sidebar = safeQuerySelector('.sidebar');
const menuToggle = safeQuerySelector('.menu-toggle');
const closeSidebar = safeQuerySelector('.close-sidebar');
const themeToggle = safeQuerySelector('.theme-toggle');
const valueToggle = safeGetElementById('valueToggle');
const valueToggleIcon = valueToggle ? valueToggle.querySelector('i') : null;
const addTransactionFab = safeGetElementById('addTransactionBtn');
const pageTitleElement = safeQuerySelector('.page-title');
const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
const contentSections = document.querySelectorAll('.main-content .content-section');
const remainingBalancePix = safeGetElementById('remainingBalancePix');
const remainingBalanceCash = safeGetElementById('remainingBalanceCash');
const remainingBalanceCard = safeGetElementById('remainingBalanceCard');
export const transactionModal = safeGetElementById('transactionModal');
const transactionModalForm = safeGetElementById('transactionModalForm');
const modalDateInput = safeGetElementById('modalDate');
export const modalItemInput = safeGetElementById('modalItem');
export const modalAmountInput = safeGetElementById('modalAmount');
export const modalTypeInput = safeGetElementById('modalType');
export const modalCategoryInput = safeGetElementById('modalCategory');
export const modalPaymentMethodInput = safeGetElementById('modalPaymentMethod');
const modalDescriptionInput = safeGetElementById('modalDescription');
const modalOriginatingBillIdInput = safeGetElementById('modalOriginatingBillIdInput');
const saveTransactionBtn = safeGetElementById('saveTransaction');
export const editModal = safeGetElementById('editModal');
const editForm = safeGetElementById('editForm');
const editDateInput = safeGetElementById('editDate');
const editItemInput = safeGetElementById('editItem');
const editAmountInput = safeGetElementById('editAmount');
export const editTypeInput = safeGetElementById('editType');
export const editCategoryInput = safeGetElementById('editCategory');
export const editPaymentMethodInput = safeGetElementById('editPaymentMethod');
const editDescriptionInput = safeGetElementById('editDescription');
const saveEditBtn = safeGetElementById('saveEdit');
const scheduledPaymentModal = safeGetElementById('scheduledPaymentModal');
const scheduledPaymentForm = safeGetElementById('scheduledPaymentForm');
const scheduledItemInput = safeGetElementById('scheduledItem');
const scheduledAmountInput = safeGetElementById('scheduledAmount');
const scheduledDateInput = safeGetElementById('scheduledDate');
const scheduledCategoryInput = safeGetElementById('scheduledCategory');
const scheduledPaymentMethodInput = safeGetElementById('scheduledPaymentMethod');
const scheduledAutoDebitInput = safeGetElementById('scheduledAutoDebit');
const saveScheduledPaymentBtn = safeGetElementById('saveScheduledPayment');
const goalModal = safeGetElementById('goalModal');
const goalForm = safeGetElementById('goalForm');
const goalNameInput = safeGetElementById('goalName');
const goalTargetInput = safeGetElementById('goalTarget');
const monthlyContributionInput = safeGetElementById('monthlyContribution');
const goalDateInput = safeGetElementById('goalDate');
const goalTypeInput = safeGetElementById('goalType');
const goalImageInput = safeGetElementById('goalImage');
const goalImagePreview = safeGetElementById('goalImagePreview');
const removeGoalImageBtn = goalModal ? goalModal.querySelector('.remove-image-btn') : null;
const saveGoalBtn = safeGetElementById('saveGoal');
const addGoalBtns = document.querySelectorAll('#addGoalBtnDashboard, #addGoalBtnList, #addGoalFromEmptyState');
const addScheduledPaymentBtn = safeGetElementById('addScheduledPaymentBtn');
const addScheduledFromListBtn = safeGetElementById('addScheduledFromListBtn');
export const settingsSection = safeGetElementById('settings-section');
const initialBalancePixInput = safeGetElementById('initialBalancePix');
const initialBalanceCashInput = safeGetElementById('initialBalanceCash');
const initialBalanceCardInput = safeGetElementById('initialBalanceCard');
const pixBalanceDisplay = safeGetElementById('pixBalanceDisplay');
const cashBalanceDisplay = safeGetElementById('cashBalanceDisplay');
const cardBalanceDisplay = safeGetElementById('cardBalanceDisplay');
const saveInitialBalancesBtn = safeGetElementById('saveInitialBalances');
const saveUserSettingsBtn = safeGetElementById('saveUserSettings');
const userNameInput = safeGetElementById('userName');
const userEmailInput = safeGetElementById('userEmail');
export const currencyInput = safeGetElementById('currency');
const exportDataBtn = safeGetElementById('exportDataBtn');
const importDataBtn = safeGetElementById('importDataBtn');
const importDataInput = safeGetElementById('importDataInput');
const alertModal = safeGetElementById('alertModal'); // Mantido se houver uso futuro
const confirmModal = safeGetElementById('confirmModal');
const scheduledWarningModal = safeGetElementById('scheduledWarningModal');
const transactionDetailModal = safeGetElementById('transactionDetailModal');
const transactionHistoryContainer = safeGetElementById('transactionHistory');
export const allTransactionsContainer = safeGetElementById('allTransactions');
const upcomingBillsContainer = safeGetElementById('upcomingBills');
const allScheduledPaymentsListContainer = safeGetElementById('allScheduledPaymentsList');
const goalsListContainer = safeGetElementById('goalsList');
const dashboardEmptyState = safeGetElementById('emptyState');
const transactionsEmptyState = safeGetElementById('emptyState2');
const goalsSummaryContainer = safeQuerySelector('.goals-summary');
const notesSection = safeGetElementById('notes-section');
const notesListContainer = safeGetElementById('notesListContainer');
const notesEmptyState = safeGetElementById('notesEmptyState');
const addNoteBtn = safeGetElementById('addNoteBtn');
const quickViewNotesBtn = safeGetElementById('quickViewNotesBtn');
const noteModal = safeGetElementById('noteModal');
const noteForm = safeGetElementById('noteForm');
const noteIdInput = safeGetElementById('noteId');
const noteTypeSelect = safeGetElementById('noteTypeSelect');
const noteTitleInput = safeGetElementById('noteTitle');
const noteContentInput = safeGetElementById('noteContent');
const noteReminderDateInput = safeGetElementById('noteReminderDate');
const noteReminderTimeInput = safeGetElementById('noteReminderTime');
const noteColorOptionsContainer = safeGetElementById('noteColorOptions');
const saveNoteBtn = safeGetElementById('saveNoteBtn');
const noteModalTitle = safeGetElementById('noteModalTitle');
const viewAllNotesBtn = safeGetElementById('viewAllNotesBtn');
const viewAllNotesModal = safeGetElementById('viewAllNotesModal');
const viewAllNotesList = safeGetElementById('viewAllNotesList');
const quickNotesModal = safeGetElementById('quickNotesModal');
const quickNotesList = safeGetElementById('quickNotesList');
const noteReaderModal = safeGetElementById('noteReaderModal');
const noteReaderTitle = safeGetElementById('noteReaderTitle');
const noteReaderContent = safeGetElementById('noteReaderContent');
const closeNoteReaderBtn = safeGetElementById('closeNoteReaderBtn');
const createNoteFromEmptyStateBtn = safeGetElementById('createNoteFromEmptyStateBtn');
const viewAllGoalsBtn = safeGetElementById('viewAllGoalsBtn');
const viewAllScheduledBtn = safeGetElementById('viewAllScheduledBtn');
const viewAllTransactionsBtn = safeGetElementById('viewAllTransactionsBtn');
const economyCalculatorModal = safeGetElementById('economyCalculatorModal');
const economyCalculatorForm = safeGetElementById('economyCalculatorForm');
const comparePrice1 = safeGetElementById('comparePrice1');
const compareQuantity1 = safeGetElementById('compareQuantity1');
const compareUnit1 = safeGetElementById('compareUnit1');
const product1Result = safeGetElementById('product1Result');
const comparePrice2 = safeGetElementById('comparePrice2');
const compareQuantity2 = safeGetElementById('compareQuantity2');
const compareUnit2 = safeGetElementById('compareUnit2');
const product2Result = safeGetElementById('product2Result');
const comparisonSummary = safeGetElementById('comparisonSummary');
const calculateComparisonBtn = safeGetElementById('calculateComparisonBtn');
const clearComparisonBtn = safeGetElementById('clearComparisonBtn');
const openEconomyCalculatorBtn = safeGetElementById('openEconomyCalculatorBtn');
const monthlyBudgetInput = safeGetElementById('monthlyBudgetInput');
const saveBudgetBtn = safeGetElementById('saveBudgetBtn');
const budgetSummaryCard = safeGetElementById('budgetSummaryCard');
const budgetAmountDisplay = safeGetElementById('budgetAmountDisplay');
const budgetSpentDisplay = safeGetElementById('budgetSpentDisplay');
const budgetProgress = safeGetElementById('budgetProgress');
const budgetProgressBar = safeGetElementById('budgetProgressBar');
export const reportsSection = safeGetElementById('reports-section');
export const reportStartDateInput = safeGetElementById('reportStartDateInput');
export const reportEndDateInput = safeGetElementById('reportEndDateInput');
const getCanvasAndContext = (id) => { /* ... código sem alterações ... */
    const c = safeGetElementById(id);
    const ctx = c?.getContext('2d');
    return ctx ? { canvas: c, ctx } : { canvas: c, ctx: null };
};
const { ctx: expChartCtx } = getCanvasAndContext('expensesChart');
const { ctx: incExpChartCtx } = getCanvasAndContext('incomeVsExpensesChart');
const { ctx: payMethChartCtx } = getCanvasAndContext('paymentMethodsChart');
export const { ctx: expChartCtx2 } = getCanvasAndContext('expensesChart2');
export const { ctx: incExpChartCtx2 } = getCanvasAndContext('incomeVsExpensesChart2');
export const { ctx: payMethChartCtx2 } = getCanvasAndContext('paymentMethodsChart2');
export const { ctx: monHistChartCtx } = getCanvasAndContext('monthlyHistoryChart');
let expensesChart, incomeVsExpensesChart, paymentMethodsChart;
let previousActiveElement = null;
export let expensesChart2, incomeVsExpensesChart2, paymentMethodsChart2, monthlyHistoryChart;
const attachmentViewerModal = safeGetElementById('attachmentViewerModal');
const attachmentViewerImage = safeGetElementById('attachmentViewerImage');
const attachmentViewerDownloadLink = safeGetElementById('attachmentViewerDownloadLink');
const cashFlowReportContainer = safeGetElementById('cashFlowReportContainer');
const themeModeButtons = document.querySelectorAll('.theme-mode-btn');
const themeColorOptions = document.querySelectorAll('#settings-section .theme-color-option');
const payWithPixBtn = safeGetElementById('payWithPixBtn'); // <<< PIX
const loadingIndicator = safeGetElementById('loadingIndicator'); // <<< Loading Indicator
// --- Fim Seletores DOM ---

// --- Aplicação State ---
// (Todo o estado da aplicação: transactions, goals, notes, etc. fica aqui)
export let transactions = [];
export let goals = [];
export let upcomingBills = [];
export let initialBalances = { pix: 0, cash: 0, card: 0 };
export let notes = [];
export let monthlyBudget = 0;
export let categoryStructure = { expense: [], income: [] };
export let recurringTransactions = [];
export let categoryBudgets = {};
export let assets = [];
export let liabilities = [];
export let userName = 'Usuário';
export let userEmail = 'email@exemplo.com';
export let currency = 'BRL';
export let selectedThemeColor = 'default';
export let themeModePreference = 'light';
export let currentTheme = 'light';
export let valuesHidden = false;
export let companySettings = { /* ... defaults ... */
    name: '', taxId: '', address: '', phone: '', email: '', logoUrl: 'img/logo_placeholder.png', invoiceNotes: ''
};
let hideScheduledPaymentWarning = false;
let currentEditingTransactionId = null;
let currentEditingGoalIndex = null;
let currentEditingNoteId = null;
let reminderCheckIntervalId = null;
let prefersDarkSchemeListener = null;
// --- Fim Aplicação State ---

// --- Funções Principais (Load/Save) ---
export function loadDataFromStorage() {
    console.log("Carregando dados do localStorage...");
    try {
        // Usa as chaves importadas de config.js
        transactions = JSON.parse(localStorage.getItem(config.LS_KEY_TRANSACTIONS)) || [];
        goals = JSON.parse(localStorage.getItem(config.LS_KEY_GOALS)) || [];
        upcomingBills = JSON.parse(localStorage.getItem(config.LS_KEY_UPCOMING_BILLS)) || [];
        initialBalances = JSON.parse(localStorage.getItem(config.LS_KEY_INITIAL_BALANCES)) || { pix: 0, cash: 0, card: 0 };
        notes = JSON.parse(localStorage.getItem(config.LS_KEY_NOTES)) || [];
        monthlyBudget = parseFloat(localStorage.getItem(config.LS_KEY_MONTHLY_BUDGET)) || 0;
        recurringTransactions = JSON.parse(localStorage.getItem(config.LS_KEY_RECURRING_TRANSACTIONS)) || [];
        categoryBudgets = JSON.parse(localStorage.getItem(config.LS_KEY_CATEGORY_BUDGETS)) || {};
        assets = JSON.parse(localStorage.getItem(config.LS_KEY_ASSETS)) || [];
        liabilities = JSON.parse(localStorage.getItem(config.LS_KEY_LIABILITIES)) || [];
        companySettings = JSON.parse(localStorage.getItem(config.LS_KEY_COMPANY_SETTINGS)) || { name: '', taxId: '', address: '', phone: '', email: '', logoUrl: 'img/logo_placeholder.png', invoiceNotes: '' };

        // Carrega e valida Estrutura de Categorias
        const storedStructure = JSON.parse(localStorage.getItem(config.LS_KEY_CATEGORY_STRUCTURE) || 'null');
        if (storedStructure && Array.isArray(storedStructure.expense) && Array.isArray(storedStructure.income)) {
            categoryStructure = storedStructure;
            const ensureFlags = (item) => { /* ... (função ensureFlags como antes, usando config.defaultCategories) ... */
                if (!item) return null;
                item.type = item.type || (config.defaultCategories.expense.includes(item.name) ? 'expense' : (config.defaultCategories.income.includes(item.name) ? 'income' : 'expense'));
                item.name = item.name || 'Categoria Inválida';
                item.isTitle = typeof item.isTitle === 'boolean' ? item.isTitle : item.name.startsWith('-- ');
                item.isDefault = typeof item.isDefault === 'boolean' ? item.isDefault : (config.defaultCategories[item.type] || []).includes(item.name);
                item.isHidden = typeof item.isHidden === 'boolean' ? item.isHidden : false;
                return item;
            };
            categoryStructure.expense = categoryStructure.expense.map(ensureFlags).filter(Boolean);
            categoryStructure.income = categoryStructure.income.map(ensureFlags).filter(Boolean);
        } else {
            console.warn("Estrutura de categorias não encontrada ou inválida. Inicializando dos padrões.");
            categoryStructure = { expense: [], income: [] };
            config.defaultCategories.expense.forEach(name => categoryStructure.expense.push({ name, type: 'expense', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false }));
            config.defaultCategories.income.forEach(name => categoryStructure.income.push({ name, type: 'income', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false }));
            localStorage.setItem(config.LS_KEY_CATEGORY_STRUCTURE, JSON.stringify(categoryStructure));
        }

        // --- Migração e Validação de Dados (Iterações) ---
        transactions.forEach(t => { /* ... (código de validação como antes, usando config.scheduledPaymentVisibleCategories se necessário) ... */
            t.id = t.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            t.amount = parseFloat(String(t.amount).replace(',', '.')) || 0;
            t.description = t.description || '';
            t.isScheduled = t.isScheduled === true;
            t.originatingBillId = t.originatingBillId || null;
            t.tags = Array.isArray(t.tags) ? t.tags : [];
            t.deductible = t.deductible === true;
            t.clientId = t.clientId || null;
            t.projectId = t.projectId || null;
            t.employeeId = t.employeeId || null;
            t.isRecurring = t.isRecurring === true;
            t.originatingRecurringId = t.originatingRecurringId || null;
            t.attachmentDataUrl = t.attachmentDataUrl || null;
            if (t.originatingDebtId === undefined) { t.originatingDebtId = null; }
            t.createdAt = t.createdAt || new Date().toISOString(); // Garante data de criação
            t.updatedAt = t.updatedAt || t.createdAt; // Garante data de atualização
        });
        goals.forEach(g => { /* ... (código de validação como antes) ... */
            g.id = g.id || `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            g.target = parseFloat(String(g.target).replace(',', '.')) || 0;
            g.current = parseFloat(String(g.current).replace(',', '.')) || 0;
            g.monthlyContribution = parseFloat(String(g.monthlyContribution).replace(',', '.')) || 0;
            if (g.goalType && !g.type) { g.type = g.goalType; delete g.goalType; }
            g.contributions = Array.isArray(g.contributions) ? g.contributions.map(c => ({ ...c, amount: parseFloat(String(c.amount).replace(',', '.')) || 0 })) : [];
            g.createdAt = g.createdAt || new Date().toISOString();
            g.completedAt = g.completedAt || null;
        });
        upcomingBills.forEach(b => { /* ... (código de validação como antes, usando config.scheduledPaymentVisibleCategories) ... */
            b.id = b.id || `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            b.amount = parseFloat(String(b.amount).replace(',', '.')) || 0;
            const validScheduledCats = config.scheduledPaymentVisibleCategories.map(cat => cat.value).filter(Boolean);
            if (!b.category || !validScheduledCats.includes(b.category)) {
                if (b.category?.toLowerCase().includes('aluguel') || b.category?.toLowerCase().includes('financiamento imob')) b.category = 'Aluguel';
                else if (b.category?.toLowerCase().includes('fatura') && b.category?.toLowerCase().includes('cart')) b.category = 'Fatura do cartão';
                else b.category = 'Faturas';
            }
            if (b.category === 'Fatura do cartão' && b.paymentMethod === 'card') b.paymentMethod = 'pix';
            if (b.processedTimestamp) b.processedTimestamp = String(b.processedTimestamp);
            b.processedDate = b.processedDate || null;
            // Garante que booleanos são booleanos
            b.paid = b.paid === true;
            b.pending = b.pending === true;
            b.insufficientBalance = b.insufficientBalance === true;
            b.processingAttempted = b.processingAttempted === true;
            b.autoDebit = b.autoDebit === true;
        });
        notes.forEach(n => { /* ... (código de validação como antes) ... */
            n.id = n.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            n.type = n.type === 'task' ? 'task' : 'note';
            n.createdAt = n.createdAt || new Date().toISOString();
            n.updatedAt = n.updatedAt || n.createdAt;
            n.color = n.color || 'default';
            n.reminderDate = n.reminderDate || null;
            n.reminderTime = n.reminderTime || null;
            n.reminderTriggered = n.reminderTriggered === true;
            const taskCounts = parseNoteContentForTasks(n.content || '', n.type);
            n.isTask = taskCounts.total > 0 && n.type === 'task';
            n.completedTasks = taskCounts.completed;
            n.totalTasks = taskCounts.total;
        });
        recurringTransactions.forEach(r => { /* ... (código de validação como antes) ... */
            r.id = r.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            r.amount = parseFloat(String(r.amount).replace(',', '.')) || 0;
            r.tags = Array.isArray(r.tags) ? r.tags : [];
            if (r.nextDueDate && typeof r.nextDueDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(r.nextDueDate)) {
                r.nextDueDate = calculateNextDueDate(r.startDate, r.frequency) || r.startDate;
            }
            r.createdAt = r.createdAt || new Date().toISOString();
        });

    } catch (e) {
        console.error("Erro Crítico ao Carregar Dados:", e);
        showAlert("Erro GRAVE ao carregar dados. Verifique o console e considere limpar o localStorage ou restaurar um backup.", 'danger', 15000);
        // Reset state (como antes)
        transactions = []; goals = []; upcomingBills = []; notes = [];
        initialBalances = { pix: 0, cash: 0, card: 0 }; monthlyBudget = 0;
        categoryStructure = { expense: [], income: [] };
        recurringTransactions = []; categoryBudgets = {}; assets = []; liabilities = [];
        companySettings = { name: '', taxId: '', address: '', phone: '', email: '', logoUrl: 'img/logo_placeholder.png', invoiceNotes: '' };
        // Reinicia estrutura de categorias dos padrões
        if (!categoryStructure.expense.length && !categoryStructure.income.length) {
            config.defaultCategories.expense.forEach(name => categoryStructure.expense.push({ name, type: 'expense', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false }));
            config.defaultCategories.income.forEach(name => categoryStructure.income.push({ name, type: 'income', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false }));
        }
    }

    // Carrega configurações do usuário e preferências (usando chaves do config.js)
    userName = localStorage.getItem(config.LS_KEY_USER_NAME) || 'Usuário';
    userEmail = localStorage.getItem(config.LS_KEY_USER_EMAIL) || 'email@exemplo.com';
    currency = localStorage.getItem(config.LS_KEY_CURRENCY) || 'BRL';
    selectedThemeColor = localStorage.getItem(config.LS_KEY_THEME_COLOR) || 'default';
    themeModePreference = localStorage.getItem(config.LS_KEY_THEME_MODE) || 'light';
    valuesHidden = localStorage.getItem(config.LS_KEY_VALUES_HIDDEN) === 'true';
    hideScheduledPaymentWarning = localStorage.getItem(config.LS_KEY_HIDE_SCHEDULED_WARNING) === 'true';
    console.log("Dados carregados.");
}

export function saveDataToStorage() {
    console.log("Salvando dados no localStorage...");
    try {
        // Usa as chaves importadas de config.js
        localStorage.setItem(config.LS_KEY_TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(config.LS_KEY_GOALS, JSON.stringify(goals));
        localStorage.setItem(config.LS_KEY_UPCOMING_BILLS, JSON.stringify(upcomingBills));
        localStorage.setItem(config.LS_KEY_INITIAL_BALANCES, JSON.stringify(initialBalances));
        localStorage.setItem(config.LS_KEY_NOTES, JSON.stringify(notes));
        localStorage.setItem(config.LS_KEY_MONTHLY_BUDGET, String(monthlyBudget));
        localStorage.setItem(config.LS_KEY_CATEGORY_STRUCTURE, JSON.stringify(categoryStructure));
        localStorage.setItem(config.LS_KEY_RECURRING_TRANSACTIONS, JSON.stringify(recurringTransactions));
        localStorage.setItem(config.LS_KEY_CATEGORY_BUDGETS, JSON.stringify(categoryBudgets));
        localStorage.setItem(config.LS_KEY_ASSETS, JSON.stringify(assets));
        localStorage.setItem(config.LS_KEY_LIABILITIES, JSON.stringify(liabilities));
        localStorage.setItem(config.LS_KEY_USER_NAME, userName);
        localStorage.setItem(config.LS_KEY_USER_EMAIL, userEmail);
        localStorage.setItem(config.LS_KEY_CURRENCY, currency);
        localStorage.setItem(config.LS_KEY_THEME_COLOR, selectedThemeColor);
        localStorage.setItem(config.LS_KEY_THEME_MODE, themeModePreference);
        localStorage.setItem(config.LS_KEY_VALUES_HIDDEN, String(valuesHidden));
        localStorage.setItem(config.LS_KEY_HIDE_SCHEDULED_WARNING, String(hideScheduledPaymentWarning));
        localStorage.setItem(config.LS_KEY_COMPANY_SETTINGS, JSON.stringify(companySettings));
        // Nota: Dados Business (clientes, projetos, etc.) são salvos diretamente pelos módulos Business
        console.log("Dados salvos com sucesso.");
    } catch (e) {
        console.error("Erro ao Salvar Dados:", e);
        showAlert("Erro ao salvar dados. Verifique o console.", 'danger');
    }
}
// --- Fim Funções Load/Save ---

// --- Funções de Atualização da UI ---
// (Todas as funções render*, update*Display, etc. ficam aqui, usando config.<constante> onde necessário)
// Exemplo: updateCategoryDropdowns (ajustado para usar config.scheduledPaymentVisibleCategories)
export function updateCategoryDropdowns(selectElement, mode, includeAddOption = false) {
    // ... (código da função como no exemplo anterior, já usa categoryStructure do state)
    if (!selectElement) return;
    const currentValue = selectElement.value;
    selectElement.innerHTML = '';
    let categoryList = [];
    let blankOptionText = '-- Selecione --';
    let addOptionText = '-- Adicionar Nova --';

    const populateOptions = (type) => {
        if (categoryStructure[type]) {
            categoryStructure[type].forEach(item => {
                if (!item || (item.isHidden && mode !== 'filter')) return;
                if (item.isTitle && mode !== 'filter') {
                    selectElement.innerHTML += `<option disabled class="category-title-option">${escapeHtml(item.name)}</option>`;
                } else if (!item.isTitle) {
                    categoryList.push(item.name);
                    selectElement.innerHTML += `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`;
                }
            });
        }
    };

    if (mode === 'expense' || mode === 'income') {
        selectElement.innerHTML = `<option value="" disabled selected>${blankOptionText}</option>`;
        populateOptions(mode);
        if (isProPlan && includeAddOption) {
            selectElement.innerHTML += `<option value="--add-new--" class="add-new-category-option">${addOptionText}</option>`;
        }
        selectElement.value = currentValue && categoryList.includes(currentValue) ? currentValue : '';
        if (!selectElement.value) selectElement.selectedIndex = 0;
    } else if (mode === 'filter') {
        let allVisibleCats = [];
        if (categoryStructure.expense) allVisibleCats = allVisibleCats.concat(categoryStructure.expense.filter(item => item && !item.isTitle && !item.isHidden).map(item => item.name));
        if (categoryStructure.income) allVisibleCats = allVisibleCats.concat(categoryStructure.income.filter(item => item && !item.isTitle && !item.isHidden).map(item => item.name));
        categoryList = [...new Set(allVisibleCats)].sort((a, b) => a.localeCompare(b));
        selectElement.innerHTML = `<option value="all">Todas Categorias</option>` + categoryList.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
        selectElement.value = currentValue && (currentValue === 'all' || categoryList.includes(currentValue)) ? currentValue : 'all';
    } else if (mode === 'scheduled') {
        // Usa a constante importada do config.js
        config.scheduledPaymentVisibleCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.text;
            if (cat.value === '') option.disabled = true;
            selectElement.appendChild(option);
        });
        selectElement.value = currentValue && config.scheduledPaymentVisibleCategories.some(c => c.value === currentValue) ? currentValue : '';
        if (!selectElement.value) selectElement.selectedIndex = 0;
    } else {
        console.warn(`Update Cat Dropdown: Modo inválido "${mode}"`);
        selectElement.innerHTML = `<option value="" disabled selected>-- Modo Inválido --</option>`;
    }
}
// ... (Restante das funções de UI: updateBalanceDisplay, renderTransactionHistory, etc., como antes)
export function updateBalanceDisplay() { /* ... código sem alterações ... */
    if (!remainingBalancePix || !remainingBalanceCash || !remainingBalanceCard) return;
    const { currentPix: p, currentCash: c, currentCard: d } = calculateCurrentBalances();
    remainingBalancePix.innerHTML = `<span class="monetary-value">${formatCurrency(p)}</span>`;
    remainingBalanceCash.innerHTML = `<span class="monetary-value">${formatCurrency(c)}</span>`;
    remainingBalanceCard.innerHTML = `<span class="monetary-value">${formatCurrency(d)}</span>`;
    const rpCard = remainingBalancePix.closest('.card');
    const rcCard = remainingBalanceCash.closest('.card');
    const rdCard = remainingBalanceCard.closest('.card');
    if (rpCard) { rpCard.classList.toggle('card-negative', p < 0); rpCard.classList.toggle('card-positive', p >= 0); }
    if (rcCard) { rcCard.classList.toggle('card-negative', c < 0); rcCard.classList.toggle('card-positive', c >= 0); }
    if (rdCard) { rdCard.classList.toggle('card-negative', d < 0); rdCard.classList.toggle('card-positive', d >= 0); }
}
export function updateBalanceDisplays() { /* ... código sem alterações ... */
    if (pixBalanceDisplay) pixBalanceDisplay.innerHTML = `<span class="monetary-value">${formatCurrency(initialBalances.pix)}</span>`;
    if (cashBalanceDisplay) cashBalanceDisplay.innerHTML = `<span class="monetary-value">${formatCurrency(initialBalances.cash)}</span>`;
    if (cardBalanceDisplay) cardBalanceDisplay.innerHTML = `<span class="monetary-value">${formatCurrency(initialBalances.card)}</span>`;
}
export function renderTransactionHistory() { /* ... código sem alterações ... */
    if (!transactionHistoryContainer) return;
    transactionHistoryContainer.innerHTML = '';
    const sorted = [...transactions].sort((a, b) => { /* ... */
        const dateA = parseDateInput(a.date);
        const dateB = parseDateInput(b.date);
        if (dateB > dateA) return 1; if (dateB < dateA) return -1;
        const idA = String(a.id); const idB = String(b.id); return idB.localeCompare(idA);
    });
    const visibleTransactions = sorted.map((t) => { /* ... */
        const globalIndex = transactions.findIndex(x => String(x.id) === String(t.id));
        if (globalIndex === -1) return null;
        return createTransactionElement(t, globalIndex, false);
    }).filter(element => element !== null);
    const recentVisible = visibleTransactions.slice(0, 5);
    if (recentVisible.length === 0) { transactionHistoryContainer.innerHTML = `<div class="empty-state info" style="padding: 1rem;"><i class="fas fa-history"></i><p>Sem histórico.</p></div>`; return; }
    recentVisible.forEach(element => { transactionHistoryContainer.appendChild(element); });
}
export function renderAllTransactions(transToRender = transactions) { /* ... código sem alterações ... */
    if (!allTransactionsContainer) return;
    allTransactionsContainer.innerHTML = '';
    const sorted = [...transToRender].sort((a, b) => { /* ... */
        const dateA = parseDateInput(a.date); const dateB = parseDateInput(b.date);
        if (dateB > dateA) return 1; if (dateB < dateA) return -1;
        const idA = String(a.id); const idB = String(b.id); return idB.localeCompare(idA);
    });
    const visibleTransactions = sorted.map((t) => { /* ... */
        const globalIndex = transactions.findIndex(x => String(x.id) === String(t.id));
        if (globalIndex === -1) return null;
        return createTransactionElement(t, globalIndex, true);
    }).filter(element => element !== null);
    if (visibleTransactions.length === 0) { if (transactionsEmptyState) transactionsEmptyState.style.display = 'flex'; allTransactionsContainer.style.display = 'none'; return; }
    if (transactionsEmptyState) transactionsEmptyState.style.display = 'none'; allTransactionsContainer.style.display = '';
    visibleTransactions.forEach(element => { allTransactionsContainer.appendChild(element); });
}
export function renderUpcomingBills() { /* ... código sem alterações ... */
    if (!upcomingBillsContainer) return;
    upcomingBillsContainer.innerHTML = '';
    const upcoming = upcomingBills.filter(b => !b.paid).sort((a, b) => { /* ... */
        const dateA = parseDateInput(a.date); const dateB = parseDateInput(b.date);
        if (dateA < dateB) return -1; if (dateA > dateB) return 1;
        const idA = String(a.id); const idB = String(b.id); return idA.localeCompare(idB);
    }).slice(0, 5);
    if (upcoming.length === 0) { upcomingBillsContainer.innerHTML = `<div class="empty-state info" style="padding:1rem;"><i class="fas fa-calendar-check"></i><p>Nenhum pag. próximo.</p></div>`; return; }
    upcoming.forEach(b => { const i = upcomingBills.findIndex(x => String(x.id) === String(b.id)); if (i !== -1) { upcomingBillsContainer.appendChild(createBillElement(b, i, false)); } });
}
export function renderAllScheduledPayments() { /* ... código sem alterações ... */
    if (!allScheduledPaymentsListContainer) return;
    allScheduledPaymentsListContainer.innerHTML = '';
    const sorted = [...upcomingBills].sort((a, b) => { /* ... */
        const dateA = parseDateInput(a.date); const dateB = parseDateInput(b.date);
        if (dateB > dateA) return 1; if (dateB < dateA) return -1;
        const idA = String(a.id); const idB = String(b.id); return idB.localeCompare(idA);
     });
    if (sorted.length === 0) { allScheduledPaymentsListContainer.innerHTML = `<div class="empty-state info" style="padding:2rem;"><i class="fas fa-calendar-plus"></i><p>Nenhum agendamento.</p></div>`; return; }
    sorted.forEach(b => { const i = upcomingBills.findIndex(x => String(x.id) === String(b.id)); if (i !== -1) { allScheduledPaymentsListContainer.appendChild(createBillElement(b, i, true)); } });
}
export function renderGoals() { /* ... código sem alterações ... */
    if (!goalsListContainer) return;
    goalsListContainer.innerHTML = '';
    if (goals.length === 0) { /* ... empty state ... */
        goalsListContainer.innerHTML = `<div class="empty-state info" style="padding:2rem;"><i class="fas fa-flag-checkered"></i><h3>Nenhuma meta</h3><button class="btn btn-primary" id="addGoalFromEmptyState"><i class="fas fa-plus"></i> Criar</button></div>`;
        const addBtn = goalsListContainer.querySelector('#addGoalFromEmptyState');
        if (addBtn) addBtn.onclick = openAddGoalModal;
        return;
    }
    const actG = goals.filter(g => !g.completed).sort((a, b) => parseDateInput(a.date) - parseDateInput(b.date));
    const compG = goals.filter(g => g.completed).sort((a, b) => parseDateInput(a.completedAt || '9999-12-31') - parseDateInput(b.completedAt || '9999-12-31'));
    actG.forEach(g => { const i = goals.findIndex(x => String(x.id) === String(g.id)); if (i !== -1) goalsListContainer.appendChild(createGoalElement(g, i)); });
    if (compG.length > 0) { /* ... render completed section ... */
        const cS = document.createElement('div'); cS.className = 'completed-goals-section';
        cS.innerHTML = `<h3 class="completed-goals-title">Concluídas <i class="fas fa-check-double"></i></h3>`;
        compG.forEach(g => { const i = goals.findIndex(x => String(x.id) === String(g.id)); if (i !== -1) cS.appendChild(createGoalElement(g, i)); });
        goalsListContainer.appendChild(cS);
    }
    updateGoalsSummary();
}
export function updateGoalsSummary() { /* ... código sem alterações ... */
     if (!goalsSummaryContainer) return;
    const aG = goals.filter(g => !g.completed); const cGC = goals.length - aG.length;
    let tA = aG.length; let tSA = aG.reduce((s, g) => s + g.current, 0); let tTA = aG.reduce((s, g) => s + g.target, 0); let tNA = Math.max(0, tTA - tSA);
    goalsSummaryContainer.innerHTML = ` <div class="goals-summary-grid"> <div class="summary-card"><div class="summary-icon"><i class="fas fa-tasks"></i></div><div class="summary-text"><h4>Ativas</h4><div class="summary-value">${tA}</div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-piggy-bank"></i></div><div class="summary-text"><h4>Economizado</h4><div class="summary-value"><span class="monetary-value">${formatCurrency(tSA)}</span></div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-coins"></i></div><div class="summary-text"><h4>Falta</h4><div class="summary-value"><span class="monetary-value">${formatCurrency(tNA)}</span></div></div></div><div class="summary-card"><div class="summary-icon"><i class="fas fa-check-double"></i></div><div class="summary-text"><h4>Concluídas</h4><div class="summary-value">${cGC}</div></div></div></div> ${aG.length > 0 ? `<div class="goals-priority"> <h4>Próximas Metas</h4> ${aG.sort((a, b) => parseDateInput(a.date) - parseDateInput(b.date)).slice(0, 3).map(g => `<div class="priority-item"><div class="priority-name">${escapeHtml(g.name)}</div> <div class="priority-date">${formatDisplayDate(g.date)}</div> <div class="priority-progress"> <div class="progress-bar" style="width: ${Math.min((g.target > 0 ? g.current / g.target : 0) * 100, 100)}%"></div> </div> </div>`).join('')} </div>` : ''}`;
}
export function renderNotes(container = notesListContainer, emptyStateElement = notesEmptyState) { /* ... código sem alterações ... */
    if (!container || !emptyStateElement) return;
    container.innerHTML = '';
    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (viewAllNotesList) {
        viewAllNotesList.innerHTML = '';
        if (sortedNotes.length === 0) { viewAllNotesList.innerHTML = '<p class="text-center text-muted p-4">Nenhuma nota.</p>'; }
        else { const fragment = document.createDocumentFragment(); sortedNotes.forEach(note => { fragment.appendChild(createNoteElement(note)); }); viewAllNotesList.appendChild(fragment); }
    }
    if (sortedNotes.length === 0) { emptyStateElement.style.display = 'flex'; container.style.display = 'none'; }
    else { emptyStateElement.style.display = 'none'; container.style.display = 'grid'; const fragment = document.createDocumentFragment(); sortedNotes.forEach(note => { fragment.appendChild(createNoteElement(note)); }); container.appendChild(fragment); }
}
export function updateBudgetDisplay() { /* ... código sem alterações ... */
    if (!budgetSummaryCard || !budgetAmountDisplay || !budgetSpentDisplay || !budgetProgress || !budgetProgressBar) { if (budgetSummaryCard) budgetSummaryCard.style.display = 'none'; return; }
    if (monthlyBudget <= 0) { budgetSummaryCard.style.display = 'none'; return; }
    budgetSummaryCard.style.display = '';
    const currentMonthYear = getLocalDateString().substring(0, 7); const spentThisMonth = calculateMonthlyExpenses(currentMonthYear);
    budgetAmountDisplay.innerHTML = `<span class="monetary-value">${formatCurrency(monthlyBudget)}</span>`;
    budgetSpentDisplay.innerHTML = `<span class="monetary-value">${formatCurrency(spentThisMonth)}</span>`;
    const percentage = monthlyBudget > 0 ? Math.min((spentThisMonth / monthlyBudget) * 100, 100) : 0;
    budgetProgressBar.style.width = `${percentage}%`;
    budgetProgress.classList.remove('budget-ok', 'budget-warning', 'budget-over');
    if (percentage < 80) budgetProgress.classList.add('budget-ok');
    else if (percentage < 100) budgetProgress.classList.add('budget-warning');
    else budgetProgress.classList.add('budget-over');
}
// --- Fim Funções de UI ---

// --- Criação de Elementos HTML Dinâmicos ---
// (Funções create*Element ficam aqui, usando config.<constante> quando necessário)
// Exemplo: createTransactionElement (ajustado para usar config.categoryIconMapping)
function createTransactionElement(transaction, index, showActions) {
    // ... (lógica para não renderizar Tx interna de fatura) ...
    if (transaction.isScheduled && transaction.type === 'income' && transaction.paymentMethod === 'card' && transaction.category === 'Pagamento Fatura Cartão' && transaction.originatingBillId) {
        return null;
    }

    const div = document.createElement('div');
    div.className = `transaction-item ${transaction.isScheduled ? 'is-scheduled-transaction' : ''} ${transaction.isRecurring ? 'is-recurring-transaction' : ''}`;
    div.dataset.index = index;
    div.dataset.id = transaction.id;

    const isInc = transaction.type === 'income';
    const iconBg = isInc ? 'bg-success' : 'bg-danger';
    const amtCls = isInc ? 'amount-positive' : 'amount-negative';
    const amtPfx = isInc ? '+ ' : '- ';

    // Usa o mapeamento importado
    let catIcon = config.categoryIconMapping[transaction.category] || config.categoryIconMapping['default'];
    let effectiveItemName = escapeHtml(transaction.item);
    const isCCBillPaymentDebitPart = transaction.isScheduled && transaction.type === 'expense' && transaction.category === 'Faturas' && transaction.originatingBillId && upcomingBills.some(b => String(b.id) === String(transaction.originatingBillId) && b.category === 'Fatura do cartão');
    if (isCCBillPaymentDebitPart) catIcon = 'fas fa-receipt'; // Ícone específico

    // Usa detalhes do método de pagamento importado
    const pmInfo = config.paymentMethodDetails[transaction.paymentMethod] || config.paymentMethodDetails.default;
    const pmIcon = `<i class="${pmInfo.icon} fa-fw"></i>`;
    const pmText = pmInfo.text;

    let originIndicator = ''; /* ... (lógica do originIndicator como antes) ... */
        if (transaction.isScheduled && transaction.originatingBillId) { const billOrigin = upcomingBills.find(b => String(b.id) === String(transaction.originatingBillId)); const originTitle = billOrigin ? `Origem: Agendamento "${escapeHtml(billOrigin.name)}" (ID: ${transaction.originatingBillId})` : `Origem: Agendamento (ID: ${transaction.originatingBillId})`; originIndicator = `<span class="scheduled-origin-indicator" title="${originTitle}"><i class="fas fa-history"></i></span>`; }
        else if (transaction.isRecurring && transaction.originatingRecurringId) { const recOrigin = recurringTransactions.find(r => String(r.id) === String(transaction.originatingRecurringId)); const originTitle = recOrigin ? `Origem: Recorrência "${escapeHtml(recOrigin.name)}" (ID: ${transaction.originatingRecurringId})` : `Origem: Recorrência (ID: ${transaction.originatingRecurringId})`; originIndicator = `<span class="recurring-origin-indicator" title="${originTitle}"><i class="fas fa-sync-alt"></i></span>`; }
        else if (transaction.originatingDebtId) { const originTitle = `Origem: Dívida ID ${transaction.originatingDebtId.substring(0,8)}...`; originIndicator = `<span class="debt-origin-indicator text-info" title="${originTitle}"><i class="fas fa-hand-holding-usd"></i></span>`; }
    const descIndicator = showActions && transaction.description && !transaction.description.startsWith('(Ref. Dívida Excluída)') ? `<span class="transaction-description-icon" title="${escapeHtml(transaction.description)}"><i class="far fa-comment-dots"></i></span>` : '';
    const tagsIndicator = showActions && isProPlan && transaction.tags?.length > 0 ? `<span class="transaction-tags-icon" title="Tags: ${escapeHtml(formatTags(transaction.tags))}"><i class="fas fa-tags"></i></span>` : '';
    const projectIndicator = showActions && isBusinessPlan && transaction.projectId ? `<span class="transaction-project-icon" title="Projeto Associado"><i class="fas fa-briefcase"></i></span>` : '';
    const clientIndicator = showActions && isBusinessPlan && transaction.clientId ? `<span class="transaction-client-icon" title="Cliente Associado"><i class="fas fa-user-tie"></i></span>` : '';
    const employeeIndicator = showActions && isBusinessPlan && transaction.employeeId ? `<span class="transaction-employee-icon" title="Funcionário Associado"><i class="fas fa-user"></i></span>` : '';
    const attachmentIndicator = showActions && isProPlan && transaction.attachmentDataUrl ? `<span class="transaction-attachment-icon" title="Comprovante Anexado"><i class="fas fa-paperclip"></i></span>` : '';
    let actions = ''; /* ... (lógica dos actions como antes) ... */
        if (showActions) { if (transaction.isScheduled || transaction.isRecurring || transaction.originatingDebtId) { let title = transaction.isScheduled ? "Gerencie via Agendamentos" : transaction.isRecurring ? "Gerencie via Recorrências" : transaction.originatingDebtId ? "Gerencie via Devedores" : "Transação automática"; actions = ` <button class="action-btn edit-transaction btn-sm btn-outline-secondary" title="${title}" disabled><i class="fas fa-pencil-alt"></i></button> <button class="action-btn delete-transaction btn-sm btn-outline-danger" title="${title}" disabled><i class="fas fa-trash-alt"></i></button>`; } else { actions = ` <button class="action-btn edit-transaction btn-sm btn-outline-secondary" title="Editar"><i class="fas fa-pencil-alt"></i></button> <button class="action-btn delete-transaction btn-sm btn-outline-danger" title="Excluir"><i class="fas fa-trash-alt"></i></button>`; } }

    // Monta o HTML
    div.innerHTML = `
        <div class="transaction-icon ${iconBg}"><i class="${catIcon}"></i></div>
        <div class="transaction-details">
            <div class="transaction-title">${effectiveItemName} ${originIndicator} ${attachmentIndicator} ${descIndicator} ${tagsIndicator} ${projectIndicator} ${clientIndicator} ${employeeIndicator}</div>
            <div class="transaction-meta"><span><i class="far fa-calendar-alt fa-fw"></i>${formatDisplayDate(transaction.date)}</span> <span><i class="fas fa-tag fa-fw"></i>${escapeHtml(transaction.category)}</span></div>
            <div class="transaction-payment-method ${transaction.paymentMethod || 'unknown'}">${pmIcon} ${escapeHtml(pmText)}</div>
        </div>
        <div class="transaction-amount ${amtCls}">${amtPfx} <span class="monetary-value">${formatCurrency(transaction.amount)}</span></div>
        ${showActions ? `<div class="transaction-actions">${actions}</div>` : ''}
    `;
    return div;
}
// Exemplo: createBillElement (ajustado para usar config.categoryIconMapping e config.paymentMethodDetails)
function createBillElement(bill, index, showDeleteButton) {
    // ... (código da função como antes, usando config.<constante>)
    const div = document.createElement('div');
    div.className = 'bill-item'; div.dataset.index = index; div.dataset.id = bill.id;
    const today = getLocalDateString(); const isOverdue = !bill.paid && bill.date < today;
    let catIcon = config.categoryIconMapping[bill.category] || config.categoryIconMapping['default'];
    if (bill.category === 'Fatura do cartão') catIcon = 'fas fa-credit-card';
    if (bill.paid) div.classList.add('paid'); else if (bill.insufficientBalance) div.classList.add('insufficient-balance', 'pending'); else if (bill.pending) div.classList.add('pending'); else if (isOverdue) div.classList.add('overdue');
    let statTxt = '', statIcon = ''; /* ... (lógica status como antes) ... */
        if (bill.paid) { statTxt = `Pago ${formatDisplayDate(bill.processedDate||'N/D')}`; statIcon = '<i class="fas fa-check-circle text-success"></i>'; }
        else if (bill.insufficientBalance) { statTxt = 'Saldo insufic.'; statIcon = '<i class="fas fa-exclamation-triangle text-warning"></i>'; }
        else if (bill.pending) { statTxt = 'Pendente Conf.'; statIcon = '<i class="fas fa-hourglass-half text-info"></i>'; }
        else if (isOverdue) { statTxt = 'Vencido'; statIcon = '<i class="fas fa-calendar-times text-danger"></i>'; }
        else { statTxt = `Vence ${formatDisplayDate(bill.date)}`; statIcon = '<i class="far fa-calendar-alt text-muted"></i>'; }
    const pmInfo = config.paymentMethodDetails[bill.paymentMethod] || config.paymentMethodDetails.default;
    const pmIcon = `<i class="${pmInfo.icon} fa-fw"></i>`; const pmText = pmInfo.text;
    const catDisp = config.scheduledPaymentVisibleCategories.find(c => c.value === bill.category)?.text || bill.category || 'Agendam.';
    const payDesc = `${pmIcon} Pagar c/ ${pmText}`;
    let acts = ''; /* ... (lógica actions como antes, usando isWithinGracePeriod) ... */
        if (!bill.paid) { const btnClass = `btn btn-sm manual-pay-btn`; let payTitle = `Confirmar pag. ${bill.pending?'pendente':(isOverdue?'vencido':'')} usando ${pmText}`; if(bill.insufficientBalance) payTitle = `Saldo insuf. em ${pmText}. Clique p/ pag. manual`; acts += `<button class="${btnClass} btn-outline-secondary ${isOverdue && !bill.insufficientBalance ? 'border-danger text-danger' : ''}" title="${escapeHtml(payTitle)}"><i class="fas fa-hand-holding-usd me-1"></i>Pagar</button>`; if (showDeleteButton) { acts += ` <button class="action-btn delete-scheduled-item-btn btn btn-sm btn-outline-danger" title="Excluir Agend. (não pago)"><i class="fas fa-trash-alt"></i></button>`; } }
        else { if (!showDeleteButton) { acts += `<span class="action-btn info-paid" title="${escapeHtml(statTxt)}"><i class="fas fa-check-circle text-success"></i></span>`; } else { let delTitle = `Remover Histórico (pago)`; const txExists = transactions.some(t => t.isScheduled && String(t.originatingBillId) === String(bill.id)); if (txExists && isWithinGracePeriod(bill.processedTimestamp)) { delTitle = `Cancelar Pgto/Excluir Agend. (reversível)`; } else if (txExists) { delTitle = `Excluir Histórico (Tx mantida - antigo)`; } else { delTitle = `Excluir Histórico (Tx não encontrada)`; } acts += `<button class="action-btn delete-scheduled-item-btn btn btn-sm btn-outline-danger" title="${escapeHtml(delTitle)}"><i class="fas fa-trash-alt"></i></button>`; } }

    div.innerHTML = `<div class="bill-category-icon"><i class="${catIcon}"></i></div> <div class="bill-details"> <div class="bill-title">${escapeHtml(bill.name)} <span class="bill-category-text">(${escapeHtml(catDisp)})</span></div> <div class="bill-meta"> <span>${statIcon} ${escapeHtml(statTxt)}</span> <span class="separator">|</span> <span>${payDesc}</span> ${bill.autoDebit&&!bill.paid&&!bill.insufficientBalance?'<span class="separator">|</span><span title="Déb. Auto Ativo"><i class="fas fa-robot"></i> Auto</span>':''} ${bill.autoDebit&&bill.paid?'<span class="separator">|</span><span title="Pago via Déb. Auto"><i class="fas fa-robot text-success"></i> Pgo Auto</span>':''} ${bill.autoDebit&&bill.insufficientBalance?'<span class="separator">|</span><span title="Déb. Auto Falhou"><i class="fas fa-robot text-danger"></i> Falha</span>':''} </div> </div> <div class="bill-amount amount-negative">- <span class="monetary-value">${formatCurrency(bill.amount)}</span></div> <div class="bill-actions">${acts}</div>`;
    return div;
}
// Exemplo: createGoalElement (ajustado para usar config.goalTypes)
function createGoalElement(goal, index) {
    // ... (código da função como antes, usando config.goalTypes)
    const div = document.createElement('div');
    div.className = `goal-item ${goal.completed?'completed':''}`; div.dataset.index = index; div.dataset.id = goal.id;
    const goalTypeInfo = config.goalTypes[goal.type] || config.goalTypes['other']; // Usa config
    const goalTypeName = goalTypeInfo.name; const goalTypeIcon = goalTypeInfo.icon;
    const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
    const today = new Date(); today.setHours(0,0,0,0); const goalDate = parseDateInput(goal.date); if (!isNaN(goalDate)) goalDate.setHours(0,0,0,0); const daysLeft = isNaN(goalDate) ? Infinity : Math.ceil((goalDate - today) / (1000 * 60 * 60 * 24));
    let timeLeftText = '', timeLeftClass = ''; /* ... (lógica time left como antes) ... */
        if (goal.completed) { timeLeftText = `Concluída ${formatDisplayDate(goal.completedAt||goal.createdAt)}`; timeLeftClass = 'completed'; }
        else if (isNaN(goalDate)) { timeLeftText = 'Data Inválida'; timeLeftClass = 'overdue'; }
        else if (daysLeft < 0) { timeLeftText = `Vencida ${Math.abs(daysLeft)} dia(s)`; timeLeftClass = 'overdue'; }
        else if (daysLeft === 0) { timeLeftText = 'Vence hoje!'; timeLeftClass = 'due-today'; }
        else if (daysLeft < 30) { timeLeftText = `Faltam ${daysLeft} dia(s)`; timeLeftClass = 'due-soon'; }
        else { timeLeftText = `~ ${Math.ceil(daysLeft/30.44)} mese(s)`; timeLeftClass = 'due-later'; }
    const projection = !goal.completed ? calculateProjection(goal) : null;
    const canCompleteManually = !goal.completed && progress >= 100;
    const themeColorVar = `--theme-color-${goal.themeColor||selectedThemeColor||'default'}`; const progressBarColor = `var(${themeColorVar}, var(--primary-color, #0d6efd))`;
    div.innerHTML = `<div class="goal-header"> <div class="goal-content"> ${goal.image?`<img src="${escapeHtml(goal.image)}" class="goal-image" alt="${escapeHtml(goal.name)}">`:'<div class="goal-image-placeholder"><i class="fas fa-image"></i></div>'} <div class="goal-info"> <h3>${escapeHtml(goal.name)}</h3> <div class="goal-meta"> <span class="goal-type"><i class="fas ${goalTypeIcon} fa-fw"></i> ${escapeHtml(goalTypeName)}</span> <span class="goal-time-left ${timeLeftClass}"><i class="far fa-clock fa-fw"></i> ${escapeHtml(timeLeftText)}</span> </div> </div> </div> <div class="goal-actions"> <button class="action-btn edit-goal btn-sm btn-outline-secondary" title="Editar Meta"><i class="fas fa-pencil-alt"></i></button> <button class="action-btn delete-goal btn-sm btn-outline-danger" title="Excluir Meta"><i class="fas fa-trash-alt"></i></button> </div> </div> <div class="goal-progress-details"> <div class="progress-container"> <div class="progress-bar" style="width:${progress}%; background:${progressBarColor};"></div> </div> <div class="goal-progress-info"> <span><span class="monetary-value">${formatCurrency(goal.current)}</span> / <span class="monetary-value">${formatCurrency(goal.target)}</span></span> <span>(${Math.round(progress)}%)</span> </div> </div> ${projection?`<div class="projection-info"><small><i class="fas fa-chart-line fa-fw"></i> Proj: ${projection.monthsNeeded} meses (${escapeHtml(projection.completionDateDisplay)})</small></div>`:''} ${!goal.completed?`<div class="goal-contribution"><label for="contribution-${goal.id}" class="sr-only">Contribuição</label><input type="number" id="contribution-${goal.id}" placeholder="${formatPlaceholderCurrency()}" step="0.01" min="0.01" class="form-control contribution-input monetary-input"><button class="btn btn-sm btn-outline add-contribution-btn" title="Adicionar"><i class="fas fa-plus"></i> Add</button></div>`:''} ${canCompleteManually?`<div class="goal-complete-action"><button class="btn btn-sm btn-success complete-goal-btn"><i class="fas fa-check"></i> Concluir</button></div>`:''}`;
    return div;
}
// Ajuste para usar config.goalTypes (remoção das funções getGoalTypeName/Icon)
// function getGoalTypeName(typeKey) { /* ... REMOVIDA ... */ }
// function getGoalTypeIcon(typeKey) { /* ... REMOVIDA ... */ }

function createNoteElement(note) { /* ... (código como antes) ... */
    const div = document.createElement('div');
    div.className = `note-card note-color-${note.color || 'default'} note-type-${note.type}`; div.dataset.noteId = note.id;
    let reminderActiveClass = ''; if (note.reminderDate && !note.reminderTriggered) { const reminderDateTime = parseDateTimeInput(note.reminderDate, note.reminderTime); if (!isNaN(reminderDateTime) && reminderDateTime <= new Date()) { reminderActiveClass = ' has-reminder-active'; } }
    const processedContent = processNoteContentForDisplay(note.content || '', note.id, false);
    let reminderInfo = ''; if (note.reminderDate) { const displayDateTime = formatDisplayDateTime(note.reminderDate, note.reminderTime); reminderInfo = `<span class="note-reminder-info${reminderActiveClass}" title="Lembrete para ${displayDateTime}"><i class="far fa-bell"></i> ${displayDateTime}</span>`; }
    let taskInfo = ''; if (note.type === 'task' && note.totalTasks > 0) { taskInfo = `<span class="note-task-info" title="${note.completedTasks} de ${note.totalTasks} tarefas"><i class="fas fa-tasks"></i> ${note.completedTasks}/${note.totalTasks}</span>`; }
    const updatedDate = new Date(note.updatedAt); const formattedUpdatedDate = `${String(updatedDate.getDate()).padStart(2, '0')}/${String(updatedDate.getMonth() + 1).padStart(2, '0')}/${updatedDate.getFullYear().toString().slice(-2)} ${String(updatedDate.getHours()).padStart(2, '0')}:${String(updatedDate.getMinutes()).padStart(2, '0')}`;
    const typeIcon = note.type === 'task' ? '<i class="fas fa-clipboard-list note-type-indicator" title="Tarefa"></i>' : '<i class="far fa-file-alt note-type-indicator" title="Nota"></i>';
    div.innerHTML = `<div class="note-header">${typeIcon} ${note.title ? `<h4 class="note-title">${escapeHtml(note.title)}</h4>` : `<h4 class="note-title text-muted fst-italic">(Sem Título)</h4>`}<div class="note-actions"><button class="action-btn edit-note btn-sm btn-outline-secondary" title="Editar"><i class="fas fa-pencil-alt"></i></button><button class="action-btn delete-note btn-sm btn-outline-danger" title="Excluir"><i class="fas fa-trash-alt"></i></button></div></div><div class="note-content">${processedContent}</div><div class="note-footer"><span class="note-date" title="Atualizado"><i class="far fa-calendar-alt"></i> ${formattedUpdatedDate}</span><div class="note-meta-icons">${taskInfo} ${taskInfo && reminderInfo ? '&nbsp;|&nbsp;' : ''} ${reminderInfo}</div></div>`;
    return div;
}
// --- Fim Criação de Elementos HTML ---

// --- Processar Conteúdo da Nota ---
// (Funções processNoteContentForDisplay e parseNoteContentForTasks usam config.PENDING_CHECKLIST e config.COMPLETED_CHECKLIST)
function processNoteContentForDisplay(content, noteId, generateCheckboxes = false) {
    // ... (código como antes, usando config.PENDING_CHECKLIST e config.COMPLETED_CHECKLIST)
    let processedHtml = ''; const lines = (content || '').split('\n');
    lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trimStart(); let isCompleted = false, isTaskLine = false, taskMarker = '';
        if (trimmedLine.startsWith(config.PENDING_CHECKLIST)) { isTaskLine = true; isCompleted = false; taskMarker = config.PENDING_CHECKLIST; }
        else if (trimmedLine.startsWith(config.COMPLETED_CHECKLIST)) { isTaskLine = true; isCompleted = true; taskMarker = config.COMPLETED_CHECKLIST; }
        if (isTaskLine) {
            const leadingSpace = line.substring(0, line.indexOf(taskMarker)); const restOfLine = line.substring(leadingSpace.length + taskMarker.length);
            const checkboxClass = isCompleted ? 'completed' : 'pending'; const textClass = isCompleted ? 'completed-text' : '';
            let checkboxElement;
            if (generateCheckboxes) { checkboxElement = `<input type="checkbox" class="reader-task-checkbox" data-note-id="${noteId}" data-line-index="${lineIndex}" ${isCompleted ? 'checked' : ''}>`; }
            else { checkboxElement = `<span class="task-checkbox-visual ${checkboxClass}">${escapeHtml(taskMarker)}</span>`; }
            processedHtml += `<div class="task-line-item">${leadingSpace}${checkboxElement}<span class="task-text ${textClass}">${escapeHtml(restOfLine)}</span></div>`;
        } else { processedHtml += `<div>${escapeHtml(line)}</div>`; }
    }); return processedHtml;
}
function parseNoteContentForTasks(content, noteType) {
    // ... (código como antes, usando config.PENDING_CHECKLIST e config.COMPLETED_CHECKLIST)
    let completed = 0, total = 0;
    if (noteType === 'task' && content) {
        const lines = content.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trimStart();
            if (trimmedLine.startsWith(config.PENDING_CHECKLIST)) total++;
            else if (trimmedLine.startsWith(config.COMPLETED_CHECKLIST)) { total++; completed++; }
        });
    } return { completed, total };
}
// --- Fim Processar Conteúdo da Nota ---

// --- Funções da Calculadora de Economia (PRO) ---
// (calculateUnitCost, handleComparisonCalculation, clearComparisonForm ficam aqui, sem alterações)
function calculateUnitCost(price, quantity, unit) { /* ... código sem alterações ... */
    if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0 || !unit) { return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Dados inválidos', error: true }; }
    let baseQuantity = quantity; let baseUnit = unit; let costPerBaseUnit = NaN; let unitLabel = '';
    switch (unit) { case 'kg': baseQuantity = quantity * 1000; baseUnit = 'g'; unitLabel = 'g'; break; case 'g': baseUnit = 'g'; unitLabel = 'g'; break; case 'L': baseQuantity = quantity * 1000; baseUnit = 'ml'; unitLabel = 'ml'; break; case 'ml': baseUnit = 'ml'; unitLabel = 'ml'; break; case 'unidade': baseUnit = 'unidade'; unitLabel = 'unid.'; break; default: return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Unidade inválida', error: true }; }
    costPerBaseUnit = price / baseQuantity; if (isNaN(costPerBaseUnit)) { return { costPerBaseUnit: NaN, baseUnit: null, displayValue: 'Erro no cálculo', error: true }; }
    let formattedCost; if (baseUnit === 'g' || baseUnit === 'ml') { const preciseCost = costPerBaseUnit.toFixed(5); if (costPerBaseUnit < 0.01 && costPerBaseUnit > 0) { formattedCost = `R$ ${parseFloat(preciseCost).toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 5})}`; } else { formattedCost = formatCurrency(costPerBaseUnit); } } else { formattedCost = formatCurrency(costPerBaseUnit); }
    const displayValue = `${formattedCost} por ${unitLabel}`; return { costPerBaseUnit, baseUnit, displayValue, error: false };
}
function handleComparisonCalculation() { /* ... código sem alterações ... */
    product1Result.textContent = ''; product1Result.className = 'comparison-result'; product2Result.textContent = ''; product2Result.className = 'comparison-result'; comparisonSummary.textContent = ''; comparisonSummary.style.display = 'none';
    const price1 = parseFloat(String(comparePrice1?.value || '0').replace(',', '.')) || 0; const quantity1 = parseFloat(String(compareQuantity1?.value || '0').replace(',', '.')) || 0; const unit1 = compareUnit1?.value || ''; const price2 = parseFloat(String(comparePrice2?.value || '0').replace(',', '.')) || 0; const quantity2 = parseFloat(String(compareQuantity2?.value || '0').replace(',', '.')) || 0; const unit2 = compareUnit2?.value || '';
    if (!price1 || !quantity1 || !unit1 || !price2 || !quantity2 || !unit2) { showAlert('Preencha todos os campos de comparação (*).', 'warning'); return; }
    const result1 = calculateUnitCost(price1, quantity1, unit1); const result2 = calculateUnitCost(price2, quantity2, unit2);
    product1Result.textContent = result1.displayValue; if (result1.error) product1Result.classList.add('text-danger'); product2Result.textContent = result2.displayValue; if (result2.error) product2Result.classList.add('text-danger');
    if (result1.error || result2.error) { showAlert('Erro nos dados de um ou ambos os produtos. Verifique.', 'danger'); return; }
    if (result1.baseUnit !== result2.baseUnit) { comparisonSummary.innerHTML = `Erro: Unidades base diferentes (<strong>${result1.baseUnit}</strong> vs <strong>${result2.baseUnit}</strong>). Não é possível comparar.`; comparisonSummary.className = 'comparison-summary mt-3 text-danger'; comparisonSummary.style.display = 'block'; showAlert('As unidades selecionadas não são diretamente comparáveis (ex: Kg vs Litro).', 'warning'); return; }
    let cheaperProduct = 0; if (result1.costPerBaseUnit < result2.costPerBaseUnit) { cheaperProduct = 1; product1Result.classList.add('cheaper'); product2Result.classList.add('more-expensive'); } else if (result2.costPerBaseUnit < result1.costPerBaseUnit) { cheaperProduct = 2; product2Result.classList.add('cheaper'); product1Result.classList.add('more-expensive'); } else { product1Result.classList.add('cheaper'); product2Result.classList.add('cheaper'); }
    let summaryText = ''; const unitLabel = result1.baseUnit === 'unidade' ? 'unidade' : result1.baseUnit; if (cheaperProduct === 1) { const diff = result2.costPerBaseUnit - result1.costPerBaseUnit; const percentage = ((diff / result2.costPerBaseUnit) * 100).toFixed(1); summaryText = `<strong>Produto 1</strong> é <strong class="text-success">${percentage}%</strong> mais barato por ${unitLabel}.`; } else if (cheaperProduct === 2) { const diff = result1.costPerBaseUnit - result2.costPerBaseUnit; const percentage = ((diff / result1.costPerBaseUnit) * 100).toFixed(1); summaryText = `<strong>Produto 2</strong> é <strong class="text-success">${percentage}%</strong> mais barato por ${unitLabel}.`; } else { summaryText = `Ambos os produtos têm o <strong>mesmo preço</strong> por ${unitLabel}.`; }
    comparisonSummary.innerHTML = summaryText; comparisonSummary.className = 'comparison-summary mt-3'; comparisonSummary.style.display = 'block';
}
function clearComparisonForm() { /* ... código sem alterações ... */
    if (economyCalculatorForm) economyCalculatorForm.reset();
    if (product1Result) { product1Result.textContent = ''; product1Result.className = 'comparison-result'; } if (product2Result) { product2Result.textContent = ''; product2Result.className = 'comparison-result'; } if (comparisonSummary) { comparisonSummary.textContent = ''; comparisonSummary.style.display = 'none'; }
    if (compareUnit1) compareUnit1.value = 'g'; if (compareUnit2) compareUnit2.value = 'kg'; if (comparePrice1) comparePrice1.focus(); updatePlaceholders();
}
// --- Fim Calculadora ---

// --- Cálculos ---
// (calculateCurrentBalances, calculateCurrentBalancesWithout, calculateProjection, calculateMonthlyExpenses ficam aqui, sem alterações)
export function calculateCurrentBalances() { /* ... código sem alterações ... */
    let p = initialBalances.pix, c = initialBalances.cash, d = initialBalances.card;
    transactions.forEach(t => { if (!t || isNaN(t.amount)) return; const f = t.type === 'income' ? 1 : -1; if (t.paymentMethod === 'pix') p += t.amount * f; else if (t.paymentMethod === 'cash') c += t.amount * f; else if (t.paymentMethod === 'card') d += t.amount * f; });
    return { currentPix: p, currentCash: c, currentCard: d };
}
function calculateCurrentBalancesWithout(idx) { /* ... código sem alterações ... */
    let p = initialBalances.pix, c = initialBalances.cash, d = initialBalances.card;
    transactions.forEach((t, i) => { if (i === idx || !t || isNaN(t.amount)) return; const f = t.type === 'income' ? 1 : -1; if (t.paymentMethod === 'pix') p += t.amount * f; else if (t.paymentMethod === 'cash') c += t.amount * f; else if (t.paymentMethod === 'card') d += t.amount * f; });
    return { currentPix: p, currentCash: c, currentCard: d };
}
function calculateProjection(goal) { /* ... código sem alterações ... */
    if (!goal || goal.completed || !goal.monthlyContribution || goal.monthlyContribution <= 0 || goal.target <= goal.current) return null;
    const r = goal.target - goal.current; const m = Math.ceil(r / goal.monthlyContribution); if (m <= 0) return null;
    const cD = new Date(); cD.setMonth(cD.getMonth() + m); const y = cD.getFullYear(); const mn = String(cD.getMonth() + 1).padStart(2, '0'); const dy = String(cD.getDate()).padStart(2, '0');
    return { monthsNeeded: m, completionDateDisplay: `${dy}/${mn}/${y}` };
}
function calculateMonthlyExpenses(monthYear) { /* ... código sem alterações ... */
    if (!monthYear || monthYear.length !== 7) return 0;
    return transactions.reduce((total, t) => { if (t.type === 'expense' && t.date.startsWith(monthYear) && !isNaN(t.amount)) { return total + t.amount; } return total; }, 0);
}
// --- Fim Cálculos ---

// --- Ações (Adicionar, Editar, Excluir Itens) ---
// (Funções add*, save*, delete*, confirm*, etc. ficam aqui, usando config.<constante> quando necessário)
// Exemplo: saveScheduledPayment (usa config.MAX_SCHEDULED_ITEMS_BASIC e config.scheduledPaymentVisibleCategories)
async function saveScheduledPayment(e) {
    // ... (código como antes, usando config.<constante>)
    e.preventDefault();
    const nI = scheduledItemInput?.value.trim() || ''; const aI = scheduledAmountInput?.value || ''; const dI = scheduledDateInput?.value || ''; const cS = scheduledCategoryInput; const pS = scheduledPaymentMethodInput; const aC = scheduledAutoDebitInput?.checked || false;
    if (!cS || !pS) return showAlert("Erro interno.", 'danger');
    const n = nI || 'Agendamento'; const a = parseFloat(String(aI).replace(',', '.')) || 0; const d = dI; const c = cS.value; const p = pS.value; const b = aC;
    let err = []; if (!n) err.push("Descrição"); if (!d) err.push("Data"); if (isNaN(a) || a <= 0) err.push("Valor"); if (!c || c === '' || !config.scheduledPaymentVisibleCategories.find(cat => cat.value === c && cat.value !== '')) err.push("Categoria"); if (!p) err.push("Método");
    if (c === 'Fatura do cartão' && p === 'card') return showAlert('Erro: Fatura não paga com Conta/Cartão.', 'danger');
    if (err.length > 0) return showAlert(`Preencha: ${err.join(', ')}.`, 'warning');
    if (!isProPlan && !isBusinessPlan && upcomingBills.filter(bill => !bill.paid).length >= config.MAX_SCHEDULED_ITEMS_BASIC) { // Verifica limite de *não pagos*
        return showAlert(`Limite de ${config.MAX_SCHEDULED_ITEMS_BASIC} agendamentos ativos atingido.`, 'warning');
    }
    const userAgreed = await showScheduledPaymentWarningModal(); if (!userAgreed) return;
    const newB = { id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, name: n, amount: a, date: d, category: c, paymentMethod: p, autoDebit: b, paid: false, pending: !b, insufficientBalance: false, processingAttempted: false, processedTimestamp: null, processedDate: null };
    upcomingBills.push(newB); saveDataToStorage(); renderUpcomingBills(); renderAllScheduledPayments(); checkScheduledPayments(); closeModal(scheduledPaymentModal); showAlert('Agendado!', 'success'); if (saveScheduledPaymentBtn) showSuccessFeedback(saveScheduledPaymentBtn, "Salvo!");
}
// ... (Restante das funções de Ação, usando config.<constante> onde aplicável)
async function addTransactionFromModal(e) { /* ... código como antes, usa config.scheduleToTransactionCategoryMap ... */
    e.preventDefault();
    const modalClientSelect = document.getElementById('modalClientSelect'); const modalProjectSelect = document.getElementById('modalProjectSelect'); const modalEmployeeSelect = document.getElementById('modalEmployeeSelect'); const deductibleCheckbox = document.getElementById('modalDeductible'); const hiddenAttachInput = document.getElementById('modalAttachmentDataUrlHidden');
    if (!modalItemInput || !modalAmountInput || !modalDateInput || !modalCategoryInput || !modalPaymentMethodInput || !modalDescriptionInput || !modalOriginatingBillIdInput || !modalTypeInput) return showAlert('Erro interno no formulário.', 'danger');
    const dt = modalDateInput.value; const it = modalItemInput.value.trim(); const am = parseFloat(String(modalAmountInput.value).replace(',', '.')) || 0; const ty = modalTypeInput.value; const ca = modalCategoryInput.value; const pm = modalPaymentMethodInput.value; const ds = modalDescriptionInput.value.trim(); const oId = modalOriginatingBillIdInput.value || null;
    const clientId = isBusinessPlan && modalClientSelect ? modalClientSelect.value || null : null; const projectId = isBusinessPlan && modalProjectSelect ? modalProjectSelect.value || null : null; const employeeId = isBusinessPlan && modalEmployeeSelect ? modalEmployeeSelect.value || null : null; const isDeductible = isBusinessPlan && deductibleCheckbox ? deductibleCheckbox.checked : false; const tagsInput = document.getElementById('modalTagsInput'); const tags = isProPlan && tagsInput ? parseTags(tagsInput.value) : []; const attachmentUrl = (isProPlan && hiddenAttachInput) ? hiddenAttachInput.value || null : null;
    if (!it || !dt || isNaN(am) || am <= 0 || !ca || ca.startsWith('-- ') || !pm) return showAlert('Preencha os campos obrigatórios (*).', 'warning');
    if (ty === 'expense') { const { currentPix, currentCash, currentCard } = calculateCurrentBalances(); let balance = 0; let methodName = ''; if (pm === 'pix') { balance = currentPix; methodName = 'Pix'; } else if (pm === 'cash') { balance = currentCash; methodName = 'Dinheiro'; } else if (pm === 'card') { balance = currentCard; methodName = 'Conta/Cartão'; } if (pm === 'pix' || pm === 'cash' || pm === 'card') { if (am > balance) { return showAlert(`Saldo ${methodName} insuficiente (${formatCurrency(balance)}) para esta despesa. Transação não adicionada.`, 'danger'); } } }
    const tIdBase = Date.now() + Math.random();
    let newTxBase = { id: '', date: dt, item: it, amount: am, type: ty, category: '', paymentMethod: pm, description: ds, isScheduled: false, originatingBillId: null, isRecurring: false, originatingRecurringId: null, tags: tags, deductible: isDeductible, clientId: clientId, projectId: projectId, employeeId: employeeId, originatingDebtId: null, attachmentDataUrl: attachmentUrl, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (oId) { const bIdx = upcomingBills.findIndex(b => String(b.id) === String(oId)); if (bIdx === -1) { showAlert('Pgto registrado, mas agendamento original não encontrado.', 'warning'); newTxBase.id = `std-orphan-${tIdBase}`; newTxBase.category = ca; newTxBase.isScheduled = false; transactions.push(newTxBase); } else { const bill = upcomingBills[bIdx]; if (bill.category === 'Fatura do cartão') { if (pm === 'card') return showAlert('Erro: Fatura não pode ser paga com Conta/Cartão.', 'danger'); const paymentTx = { ...newTxBase, id: `pay-${tIdBase}`, category: 'Faturas', isScheduled: true, originatingBillId: oId, tags: ['fatura-cartao', 'pagamento-manual', ...(tags || [])], description: `Pgto manual conf. agend. ID ${oId} ("${escapeHtml(bill.name)}"). Método: ${pm.toUpperCase()}. ${ds || ''}`.trim() }; transactions.push(paymentTx); const creditTx = { ...newTxBase, id: `cred-${tIdBase}`, type: 'income', category: 'Pagamento Fatura Cartão', paymentMethod: 'card', isScheduled: true, originatingBillId: oId, tags: ['fatura-cartao', 'credito-manual'], description: `Crédito ref. pag. manual conf. agend. ID ${oId}. Pago via ${pm.toUpperCase()}.`, attachmentDataUrl: null }; transactions.push(creditTx); console.log(`Fatura Cartão Manual ${oId}: Criadas Tx Saída (${paymentTx.id}) e Tx Crédito (${creditTx.id})`); showAlert(`Pag. manual Fatura Cartão "${escapeHtml(bill.name)}" confirmado!`, 'success'); } else { let txCat = config.scheduleToTransactionCategoryMap[bill.category] || (categoryStructure.expense.some(c => c && c.name === ca && !c.isTitle) ? ca : 'Faturas'); const scheduledTx = { ...newTxBase, id: `std-${tIdBase}`, category: txCat, isScheduled: true, originatingBillId: oId, description: ds || `Pgto manual conf. agend. ID ${oId} ("${escapeHtml(bill.name)}"). Método: ${pm.toUpperCase()}.`.trim() }; transactions.push(scheduledTx); console.log(`Agendamento Normal Manual ${oId}: Criada Tx ${scheduledTx.id}`); showAlert(`Pag. manual "${escapeHtml(bill.name)}" (${pm.toUpperCase()}) confirmado!`, 'success'); } bill.paid = true; bill.processedDate = getLocalDateString(); bill.processedTimestamp = String(tIdBase); bill.pending = false; bill.insufficientBalance = false; bill.processingAttempted = true; bill.paymentMethod = pm; } }
    else { const manualTx = { ...newTxBase, id: `man-${tIdBase}`, category: ca }; transactions.push(manualTx); console.log(`Transação Manual Normal: Criada Tx ${manualTx.id}`); if (saveTransactionBtn) showSuccessFeedback(saveTransactionBtn, "Salvo!"); }
    if (hiddenAttachInput) hiddenAttachInput.value = ''; saveDataToStorage(); updateUIafterTransactionChange(); closeModal(transactionModal);
}
async function saveEditedTransaction() { /* ... código como antes ... */
    const editClientSelect = document.getElementById('editClientSelect'); const editProjectSelect = document.getElementById('editProjectSelect'); const editEmployeeSelect = document.getElementById('editEmployeeSelect'); const editDeductibleCheckbox = document.getElementById('editDeductible'); const hiddenAttachInput = document.getElementById('editAttachmentDataUrlHidden');
    if (currentEditingTransactionId === null || !editForm) { return showAlert("Erro: ID da transação para edição não encontrado.", 'danger'), closeModal(editModal); }
    const editIndex = transactions.findIndex(t => String(t.id) === String(currentEditingTransactionId)); if (editIndex === -1) { currentEditingTransactionId = null; return showAlert("Erro ao encontrar transação para salvar. Pode ter sido excluída.", 'danger'), closeModal(editModal); }
    if (!editDateInput || !editItemInput || !editAmountInput || !editTypeInput || !editCategoryInput || !editPaymentMethodInput || !editDescriptionInput) return showAlert("Erro interno.", "danger");
    const oT = transactions[editIndex]; if (oT.isScheduled || oT.isRecurring || oT.originatingDebtId) { const originType = oT.isScheduled ? 'agendada' : (oT.isRecurring ? 'recorrente' : 'de dívida'); return showAlert(`Transação ${originType} não pode ser editada diretamente.`, 'warning'), closeModal(editModal); }
    const nDt = editDateInput.value; const nIt = editItemInput.value.trim(); const nAm = parseFloat(String(editAmountInput.value).replace(',', '.')) || 0; const nTy = editTypeInput.value; const nCa = editCategoryInput.value; const nPm = editPaymentMethodInput.value; const nDs = editDescriptionInput.value.trim();
    const clientId = isBusinessPlan && editClientSelect ? editClientSelect.value || null : oT.clientId; const projectId = isBusinessPlan && editProjectSelect ? editProjectSelect.value || null : oT.projectId; const employeeId = isBusinessPlan && editEmployeeSelect ? editEmployeeSelect.value || null : oT.employeeId; const isDeductible = isBusinessPlan && editDeductibleCheckbox ? editDeductibleCheckbox.checked : oT.deductible; const tagsInput = document.getElementById('editTagsInput'); const tags = isProPlan && tagsInput ? parseTags(tagsInput.value) : oT.tags; const attachmentUrl = (isProPlan && hiddenAttachInput) ? hiddenAttachInput.value || null : oT.attachmentDataUrl;
    if (!nIt || !nDt || isNaN(nAm) || nAm <= 0 || !nCa || nCa.startsWith('-- ') || !nPm) return showAlert('Preencha obrigatórios (*).', 'warning');
    if (nTy === 'expense' && (nPm === 'pix' || nPm === 'cash' || nPm === 'card')) { const tempBalances = calculateCurrentBalancesWithout(editIndex); let balanceBeforeEdit = 0; let methodName = ''; if (nPm === 'pix') { balanceBeforeEdit = tempBalances.currentPix; methodName = 'Pix'; } else if (nPm === 'cash') { balanceBeforeEdit = tempBalances.currentCash; methodName = 'Dinheiro'; } else if (nPm === 'card') { balanceBeforeEdit = tempBalances.currentCard; methodName = 'Conta/Cartão'; } if (nAm > balanceBeforeEdit) { return showAlert(`Saldo ${methodName} insuficiente (${formatCurrency(balanceBeforeEdit)}) para salvar esta alteração. Edição não salva.`, 'danger'); } }
    const updatedTxData = { ...oT, date: nDt, item: nIt, amount: nAm, type: nTy, category: nCa, paymentMethod: nPm, description: nDs, tags: tags, deductible: isDeductible, clientId: clientId, projectId: projectId, employeeId: employeeId, attachmentDataUrl: attachmentUrl, updatedAt: new Date().toISOString() };
    transactions[editIndex] = updatedTxData; if (hiddenAttachInput) hiddenAttachInput.value = ''; saveDataToStorage(); updateUIafterTransactionChange(); closeModal(editModal); showAlert('Transação atualizada!', 'info'); if (saveEditBtn) showSuccessFeedback(saveEditBtn, "Atualizado!");
}
async function confirmDeleteTransaction(transactionIdToDelete) { /* ... código como antes ... */
    const transactionIndexToDelete = transactions.findIndex(t => String(t.id) === String(transactionIdToDelete)); if (transactionIndexToDelete === -1) { return showAlert("Erro: Transação para exclusão não encontrada.", 'danger'); }
    const txToDelete = { ...transactions[transactionIndexToDelete] }; if (txToDelete.isScheduled || txToDelete.isRecurring || txToDelete.originatingDebtId) { const originType = txToDelete.isScheduled ? 'agendada' : (txToDelete.isRecurring ? 'recorrente' : 'de dívida'); return showAlert(`Transação ${originType} não pode ser excluída diretamente. Gerencie pela origem.`, 'warning'); }
    const conf = await showConfirmModal(`Excluir transação manual: <b>"${escapeHtml(txToDelete.item)}"</b> (${formatCurrency(txToDelete.amount)})?<br>Ação irreversível.`);
    if (conf) { transactions.splice(transactionIndexToDelete, 1); saveDataToStorage(); updateUIafterTransactionChange(); showAlert('Transação manual excluída.', 'info'); }
}
async function deleteScheduledItem(index) { /* ... código como antes, usa config.GRACE_PERIOD_MS ... */
    if (index === null || index < 0 || index >= upcomingBills.length || !upcomingBills[index]) { return showAlert("Erro: Agendamento não encontrado.", 'danger'); }
    const bill = upcomingBills[index]; const billId = bill.id; const billName = bill.name; let confirmMessage = `Excluir agendamento <b>"${escapeHtml(billName)}"</b>?<br>`;
    const txIndices = transactions.reduce((acc, t, idx) => { if (t.isScheduled && String(t.originatingBillId) === String(billId)) { acc.push(idx); } return acc; }, []); const txExists = txIndices.length > 0;
    if (bill.paid && txExists) { if (isWithinGracePeriod(bill.processedTimestamp)) { confirmMessage += `<br><strong>REVERSÍVEL:</strong> Pgto será cancelado e Tx(s) removida(s).`; } else { confirmMessage += `<br><strong>Histórico:</strong> Tx(s) antiga(s) mantida(s).`; } } else if (bill.paid && !txExists) { confirmMessage += `<br>Pago, mas Tx(s) não encontrada(s).`; } else { confirmMessage += `<br>Agendamento não pago.`; }
    const conf = await showConfirmModal(confirmMessage, 'Confirmar Exclusão', 'danger'); if (!conf) return;
    let messageType = 'info'; let feedbackMessage = ''; let scheduleRemoved = false; let transactionRemoved = false;
    if (bill.paid && txExists && isWithinGracePeriod(bill.processedTimestamp)) { txIndices.sort((a, b) => b - a).forEach(idx => transactions.splice(idx, 1)); transactionRemoved = true; }
    upcomingBills.splice(index, 1); scheduleRemoved = true;
    if (transactionRemoved && scheduleRemoved) { feedbackMessage = `Pgto e agendamento "${escapeHtml(billName)}" revertidos.`; messageType = 'success'; } else if (scheduleRemoved && bill.paid && txExists) { feedbackMessage = `Histórico agendamento "${escapeHtml(billName)}" removido.`; messageType = 'info'; } else if (scheduleRemoved) { feedbackMessage = `Agendamento "${escapeHtml(billName)}" removido.`; messageType = 'info'; }
    saveDataToStorage(); renderUpcomingBills(); renderAllScheduledPayments(); const transSection = document.getElementById('transactions-section'); if (transSection?.classList.contains('active')) { filterTransactions(); } updateBalanceDisplay(); updateCharts(); showAlert(feedbackMessage, messageType);
}
async function saveGoal(e) { /* ... código como antes, usa config.MAX_ACTIVE_GOALS_BASIC ... */
    e.preventDefault(); if (!goalNameInput || !goalTargetInput || !goalDateInput || !goalTypeInput) return;
    const nm = goalNameInput.value.trim(); const tg = parseFloat(String(goalTargetInput.value).replace(',', '.')) || 0; const dt = goalDateInput.value; const iF = goalImageInput?.files?.[0]; const sC = goalModal?.querySelector('.theme-color-option.selected')?.dataset.color || selectedThemeColor || 'default'; const mC = parseFloat(String(monthlyContributionInput?.value || '0').replace(',', '.')) || 0; const gT = goalTypeInput.value;
    if (!nm || isNaN(tg) || tg <= 0 || !dt || !gT || gT === "") return showAlert('Preencha: Nome, Valor, Data, Tipo.', 'warning');
    const isEd = currentEditingGoalIndex !== null && goals[currentEditingGoalIndex];
    if (!isEd && !isProPlan && !isBusinessPlan) { const activeGoalsCount = goals.filter(g => !g.completed).length; if (activeGoalsCount >= config.MAX_ACTIVE_GOALS_BASIC) { closeModal(goalModal); return showAlert(`Limite de ${config.MAX_ACTIVE_GOALS_BASIC} metas atingido.`, 'warning'); } }
    const gData = { id: isEd ? goals[currentEditingGoalIndex].id : `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, name: nm, target: tg, date: dt, type: gT, monthlyContribution: mC, themeColor: sC, current: isEd ? goals[currentEditingGoalIndex].current : 0, contributions: isEd ? goals[currentEditingGoalIndex].contributions || [] : [], completed: isEd ? goals[currentEditingGoalIndex].completed : false, completedAt: isEd ? goals[currentEditingGoalIndex].completedAt : null, createdAt: isEd ? goals[currentEditingGoalIndex].createdAt : new Date().toISOString(), image: isEd ? goals[currentEditingGoalIndex].image : null };
    const proc = (imgD = null) => { if (imgD) gData.image = imgD; else if (isEd && goalImagePreview?.style.display === 'none' && !iF) gData.image = null; else if (isEd && !imgD && !goalImagePreview?.style.display?.includes('none') && !iF) gData.image = goals[currentEditingGoalIndex].image; if (isEd) goals[currentEditingGoalIndex] = gData; else goals.push(gData); saveDataToStorage(); renderGoals(); updateGoalsSummary(); closeModal(goalModal); showAlert(`Meta ${isEd?'atualizada':'salva'}!`, 'success'); currentEditingGoalIndex = null; if (saveGoalBtn) showSuccessFeedback(saveGoalBtn, isEd ? 'Atualizada!' : 'Salva!'); };
    if (iF) { const r = new FileReader(); r.onload = ev => proc(ev.target?.result?.toString()); r.onerror = e => { showAlert("Erro upload imagem.", 'danger'); proc(gData.image); }; r.readAsDataURL(iF); } else proc(gData.image);
}
async function addContribution(goalIndex, amountString) { /* ... código como antes ... */
    if (goalIndex === null || goalIndex < 0 || goalIndex >= goals.length || !goals[goalIndex]) return showAlert("Meta não encontrada.", 'warning');
    const goal = goals[goalIndex]; const amount = parseFloat(String(amountString || '0').replace(',', '.')) || 0; if (isNaN(amount) || amount <= 0) return showAlert('Valor inválido.', 'warning'); if (goal.completed) return showAlert(`Meta "${escapeHtml(goal.name)}" concluída.`, 'info');
    goal.current += amount; goal.contributions = goal.contributions || []; goal.contributions.push({ date: getLocalDateString(), amount: amount });
    let comp = false; if (goal.current >= goal.target && !goal.completed) { goal.completed = true; goal.completedAt = new Date().toISOString(); comp = true; }
    saveDataToStorage(); renderGoals(); updateGoalsSummary(); if (comp) showAlert(`Meta "${escapeHtml(goal.name)}" alcançada!`, 'success');
    const item = goalsListContainer?.querySelector(`.goal-item[data-index="${goalIndex}"]`); const inp = item?.querySelector('.contribution-input'); if (inp) inp.value = ''; const btn = item?.querySelector('.add-contribution-btn'); if (btn) showSuccessFeedback(btn, 'Add!');
}
async function completeGoal(goalIndex) { /* ... código como antes ... */
    if (goalIndex === null || goalIndex < 0 || goalIndex >= goals.length || !goals[goalIndex]) return showAlert("Erro ao completar meta.", 'warning');
    const goal = goals[goalIndex]; if (goal.completed) return showAlert("Meta já concluída.", 'info'); if (goal.current < goal.target) { const nd = goal.target - goal.current; return showAlert(`Faltam ${formatCurrency(nd)}.`, 'warning'); }
    goal.completed = true; goal.completedAt = new Date().toISOString(); saveDataToStorage(); renderGoals(); updateGoalsSummary(); showAlert(`Meta "${escapeHtml(goal.name)}" concluída!`, 'success');
}
async function deleteGoal(goalIndex) { /* ... código como antes ... */
    if (goalIndex === null || goalIndex < 0 || goalIndex >= goals.length || !goals[goalIndex]) return showAlert("Meta não encontrada.", 'warning');
    const goal = goals[goalIndex]; const conf = await showConfirmModal(`Excluir meta "${escapeHtml(goal.name)}"?`);
    if (conf) { goals.splice(goalIndex, 1); saveDataToStorage(); renderGoals(); updateGoalsSummary(); showAlert('Meta excluída.', 'info'); }
}
async function saveNote(e) { /* ... código como antes ... */
    e.preventDefault(); if (!noteForm || !noteTypeSelect || !noteTitleInput || !noteContentInput || !noteReminderDateInput || !noteReminderTimeInput || !noteColorOptionsContainer || !noteIdInput) return showAlert("Erro interno.", 'danger');
    const type = noteTypeSelect.value; const title = noteTitleInput.value.trim(); const content = noteContentInput.value; const reminderDate = noteReminderDateInput.value || null; const reminderTime = reminderDate ? (noteReminderTimeInput.value || null) : null; const selectedColorEl = noteColorOptionsContainer.querySelector('.color-option.selected'); const color = selectedColorEl ? selectedColorEl.dataset.color : 'default'; const noteId = noteIdInput.value || null;
    if (!content && type === 'note') return showAlert("Conteúdo obrigatório.", 'warning'); if (type === 'task' && !content && !title) return showAlert("Tarefa precisa título/conteúdo.", 'warning'); if (reminderDate && isNaN(parseDateInput(reminderDate))) return showAlert("Data lembrete inválida.", 'warning'); if (reminderTime) { const tp = reminderTime.split(':'); if (tp.length < 2 || isNaN(parseInt(tp[0])) || isNaN(parseInt(tp[1]))) return showAlert("Hora lembrete inválida.", 'warning'); }
    const now = new Date().toISOString(); const taskCounts = parseNoteContentForTasks(content, type);
    let noteData = { type, title, content, color, reminderDate, reminderTime, updatedAt: now, isTask: taskCounts.total > 0 && type === 'task', completedTasks: taskCounts.completed, totalTasks: taskCounts.total };
    let isEd = false, msg = 'Nota salva!', origN = null;
    if (noteId) { const idx = notes.findIndex(n => String(n.id) === String(noteId)); if (idx > -1) { isEd = true; origN = { ...notes[idx] }; noteData.reminderTriggered = (origN.reminderDate === reminderDate && origN.reminderTime === reminderTime) ? origN.reminderTriggered : false; notes[idx] = { ...origN, ...noteData }; msg = 'Nota atualizada!'; } else return showAlert("Erro: Nota edição não encontrada.", 'danger'); }
    else { noteData = { ...noteData, id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, createdAt: now, reminderTriggered: false }; notes.push(noteData); }
    saveDataToStorage(); renderNotes(); if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent(); if (noteReaderModal?.classList.contains('active')) { const rId = noteReaderModal.dataset.currentNoteId; if (rId && String(rId) === String(noteData.id || noteId)) updateNoteReaderContent(noteData.id || noteId); }
    closeModal(noteModal); showAlert(msg, 'success'); if (saveNoteBtn) showSuccessFeedback(saveNoteBtn, isEd ? "Atualizada!" : "Salva!"); checkReminders();
}
async function confirmDeleteNote(noteId) { /* ... código como antes ... */
    const noteIndex = notes.findIndex(n => String(n.id) === String(noteId)); if (noteIndex === -1) return showAlert("Erro: Nota não encontrada.", 'danger');
    const note = notes[noteIndex]; const tSnip = note.title ? `"${escapeHtml(truncateText(note.title, 20))}"` : 'esta nota'; const cSnip = escapeHtml(truncateText(note.content.replace(/([-+]\s)/g, ''), 30));
    const conf = await showConfirmModal(`Excluir ${note.type==='task'?'tarefa':'nota'} ${tSnip}? <br><small>Conteúdo: ${cSnip}</small><br>Irreversível.`, 'Confirmar Exclusão', 'danger');
    if (conf) { if (noteReaderModal?.classList.contains('active') && noteReaderModal.dataset.currentNoteId === String(noteId)) closeModal(noteReaderModal); if (quickNotesModal?.classList.contains('active')) closeModal(quickNotesModal); notes.splice(noteIndex, 1); saveDataToStorage(); renderNotes(); showAlert(`${note.type === 'task' ? 'Tarefa' : 'Nota'} excluída.`, 'info'); }
}
function handleReaderCheckboxChange(event) { /* ... código como antes ... */
    const target = event.target; if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox' || !target.closest('#noteReaderContent')) return;
    const noteId = target.dataset.noteId; const lineIndex = parseInt(target.dataset.lineIndex, 10); const makeComplete = target.checked;
    if (!noteId || isNaN(lineIndex)) { console.error("Dados inválidos checkbox:", target.dataset); return showAlert("Erro ao processar tarefa.", "warning"); }
    toggleTaskStatus(noteId, lineIndex, makeComplete);
}
function toggleTaskStatus(noteId, lineIndex, makeComplete) { /* ... código como antes, usa config.PENDING/COMPLETED_CHECKLIST ... */
    const noteIndex = notes.findIndex(n => String(n.id) === String(noteId)); if (noteIndex === -1) return showAlert("Erro: Nota não encontrada.", 'danger'); let note = notes[noteIndex]; if (note.type !== 'task') return; let contentLines = note.content.split('\n'); if (lineIndex < 0 || lineIndex >= contentLines.length) return showAlert("Erro: Linha inválida.", 'danger'); let line = contentLines[lineIndex]; const trimmedLine = line.trimStart(); const leadingSpace = line.substring(0, line.indexOf(trimmedLine));
    let currentMarker = trimmedLine.startsWith(config.PENDING_CHECKLIST) ? config.PENDING_CHECKLIST : (trimmedLine.startsWith(config.COMPLETED_CHECKLIST) ? config.COMPLETED_CHECKLIST : null); if (!currentMarker) return console.warn(`Linha ${lineIndex} não é checklist: ${line}`), showAlert("Erro: Item inválido.", "warning");
    const newMarker = makeComplete ? config.COMPLETED_CHECKLIST : config.PENDING_CHECKLIST;
    if (currentMarker !== newMarker) { contentLines[lineIndex] = leadingSpace + newMarker + line.substring(leadingSpace.length + currentMarker.length); note.content = contentLines.join('\n'); note.updatedAt = new Date().toISOString(); const taskCounts = parseNoteContentForTasks(note.content, note.type); note.isTask = taskCounts.total > 0; note.completedTasks = taskCounts.completed; note.totalTasks = taskCounts.total; notes[noteIndex] = note; saveDataToStorage(); showAlert(`Tarefa ${makeComplete ? 'concluída' : 'pendente'}.`, 'success', 1500); }
    else { console.log(`Status tarefa já ${makeComplete ? 'completo' : 'pendente'}.`); }
    if (noteReaderModal?.classList.contains('active') && noteReaderModal.dataset.currentNoteId === String(noteId)) updateNoteReaderContent(noteId); renderNotes(); if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent();
}
// --- Fim Ações ---

// --- Ações de Configurações ---
// (adjustBalance, saveSettings, saveBudget, saveCompanySettings, exportData, handleFileImport, importData, saveUserSettings ficam aqui)
function adjustBalance(method, amount) { /* ... código como antes ... */
    if (!initialBalances || !['pix', 'cash', 'card'].includes(method) || typeof amount !== 'number' || isNaN(amount)) return showAlert('Erro ajuste.', 'danger');
    const cBal = initialBalances[method] || 0; const nBal = cBal + amount; initialBalances[method] = nBal;
    saveDataToStorage(); updateBalanceDisplay(); updateBalanceDisplays(); updateCharts();
    const inpId = `initialBalance${method[0].toUpperCase()+method.slice(1)}`; const inpEl = safeGetElementById(inpId); if (inpEl) { inpEl.value = nBal.toFixed(2); inpEl.classList.add('balance-updated-highlight'); setTimeout(() => inpEl.classList.remove('balance-updated-highlight'), 1500); }
}
function saveSettings() { /* ... código como antes ... */
    if (!initialBalancePixInput || !initialBalanceCashInput || !initialBalanceCardInput) return showAlert("Erro interno.", 'danger');
    const nP = parseFloat(initialBalancePixInput.value || '0') || 0; const nC = parseFloat(initialBalanceCashInput.value || '0') || 0; const nCd = parseFloat(initialBalanceCardInput.value || '0') || 0;
    let ch = false; if (initialBalances.pix !== nP || initialBalances.cash !== nC || initialBalances.card !== nCd) { initialBalances = { pix: nP, cash: nC, card: nCd }; ch = true; }
    if (ch) { saveDataToStorage(); updateBalanceDisplay(); updateBalanceDisplays(); updateCharts(); const btn = safeGetElementById('saveInitialBalances'); if (btn) showSuccessFeedback(btn, 'Saldos Salvos!'); else showAlert('Saldos salvos!', 'success'); }
    else { const btn = safeGetElementById('saveInitialBalances'); if (btn) { btn.classList.add('btn-outline-secondary'); btn.classList.remove('btn-primary'); const oT = btn.innerHTML; btn.innerHTML = `<i class="fas fa-info-circle"></i> Sem alterações`; btn.disabled = true; setTimeout(() => { btn.innerHTML = oT; btn.classList.add('btn-primary'); btn.classList.remove('btn-outline-secondary'); btn.disabled = false; }, 2000); } }
}
function saveBudget() { /* ... código como antes ... */
    if (!monthlyBudgetInput) return showAlert("Erro interno: Campo de orçamento não encontrado.", 'danger');
    const budgetValue = parseFloat(String(monthlyBudgetInput.value).replace(',', '.')) || 0; if (budgetValue < 0) return showAlert("Orçamento não pode ser negativo.", 'warning');
    if (monthlyBudget !== budgetValue) { monthlyBudget = budgetValue; saveDataToStorage(); updateBudgetDisplay(); if (saveBudgetBtn) showSuccessFeedback(saveBudgetBtn, 'Orçamento Salvo!'); else showAlert('Orçamento salvo!', 'success'); }
    else { if (saveBudgetBtn) { const originalText = saveBudgetBtn.innerHTML; saveBudgetBtn.innerHTML = `<i class="fas fa-info-circle"></i> Sem alterações`; saveBudgetBtn.disabled = true; setTimeout(() => { saveBudgetBtn.innerHTML = originalText; saveBudgetBtn.disabled = false; }, 2000); } }
}
function saveCompanySettings() { /* ... código como antes ... */
    const companyNameInput = safeGetElementById('companyNameInput'); const companyTaxIdInput = safeGetElementById('companyTaxIdInput'); const companyAddressInput = safeGetElementById('companyAddressInput'); const companyPhoneInput = safeGetElementById('companyPhoneInput'); const companyEmailInput = safeGetElementById('companyEmailInput'); const invoiceLogoUrlInput = safeGetElementById('invoiceLogoUrlInput'); const invoiceNotesInput = safeGetElementById('invoiceNotesInput'); const saveBtn = safeGetElementById('saveCompanySettingsBtn');
    if (!companyNameInput || !saveBtn) { return showAlert("Erro interno: Campos de configuração da empresa não encontrados.", "danger"); }
    const newSettings = { name: companyNameInput.value.trim(), taxId: companyTaxIdInput ? companyTaxIdInput.value.trim() : '', address: companyAddressInput ? companyAddressInput.value.trim() : '', phone: companyPhoneInput ? companyPhoneInput.value.trim() : '', email: companyEmailInput ? companyEmailInput.value.trim() : '', logoUrl: invoiceLogoUrlInput ? invoiceLogoUrlInput.value.trim() : '', invoiceNotes: invoiceNotesInput ? invoiceNotesInput.value.trim() : '', };
    if (!newSettings.name) { return showAlert("O Nome da Empresa é obrigatório.", "warning"); }
    if (JSON.stringify(companySettings) !== JSON.stringify(newSettings)) { companySettings = newSettings; saveDataToStorage(); showSuccessFeedback(saveBtn, "Informações Salvas!"); }
    else { const originalText = saveBtn.innerHTML; saveBtn.innerHTML = `<i class="fas fa-info-circle"></i> Sem alterações`; saveBtn.disabled = true; setTimeout(() => { saveBtn.innerHTML = originalText; saveBtn.disabled = false; }, 2000); }
}
function exportData() { /* ... código como antes, usa config.APP_VERSION e chaves LS_* ... */
    const dataToExport = { version: config.APP_VERSION, transactions, goals, upcomingBills, notes, initialBalances, monthlyBudget, userName, userEmail, currency, selectedThemeColor: localStorage.getItem(config.LS_KEY_THEME_COLOR) || 'default', themeModePreference: localStorage.getItem(config.LS_KEY_THEME_MODE) || 'light', valuesHidden, hideScheduledPaymentWarning, categoryStructure, companySettings, ...(isProPlan && { recurringTransactions, categoryBudgets, assets, liabilities }), ...(isBusinessPlan && { clients: JSON.parse(localStorage.getItem(config.LS_KEY_CLIENTS) || '[]'), projects: JSON.parse(localStorage.getItem(config.LS_KEY_PROJECTS) || '[]'), invoices: JSON.parse(localStorage.getItem(config.LS_KEY_INVOICES) || '[]'), employees: JSON.parse(localStorage.getItem(config.LS_KEY_EMPLOYEES) || '[]'), debtors: JSON.parse(localStorage.getItem(config.LS_KEY_DEBTORS) || '[]'), debts: JSON.parse(localStorage.getItem(config.LS_KEY_DEBTS) || '[]') }), };
    const s = JSON.stringify(dataToExport, null, 2); const u = 'data:application/json;charset=utf-8,' + encodeURIComponent(s); const f = `gestor-backup-completo-${new Date().toISOString().split('T')[0]}.json`; const a = document.createElement('a'); a.href = u; a.download = f; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); showAlert('Backup COMPLETO exportado!', 'success');
}
function handleFileImport(event) { /* ... código como antes ... */
    const file = event.target.files?.[0]; if (!file || !importDataInput) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target?.result?.toString() || '{}');
            const conf = await showConfirmModal('<strong>PERIGO!</strong> Importar backup?<br>SUBSTITUIRÁ TUDO.<br>Ação IRREVERSÍVEL.', 'Importar Backup - Confirmação', 'danger');
            if (conf) importData(data); else showAlert('Importação cancelada.', 'info');
        } catch (err) { showAlert(`Erro ao ler backup: ${err.message}.`, 'danger'); }
        finally { if (importDataInput) importDataInput.value = ''; }
    };
    reader.onerror = () => showAlert('Erro ao ler arquivo.', 'danger'); reader.readAsText(file);
}
function importData(data) { /* ... código como antes, usa config.defaultCategories e chaves LS_* ... */
    try {
        if (!data || typeof data !== 'object') throw new Error('Formato inválido.');
        // Importa e valida dados (ex: transactions, goals...) - igual ao loadDataFromStorage, mas usando 'data' como fonte
        transactions = Array.isArray(data.transactions) ? data.transactions.map(t => ({ /* ... validação ... */ id: t.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, amount: parseFloat(String(t.amount).replace(',', '.')) || 0, description: t.description || '', isScheduled: t.isScheduled === true, originatingBillId: t.originatingBillId || null, tags: Array.isArray(t.tags) ? t.tags : [], deductible: t.deductible === true, clientId: t.clientId || null, projectId: t.projectId || null, employeeId: t.employeeId || null, isRecurring: t.isRecurring === true, originatingRecurringId: t.originatingRecurringId || null, attachmentDataUrl: t.attachmentDataUrl || null, originatingDebtId: t.originatingDebtId !== undefined ? t.originatingDebtId : null, createdAt: t.createdAt || new Date().toISOString(), updatedAt: t.updatedAt || new Date().toISOString() })) : [];
        goals = Array.isArray(data.goals) ? data.goals.map(g => { /* ... validação ... */ g.id = g.id || `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`; g.target = parseFloat(String(g.target).replace(',', '.')) || 0; g.current = parseFloat(String(g.current).replace(',', '.')) || 0; g.monthlyContribution = parseFloat(String(g.monthlyContribution).replace(',', '.')) || 0; if (g.goalType && !g.type) { g.type = g.goalType; delete g.goalType; } g.contributions = Array.isArray(g.contributions) ? g.contributions.map(c => ({ ...c, amount: parseFloat(String(c.amount).replace(',', '.')) || 0 })) : []; g.createdAt = g.createdAt || new Date().toISOString(); g.completedAt = g.completedAt || null; return g; }) : [];
        upcomingBills = Array.isArray(data.upcomingBills) ? data.upcomingBills.map(b => { /* ... validação ... */ b.id = b.id || `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`; b.amount = parseFloat(String(b.amount).replace(',', '.')) || 0; const validScheduledCats = config.scheduledPaymentVisibleCategories.map(cat => cat.value).filter(Boolean); if (!b.category || !validScheduledCats.includes(b.category)) { if (b.category?.toLowerCase().includes('aluguel') || b.category?.toLowerCase().includes('financiamento imob')) b.category = 'Aluguel'; else if (b.category?.toLowerCase().includes('fatura') && b.category?.toLowerCase().includes('cart')) b.category = 'Fatura do cartão'; else b.category = 'Faturas'; } if (b.category === 'Fatura do cartão' && b.paymentMethod === 'card') b.paymentMethod = 'pix'; if (b.processedTimestamp) b.processedTimestamp = String(b.processedTimestamp); b.processedDate = b.processedDate || null; b.paid = b.paid === true; b.pending = b.pending === true; b.insufficientBalance = b.insufficientBalance === true; b.processingAttempted = b.processingAttempted === true; b.autoDebit = b.autoDebit === true; return b; }) : [];
        notes = Array.isArray(data.notes) ? data.notes.map(n => { /* ... validação ... */ n.id = n.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`; n.type = n.type === 'task' ? 'task' : 'note'; n.createdAt = n.createdAt || new Date().toISOString(); n.updatedAt = n.updatedAt || n.createdAt; n.color = n.color || 'default'; n.reminderDate = n.reminderDate || null; n.reminderTime = n.reminderTime || null; n.reminderTriggered = n.reminderTriggered === true; const taskCounts = parseNoteContentForTasks(n.content || '', n.type); n.isTask = taskCounts.total > 0 && n.type === 'task'; n.completedTasks = taskCounts.completed; n.totalTasks = taskCounts.total; return n; }) : [];
        initialBalances = (data.initialBalances && typeof data.initialBalances === 'object') ? { pix: parseFloat(String(data.initialBalances.pix || 0).replace(',', '.')), cash: parseFloat(String(data.initialBalances.cash || 0).replace(',', '.')), card: parseFloat(String(data.initialBalances.card || 0).replace(',', '.')) } : { pix: 0, cash: 0, card: 0 };
        monthlyBudget = parseFloat(data.monthlyBudget) || 0;
        recurringTransactions = isProPlan && Array.isArray(data.recurringTransactions) ? data.recurringTransactions.map(r => { /* ... validação ... */ r.id = r.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`; r.amount = parseFloat(String(r.amount).replace(',', '.')) || 0; r.tags = Array.isArray(r.tags) ? r.tags : []; if (r.nextDueDate && typeof r.nextDueDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(r.nextDueDate)) { r.nextDueDate = calculateNextDueDate(r.startDate, r.frequency) || r.startDate; } r.createdAt = r.createdAt || new Date().toISOString(); return r; }) : [];
        categoryBudgets = isProPlan && data.categoryBudgets && typeof data.categoryBudgets === 'object' ? data.categoryBudgets : {}; assets = isProPlan && Array.isArray(data.assets) ? data.assets : []; liabilities = isProPlan && Array.isArray(data.liabilities) ? data.liabilities : [];
        userName = data.userName || 'Usuário'; userEmail = data.userEmail || 'email@exemplo.com'; currency = data.currency || 'BRL'; selectedThemeColor = data.selectedThemeColor || 'default'; themeModePreference = data.themeModePreference || data.theme || 'light'; valuesHidden = data.valuesHidden === true; hideScheduledPaymentWarning = data.hideScheduledPaymentWarning === true;
        companySettings = (data.companySettings && typeof data.companySettings === 'object') ? data.companySettings : { name: '', taxId: '', address: '', phone: '', email: '', logoUrl: 'img/logo_placeholder.png', invoiceNotes: '' };
        if (data.categoryStructure && typeof data.categoryStructure === 'object' && Array.isArray(data.categoryStructure.expense) && Array.isArray(data.categoryStructure.income)) { categoryStructure = data.categoryStructure; const ensureFlags = (item) => { /* ... */ if (!item) return null; item.type = item.type || (config.defaultCategories.expense.includes(item.name) ? 'expense' : (config.defaultCategories.income.includes(item.name) ? 'income' : 'expense')); item.name = item.name || 'Categoria Inválida'; item.isTitle = typeof item.isTitle === 'boolean' ? item.isTitle : item.name.startsWith('-- '); item.isDefault = typeof item.isDefault === 'boolean' ? item.isDefault : (config.defaultCategories[item.type] || []).includes(item.name); item.isHidden = typeof item.isHidden === 'boolean' ? item.isHidden : false; return item; }; categoryStructure.expense = categoryStructure.expense.map(ensureFlags).filter(Boolean); categoryStructure.income = categoryStructure.income.map(ensureFlags).filter(Boolean); }
        else { console.warn("Backup sem categoryStructure válida, inicializando dos defaults."); categoryStructure = { expense: [], income: [] }; config.defaultCategories.expense.forEach(name => categoryStructure.expense.push({ name: name, type: 'expense', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false })); config.defaultCategories.income.forEach(name => categoryStructure.income.push({ name: name, type: 'income', isTitle: name.startsWith('-- '), isDefault: true, isHidden: false })); }
        saveDataToStorage(); // Salva dados importados
        if (isBusinessPlan) { const importBusinessItem = (item, prefix) => ({ ...item, id: item.id || `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` }); const clients = Array.isArray(data.clients) ? data.clients.map(c => importBusinessItem(c, 'client')) : []; const projects = Array.isArray(data.projects) ? data.projects.map(p => importBusinessItem(p, 'proj')) : []; const invoices = Array.isArray(data.invoices) ? data.invoices.map(i => importBusinessItem(i, 'inv')) : []; const employees = Array.isArray(data.employees) ? data.employees.map(e => importBusinessItem(e, 'emp')) : []; const debtors = Array.isArray(data.debtors) ? data.debtors.map(d => importBusinessItem(d, 'debtor')) : []; const debts = Array.isArray(data.debts) ? data.debts.map(db => importBusinessItem(db, 'debt')) : []; localStorage.setItem(config.LS_KEY_CLIENTS, JSON.stringify(clients)); localStorage.setItem(config.LS_KEY_PROJECTS, JSON.stringify(projects)); localStorage.setItem(config.LS_KEY_INVOICES, JSON.stringify(invoices)); localStorage.setItem(config.LS_KEY_EMPLOYEES, JSON.stringify(employees)); localStorage.setItem(config.LS_KEY_DEBTORS, JSON.stringify(debtors)); localStorage.setItem(config.LS_KEY_DEBTS, JSON.stringify(debts)); if (typeof initBusinessFeatures === 'function') { showAlert('Dados Business importados. Recarregue a página para aplicar completamente.', 'info', 8000); } }
        else { localStorage.removeItem(config.LS_KEY_CLIENTS); localStorage.removeItem(config.LS_KEY_PROJECTS); localStorage.removeItem(config.LS_KEY_INVOICES); localStorage.removeItem(config.LS_KEY_EMPLOYEES); localStorage.removeItem(config.LS_KEY_DEBTORS); localStorage.removeItem(config.LS_KEY_DEBTS); }
        setThemeMode(themeModePreference); applyThemeColor(); applyValueVisibilityIconAndClass(); updateUIafterImport(); showAlert('Backup importado!', 'success');
    } catch (err) { showAlert(`Falha importação: ${err.message}.`, 'danger'); }
}
function saveUserSettings() { /* ... código como antes ... */
    if (!userNameInput || !userEmailInput || !currencyInput || !settingsSection) return;
    const nUn = userNameInput.value.trim(); const nEm = userEmailInput.value.trim(); const nCu = currencyInput.value;
    let ch = false; if (userName !== nUn) { userName = nUn; ch = true; } if (userEmail !== nEm) { userEmail = nEm; ch = true; } if (currency !== nCu) { currency = nCu; ch = true; }
    if (ch) { saveDataToStorage(); if (safeQuerySelector('.user-name')) safeQuerySelector('.user-name').textContent = userName; if (safeQuerySelector('.user-email')) safeQuerySelector('.user-email').textContent = userEmail; if (currency !== nCu) updateUIafterSettingsChange(); else { applyValueVisibilityIconAndClass(); updatePlaceholders(); } if (saveUserSettingsBtn) showSuccessFeedback(saveUserSettingsBtn, 'Salvo!'); else showAlert('Preferências Salvas!', 'success'); }
    else { if (saveUserSettingsBtn) { const oT = saveUserSettingsBtn.innerHTML; saveUserSettingsBtn.classList.add('btn-outline-secondary'); saveUserSettingsBtn.classList.remove('btn-primary'); saveUserSettingsBtn.innerHTML = `<i class="fas fa-info-circle"></i> Sem alterações`; saveUserSettingsBtn.disabled = true; setTimeout(() => { saveUserSettingsBtn.innerHTML = oT; saveUserSettingsBtn.classList.add('btn-primary'); saveUserSettingsBtn.classList.remove('btn-outline-secondary'); saveUserSettingsBtn.disabled = false; }, 2000); } }
}
// --- Fim Ações Configurações ---

// --- Lógica de Negócios (Agendamentos, Lembretes) ---
// (checkScheduledPayments, processScheduledPaymentLogic, checkReminders ficam aqui, usando config.<constante>)
function checkScheduledPayments() { /* ... código como antes, usa config.scheduleToTransactionCategoryMap ... */
    const now = new Date(); const today = getLocalDateString(now); let updatedUI = false, processedCount = 0, failedAutoCount = 0, pendingManualCount = 0; let needsSave = false; let failedMessages = [], pendingMessages = [];
    upcomingBills.forEach((b, i) => { if (!b || b.paid) return; const dueDate = parseDateInput(b.date); if (isNaN(dueDate)) return; dueDate.setHours(23, 59, 59, 999); if (dueDate <= now) { if (b.autoDebit && !b.processingAttempted && !b.paid) { const result = processScheduledPaymentLogic(i); needsSave = true; if (result.success) { processedCount++; updatedUI = true; } else { failedAutoCount++; updatedUI = true; if (upcomingBills[i]?.insufficientBalance) { failedMessages.push(`"${escapeHtml(b.name)}" (${(b.paymentMethod || '?').toUpperCase()})`); } } } else if (!b.autoDebit && !b.paid && !b.pending && !b.insufficientBalance) { upcomingBills[i].pending = true; pendingManualCount++; needsSave = true; updatedUI = true; pendingMessages.push(`"${escapeHtml(b.name)}" (${formatDisplayDate(b.date)})`); } } });
    if (needsSave) { saveDataToStorage(); } if (updatedUI) { renderUpcomingBills(); renderAllScheduledPayments(); if (processedCount > 0) { refreshAllUIComponents(); } }
    if (failedMessages.length > 0 || pendingMessages.length > 0) { let alertMsgs = []; if (failedMessages.length > 0) { alertMsgs.push(`${failedMessages.length} pag. auto falharam (saldo insuf.?): ${failedMessages.slice(0, 2).join(', ')}${failedMessages.length > 2 ? '...' : ''}. Use 'Pagar'.`); } if (pendingMessages.length > 0) { alertMsgs.push(`${pendingMessages.length} pag. manual aguardam conf.: ${pendingMessages.slice(0, 2).join(', ')}${pendingMessages.length > 2 ? '...' : ''}.`); } if (alertMsgs.length > 0) { showAlert(alertMsgs.join('<br>'), failedAutoCount > 0 ? 'warning' : 'info'); } }
}
function processScheduledPaymentLogic(index) { /* ... código como antes, usa config.scheduleToTransactionCategoryMap ... */
    if (index === null || index < 0 || index >= upcomingBills.length || !upcomingBills[index]) return { success: false, message: 'Agend. inválido.' };
    const b = upcomingBills[index]; const bId = b.id; if (b.paid) return { success: false, message: 'Já pago.' }; upcomingBills[index].processingAttempted = true;
    if (b.category === 'Fatura do cartão' && b.paymentMethod === 'card') { upcomingBills[index].pending = true; upcomingBills[index].insufficientBalance = false; upcomingBills[index].paid = false; console.error(`Erro Config Agend ${bId}: Fatura cartão agendada com método 'card'. Marcado como pendente.`); return { success: false, message: 'Erro Config: Fatura não paga com Cartão.' }; }
    const pDate = getLocalDateString(); const pM = b.paymentMethod; const bAmt = b.amount; const bCat = b.category; let hasSufficientBalance = true; let balanceCheckMethodLabel = '';
    if (bCat !== 'Fatura do cartão') { const { currentPix, currentCash, currentCard } = calculateCurrentBalances(); let balanceToCheck = 0; if (pM === 'pix') { balanceToCheck = currentPix; balanceCheckMethodLabel = 'Pix'; } else if (pM === 'cash') { balanceToCheck = currentCash; balanceCheckMethodLabel = 'Dinheiro'; } else if (pM === 'card') { balanceToCheck = currentCard; balanceCheckMethodLabel = 'Conta/Cartão'; } if ((pM === 'pix' || pM === 'cash' || pM === 'card') && balanceToCheck < bAmt) { hasSufficientBalance = false; } }
    else { const { currentPix, currentCash } = calculateCurrentBalances(); let balanceToCheck = (pM === 'pix') ? currentPix : currentCash; balanceCheckMethodLabel = (pM === 'pix') ? 'Pix' : 'Dinheiro'; if (balanceToCheck < bAmt) { hasSufficientBalance = false; } }
    if (!hasSufficientBalance) { upcomingBills[index].pending = true; upcomingBills[index].insufficientBalance = true; upcomingBills[index].paid = false; console.warn(`Saldo ${balanceCheckMethodLabel} insuficiente para Agend ${bId}. Saldo: ${formatCurrency(calculateCurrentBalances()[`current${balanceCheckMethodLabel.replace('Conta/Cartão','Card')}`])}, Valor: ${formatCurrency(bAmt)}`); return { success: false, message: `Saldo ${balanceCheckMethodLabel} insuficiente.` }; }
    try { const tIdBase = Date.now() + Math.random(); let newTxBase = { id: '', date: pDate, amount: bAmt, type: 'expense', paymentMethod: pM, isScheduled: true, originatingBillId: bId, isRecurring: false, originatingRecurringId: null, tags: [], deductible: false, clientId: null, projectId: null, employeeId: null, originatingDebtId: null, attachmentDataUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (b.category === 'Fatura do cartão') { const paymentTx = { ...newTxBase, id: `pay-${tIdBase}`, item: `Pag. Fatura Cartão: ${b.name} (Saída)`, category: 'Faturas', tags: ['fatura-cartao', 'pagamento', ...(b.autoDebit ? ['auto'] : ['manual'])], description: `Débito ref. pag. agend. ID ${bId} ("${escapeHtml(b.name)}"). Método: ${pM.toUpperCase()}. Processado ${b.autoDebit ? 'Auto' : 'Manual'}.` }; transactions.push(paymentTx); const creditTx = { ...newTxBase, id: `cred-${tIdBase}`, type: 'income', item: `Pag. Fatura Cartão: ${b.name} (Crédito)`, category: 'Pagamento Fatura Cartão', paymentMethod: 'card', tags: ['fatura-cartao', 'credito', ...(b.autoDebit ? ['auto'] : ['manual'])], description: `Crédito ref. pag. agend. ID ${bId} ("${escapeHtml(b.name)}"). Pago via ${pM.toUpperCase()}.` }; transactions.push(creditTx); console.log(`Fatura Cartão Agend ${bId}: Criadas Tx Saída (${paymentTx.id}) e Tx Crédito (${creditTx.id})`); }
        else { let txCat = config.scheduleToTransactionCategoryMap[bCat] || (categoryStructure.expense.some(c => c && c.name === bCat && !c.isTitle) ? bCat : 'Faturas'); const normalTx = { ...newTxBase, id: `std-${tIdBase}`, item: `Pag. Agend: ${b.name}`, category: txCat, description: `Ref agend ID ${bId}. (CatAgend: ${b.category}, Método: ${b.paymentMethod}${b.autoDebit ? ', Auto' : ', Manual/Conf'}).` }; transactions.push(normalTx); console.log(`Agendamento Normal ${bId}: Criada Tx ${normalTx.id}`); }
        upcomingBills[index].paid = true; upcomingBills[index].processedDate = pDate; upcomingBills[index].processedTimestamp = String(tIdBase); upcomingBills[index].pending = false; upcomingBills[index].insufficientBalance = false; return { success: true };
    } catch (err) { console.error(`ERRO CRÍTICO gerando Tx agend ${bId}:`, err); upcomingBills[index].pending = true; upcomingBills[index].insufficientBalance = false; upcomingBills[index].paid = false; upcomingBills[index].processingAttempted = true; return { success: false, message: `Erro interno Tx: ${err.message}` }; }
}
function checkReminders() { /* ... código como antes ... */
    const now = new Date(); let trig = 0, save = false;
    notes.forEach((n, i) => { if (n.reminderDate && !n.reminderTriggered) { const rDT = parseDateTimeInput(n.reminderDate, n.reminderTime); if (!isNaN(rDT) && rDT <= now) { const t = n.title ? `<b>${escapeHtml(n.title)}</b>` : 'Lembrete'; const p = escapeHtml(truncateText(n.content.replace(/([-+]\s)/g, ''), 100)); showAlert(`${t}<br><small>${p}</small>`, 'warning', 10000); notes[i].reminderTriggered = true; trig++; save = true; } } });
    if (save) { saveDataToStorage(); if (notesSection?.classList.contains('active')) renderNotes(); if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent(); if (noteReaderModal?.classList.contains('active')) { const cId = noteReaderModal.dataset.currentNoteId; const tN = notes.find(n => String(n.id) === cId && n.reminderTriggered === true && save); if (tN) updateNoteReaderContent(cId); } }
}
// --- Fim Lógica de Negócios ---

// --- Lógica Pagamento PIX ---
// (Função obterLinkPagamentoMercadoPago fica aqui, sem alterações)
async function obterLinkPagamentoMercadoPago(valor) { /* ... código sem alterações ... */
    if (!loadingIndicator) { console.warn("Indicador de loading não encontrado."); } else { loadingIndicator.style.display = 'flex'; }
    // ***** SIMULAÇÃO *****
    console.warn("ATENÇÃO: Simulando chamada ao backend para gerar link PIX.");
    return new Promise((resolve, reject) => {
        setTimeout(() => { if (loadingIndicator) loadingIndicator.style.display = 'none'; if (valor > 0) { console.log(`Simulação: Geraria link para R$ ${valor.toFixed(2)}`); resolve("https://www.mercadopago.com.br/sandbox/payments/payment-link"); } else { reject(new Error("Valor inválido para simulação.")); } }, 1500); });
    // ***** FIM SIMULAÇÃO *****
    /* ***** CÓDIGO REAL *****
    try { const response = await fetch('/criar-link-mercadopago', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: valor, descricao: 'Pagamento via PIX App Gestor' }) }); if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido do servidor.' })); throw new Error(`Erro ${response.status}: ${errorData.message || response.statusText}`); } const data = await response.json(); if (!data.link || !data.link.startsWith('http')) { throw new Error("Resposta inválida do servidor (link não encontrado ou inválido)."); } if (loadingIndicator) loadingIndicator.style.display = 'none'; return data.link; } catch (error) { console.error("Erro ao obter link de pagamento do backend:", error); if (loadingIndicator) loadingIndicator.style.display = 'none'; showAlert(`Falha ao gerar link PIX: ${error.message}`, 'danger'); throw error; } */
}
// --- Fim Lógica PIX ---

// --- Modals ---
// (openModal, closeModal e todas as funções open*Modal ficam aqui)
// Exemplo: closeModal (sem alterações significativas, já estava bem completo)
export function closeModal(el) { /* ... código como antes ... */
    if (typeof el === 'string') el = safeGetElementById(el.substring(1)); if (!el) return; el.classList.remove('active'); const id = el.id;
    if (id === 'editModal') { currentEditingTransactionId = null; if (editForm) editForm.reset(); } if (id === 'goalModal') { currentEditingGoalIndex = null; if (goalForm) goalForm.reset(); if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } if (removeGoalImageBtn) removeGoalImageBtn.style.display = 'none'; if (goalImageInput) goalImageInput.value = ''; } if (id === 'noteModal') { currentEditingNoteId = null; if (noteContentInput) noteContentInput.removeEventListener('keydown', handleNoteContentKeyDown); if (noteForm) noteForm.reset(); if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } } if (id === 'scheduledPaymentModal' && scheduledPaymentForm) { scheduledPaymentForm.reset(); } if (id === 'recurringTxModal' && typeof recurringTxForm !== 'undefined' && recurringTxForm) { recurringTxForm.reset(); } if (id === 'csvImportModal') { if (typeof csvImportData !== 'undefined') csvImportData = { raw: [], mapped: [], headers: [], map: {} }; const csvPreviewTable = safeGetElementById('csvPreviewTable'); const csvMappingArea = safeGetElementById('csvMappingArea'); if (csvPreviewTable) csvPreviewTable.innerHTML = ''; if (csvMappingArea) csvMappingArea.innerHTML = ''; if (typeof importCsvInput !== 'undefined' && importCsvInput) importCsvInput.value = ''; } if (id === 'invoiceModal' && typeof invoiceForm !== 'undefined' && invoiceForm) { const invoiceItemsContainer = safeGetElementById('invoiceItemsContainer'); invoiceForm.reset(); if (invoiceItemsContainer) invoiceItemsContainer.innerHTML = ''; if (invoiceForm.dataset.editingId) delete invoiceForm.dataset.editingId; } if (id === 'debtorModal' && typeof debtorForm !== 'undefined' && debtorForm) { debtorForm.reset(); const photoPreview = document.getElementById('debtorPhotoPreview'); const photoIcon = document.getElementById('debtorPhotoIcon'); const removeBtn = document.getElementById('removeDebtorPhotoBtn'); if (photoPreview) photoPreview.style.display = 'none'; if (photoIcon) photoIcon.style.display = 'block'; if (removeBtn) removeBtn.style.display = 'none'; document.getElementById('debtorId').value = ''; document.getElementById('debtorPhotoUrlHidden').value = ''; } if (id === 'debtModal' && typeof debtForm !== 'undefined' && debtForm) { debtForm.reset(); document.getElementById('debtId').value = ''; document.getElementById('debtDebtorId').value = ''; document.getElementById('debtRecurringFrequency').style.display = 'none'; } if (id === 'recordDebtPaymentModal' && typeof recordDebtPaymentForm !== 'undefined' && recordDebtPaymentForm) { recordDebtPaymentForm.reset(); document.getElementById('paymentDebtId').value = ''; } if (id === 'debtorDetailModal') { debtorDetailModal.dataset.debtorId = ''; const photo = document.getElementById('detailDebtorPhoto'); if (photo) photo.src = 'img/user_placeholder.png'; const name = document.getElementById('detailDebtorName'); if (name) name.textContent = '-'; const email = document.getElementById('detailDebtorEmail'); if (email) email.textContent = '-'; const phone = document.getElementById('detailDebtorPhone'); if (phone) phone.textContent = '-'; const debtsList = document.getElementById('debtorDebtsList'); if (debtsList) debtsList.innerHTML = ''; const totalOwed = document.getElementById('detailTotalOwed'); if (totalOwed) totalOwed.textContent = formatCurrency(0); } if (id === 'debtorPaymentHistoryModal') { const historyList = document.getElementById('debtorPaymentHistoryList'); if (historyList) historyList.innerHTML = ''; const historyName = document.getElementById('historyDebtorName'); if (historyName) historyName.textContent = ''; }
    if (['transactionModal', 'editModal'].includes(id)) { if (isProPlan && typeof clearTemporaryAttachments === 'function') { clearTemporaryAttachments(); } else if (isProPlan) { console.warn("Core: clearTemporaryAttachments não encontrada no Pro."); } } if (id === 'attachmentViewerModal' && attachmentViewerImage) { attachmentViewerImage.src = '#'; if (attachmentViewerDownloadLink) attachmentViewerDownloadLink.href = '#'; } if (id === 'scheduledWarningModal' && el.querySelector('#dontShowWarningAgain')) { el.querySelector('#dontShowWarningAgain').checked = false; } if (id === 'noteReaderModal') { if (noteReaderContent) noteReaderContent.removeEventListener('change', handleReaderCheckboxChange); noteReaderModal.dataset.currentNoteId = ''; } if (id === 'quickNotesModal' && quickNotesList) quickNotesList.innerHTML = ''; if (id === 'economyCalculatorModal') { clearComparisonForm(); } if (id === 'categoryEditorModal') { if (typeof categorySortableInstance !== 'undefined' && categorySortableInstance) { try { categorySortableInstance.destroy(); } catch(e) {} categorySortableInstance = null; } const incomeListEl = document.getElementById('editableIncomeCategoryList'); const expenseListEl = document.getElementById('editableExpenseCategoryList'); if(incomeListEl) incomeListEl.innerHTML = ''; if(expenseListEl) expenseListEl.innerHTML = ''; }
    updatePlaceholders();
}
// ... (Restante das funções open*Modal como antes)
export function openModal(el) { /* ... código como antes ... */ if (typeof el === 'string') el = safeGetElementById(el.substring(1)); if (el) el.classList.add('active'); }
function openAddTransactionModal() { /* ... código como antes ... */
    currentEditingTransactionId = null; if (!transactionModal || !transactionModalForm) return; closeModal(transactionModal); transactionModalForm.reset();
    if (modalDateInput) modalDateInput.value = getLocalDateString(); if (modalTypeInput) modalTypeInput.value = 'expense'; updateCategoryDropdowns(modalCategoryInput, 'expense', isProPlan); if (modalPaymentMethodInput) modalPaymentMethodInput.value = 'pix'; if (modalOriginatingBillIdInput) modalOriginatingBillIdInput.value = '';
    const tagsInput = document.getElementById('modalTagsInput'); if (tagsInput) tagsInput.value = ''; const clientSelect = document.getElementById('modalClientSelect'); const projectSelect = document.getElementById('modalProjectSelect'); const employeeSelect = document.getElementById('modalEmployeeSelect'); if (isBusinessPlan && typeof populateRecipientSelects === 'function') { populateRecipientSelects(); if (clientSelect) clientSelect.value = ''; if (projectSelect) projectSelect.value = ''; if (employeeSelect) employeeSelect.value = ''; } else { if (clientSelect) clientSelect.value = ''; if (projectSelect) projectSelect.value = ''; if (employeeSelect) employeeSelect.value = ''; } const deductibleCheckbox = document.getElementById('modalDeductible'); if (deductibleCheckbox) deductibleCheckbox.checked = false; const hiddenAttachInput = document.getElementById('modalAttachmentDataUrlHidden'); if (hiddenAttachInput) hiddenAttachInput.value = ''; if (isProPlan && typeof clearTemporaryAttachments === 'function') { clearTemporaryAttachments(); }
    transactionModal.querySelectorAll('.pro-field').forEach(el => el.style.display = isProPlan ? '' : 'none'); transactionModal.querySelectorAll('.business-field').forEach(el => el.style.display = isBusinessPlan ? '' : 'none'); const title = transactionModal.querySelector('.modal-title'); if (title) title.textContent = 'Adicionar Transação'; if (modalDateInput) modalDateInput.readOnly = false; if (modalItemInput) modalItemInput.readOnly = false; if (modalAmountInput) modalAmountInput.readOnly = false; if (modalCategoryInput) modalCategoryInput.disabled = false; if (modalDescriptionInput) { modalDescriptionInput.readOnly = false; const descLabel = modalDescriptionInput.previousElementSibling; if (descLabel?.tagName === 'LABEL') descLabel.textContent = 'Descrição Adicional'; } const typeContainer = modalTypeInput?.closest('.form-group'); if (typeContainer) typeContainer.style.display = ''; if (modalPaymentMethodInput) { modalPaymentMethodInput.disabled = false; Array.from(modalPaymentMethodInput.options).forEach(opt => { opt.disabled = !['', 'pix', 'cash', 'card'].includes(opt.value); if (opt.value === 'card') opt.textContent = 'Conta/Cartão'; }); }
    updatePlaceholders(); openModal(transactionModal);
}
function openEditModal(index) { /* ... código como antes ... */
    console.log(`openEditModal: Recebido index ${index}`); if (index === null || index < 0 || index >= transactions.length || !transactions[index]) { console.error("openEditModal ERRO: Índice inválido ou transação não encontrada:", index); return showAlert("Erro ao preparar edição: Índice inválido.", 'danger'); }
    const t = transactions[index]; if (!t || !t.id) { console.error("openEditModal ERRO: Objeto da transação ou ID inválido", index, t); return showAlert("Erro interno: Dados da transação inválidos.", "danger"); } console.log(`openEditModal: Transação encontrada: ID ${t.id}, Item: ${t.item}`);
    if (t.isScheduled || t.isRecurring || t.originatingDebtId) { const originType = t.isScheduled ? 'agendada' : (t.isRecurring ? 'recorrente' : 'de dívida'); console.log(`openEditModal AVISO: Tentativa de editar transação ${originType}:`, t.id); return showAlert(`Transações ${originType} não são editáveis diretamente.`, 'warning'); }
    currentEditingTransactionId = t.id; console.log(`openEditModal SUCESSO: ID ${currentEditingTransactionId}`); if (editForm) editForm.reset(); if (editDateInput) editDateInput.value = t.date; if (editItemInput) editItemInput.value = t.item; if (editAmountInput) editAmountInput.value = t.amount.toFixed(2); if (editTypeInput) editTypeInput.value = t.type; if (editCategoryInput) { updateCategoryDropdowns(editCategoryInput, t.type, isProPlan); setTimeout(() => { if (editCategoryInput) editCategoryInput.value = t.category; }, 0); } if (editPaymentMethodInput) editPaymentMethodInput.value = t.paymentMethod; if (editDescriptionInput) editDescriptionInput.value = t.description || ''; const tagsInput = document.getElementById('editTagsInput'); if (tagsInput) tagsInput.value = formatTags(t.tags); const clientSelect = document.getElementById('editClientSelect'); const projectSelect = document.getElementById('editProjectSelect'); const employeeSelect = document.getElementById('editEmployeeSelect'); if (isBusinessPlan && typeof populateRecipientSelects === 'function') { populateRecipientSelects(); if (clientSelect) clientSelect.value = t.clientId || ''; if (projectSelect) projectSelect.value = t.projectId || ''; if (employeeSelect) employeeSelect.value = t.employeeId || ''; } else { if (clientSelect) clientSelect.value = ''; if (projectSelect) projectSelect.value = ''; if (employeeSelect) employeeSelect.value = ''; } const deductibleCheckbox = document.getElementById('editDeductible'); if (deductibleCheckbox) deductibleCheckbox.checked = t.deductible || false; const hiddenAttachInput = document.getElementById('editAttachmentDataUrlHidden'); if (hiddenAttachInput) hiddenAttachInput.value = t.attachmentDataUrl || ''; if (isProPlan && typeof setupEditAttachmentUI === 'function') { setupEditAttachmentUI(t); } else if (isProPlan) { console.warn("Core: setupEditAttachmentUI não encontrada no Pro."); }
    editModal.querySelectorAll('.pro-field').forEach(el => el.style.display = isProPlan ? '' : 'none'); editModal.querySelectorAll('.business-field').forEach(el => el.style.display = isBusinessPlan ? '' : 'none'); const mTitle = editModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Editar Transação Manual'; updatePlaceholders(); openModal(editModal); console.log(`openEditModal: Modal aberto para ID ${currentEditingTransactionId}`);
}
function openAddGoalModal() { /* ... código como antes, usa config.MAX_ACTIVE_GOALS_BASIC ... */
    if (!isProPlan && !isBusinessPlan) { const activeGoalsCount = goals.filter(g => !g.completed).length; if (activeGoalsCount >= config.MAX_ACTIVE_GOALS_BASIC) { return showAlert(`Limite de ${config.MAX_ACTIVE_GOALS_BASIC} metas atingido.`, 'warning'); } }
    currentEditingGoalIndex = null; if (!goalModal || !goalForm) return; closeModal(goalModal); goalForm.reset(); if (goalDateInput) goalDateInput.value = getLocalDateString(); if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } const rmBtn = goalModal?.querySelector('.remove-image-btn'); if (rmBtn) rmBtn.style.display = 'none'; if (goalImageInput) goalImageInput.value = ''; const cTh = localStorage.getItem(config.LS_KEY_THEME_COLOR) || 'default'; goalModal.querySelectorAll('.theme-color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === cTh)); if (goalTypeInput) goalTypeInput.value = ""; const mTitle = goalModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Nova Meta'; updatePlaceholders(); openModal(goalModal);
}
function openEditGoalModal(index) { /* ... código como antes, usa config.LS_KEY_THEME_COLOR ... */
    if (index === null || index < 0 || index >= goals.length || !goals[index]) return showAlert("Erro ao abrir meta.", 'danger'); const g = goals[index]; if (!goalModal || !goalForm) return showAlert("Erro interno.", 'danger'); currentEditingGoalIndex = index; closeModal(goalModal); goalForm.reset(); if (goalNameInput) goalNameInput.value = g.name; if (goalTargetInput) goalTargetInput.value = g.target.toFixed(2); if (goalDateInput) goalDateInput.value = g.date; if (goalTypeInput) goalTypeInput.value = g.type || 'other'; if (monthlyContributionInput) monthlyContributionInput.value = g.monthlyContribution ? g.monthlyContribution.toFixed(2) : ''; const rmBtn = goalModal?.querySelector('.remove-image-btn'); if (g.image && goalImagePreview) { goalImagePreview.src = g.image; goalImagePreview.style.display = 'block'; if (rmBtn) rmBtn.style.display = 'inline-block'; } else { if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } if (rmBtn) rmBtn.style.display = 'none'; } if (goalImageInput) goalImageInput.value = ''; const thSel = g.themeColor || localStorage.getItem(config.LS_KEY_THEME_COLOR) || 'default'; goalModal.querySelectorAll('.theme-color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === thSel)); const mTitle = goalModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = 'Editar Meta'; updatePlaceholders(); openModal(goalModal);
}
function removeImageHandler(event) { /* ... código como antes ... */
    event.preventDefault(); event.stopPropagation(); if (goalImageInput) goalImageInput.value = ''; if (goalImagePreview) { goalImagePreview.style.display = 'none'; goalImagePreview.removeAttribute('src'); } if (removeGoalImageBtn) removeGoalImageBtn.style.display = 'none';
}
function openScheduledPaymentModal() { /* ... código como antes, usa config.MAX_SCHEDULED_ITEMS_BASIC ... */
    if (!isProPlan && !isBusinessPlan) { if (upcomingBills.filter(b => !b.paid).length >= config.MAX_SCHEDULED_ITEMS_BASIC) { return showAlert(`Limite de ${config.MAX_SCHEDULED_ITEMS_BASIC} agendamentos ativos atingido.`, 'warning'); } }
    if (!scheduledPaymentModal || !scheduledPaymentForm) return showAlert("Erro.", 'danger'); currentEditingTransactionId = null; closeModal(scheduledPaymentModal); scheduledPaymentForm.reset(); if (scheduledDateInput) scheduledDateInput.value = getLocalDateString(); if (scheduledCategoryInput) updateCategoryDropdowns(scheduledCategoryInput, 'scheduled'); else return showAlert("Erro Categoria.", 'danger'); if (scheduledPaymentMethodInput) scheduledPaymentMethodInput.value = 'pix'; if (scheduledAutoDebitInput) scheduledAutoDebitInput.checked = false; handleScheduledCategoryChange(); updatePlaceholders(); openModal(scheduledPaymentModal);
}
function openManualPaymentForBill(billId) { /* ... código como antes, usa config.scheduleToTransactionCategoryMap ... */
    const bIdx = upcomingBills.findIndex(b => String(b.id) === String(billId)); if (bIdx === -1 || !upcomingBills[bIdx]) { return showAlert(`Erro: Agendamento ID ${billId} não encontrado.`, 'danger'); } const b = upcomingBills[bIdx]; if (b.paid) return showAlert(`"${escapeHtml(b.name)}" já pago.`, 'info'); const today = getLocalDateString(); const isOverdue = b.date < today; const canPayManually = b.insufficientBalance || b.pending || (isOverdue && !b.autoDebit); if (!canPayManually) { if (b.autoDebit && !b.insufficientBalance && !isOverdue) { return showAlert(`"${escapeHtml(b.name)}" tem débito auto. Aguarde ou desative.`, 'info'); } return showAlert(`Ação não disponível para "${escapeHtml(b.name)}".`, 'info'); } if (!transactionModal || !transactionModalForm || !modalDateInput || !modalItemInput || !modalAmountInput || !modalTypeInput || !modalCategoryInput || !modalPaymentMethodInput || !modalDescriptionInput || !modalOriginatingBillIdInput) { return showAlert("Erro interno.", 'danger'); }
    closeModal(transactionModal); setTimeout(() => { transactionModalForm.reset(); if (modalDateInput) { modalDateInput.value = getLocalDateString(); modalDateInput.readOnly = true; } if (modalItemInput) { modalItemInput.value = `Pag. Manual Agend.: ${b.name}`; modalItemInput.readOnly = true; } if (modalAmountInput) { modalAmountInput.value = b.amount.toFixed(2); modalAmountInput.readOnly = true; } if (modalDescriptionInput) { let dTxt = `Confirme pag. manual: Agend. ID ${b.id} ("${escapeHtml(b.name)}", Venc: ${formatDisplayDate(b.date)}). `; if (b.insufficientBalance) dTxt += `Método original (${(b.paymentMethod||'?').toUpperCase()}) falhou. `; if (isOverdue) dTxt += `Pgto pós vencimento. `; dTxt += `Selecione MÉTODO REAL usado.`; modalDescriptionInput.value = dTxt; modalDescriptionInput.readOnly = true; const dLbl = modalDescriptionInput.previousElementSibling; if (dLbl?.tagName === 'LABEL') dLbl.textContent = 'Descrição (Automática):'; } const tyCont = modalTypeInput?.closest('.form-group'); if (tyCont) tyCont.style.display = 'none'; if (modalTypeInput) modalTypeInput.value = 'expense'; let txCat = 'Desconhecido'; if (b.category === 'Fatura do cartão') { txCat = 'Faturas'; } else { txCat = config.scheduleToTransactionCategoryMap[b.category] || (categoryStructure.expense.some(c => c && c.name === b.category && !c.isTitle) ? b.category : 'Faturas'); } if (modalCategoryInput) { updateCategoryDropdowns(modalCategoryInput, 'expense'); modalCategoryInput.value = txCat; modalCategoryInput.disabled = true; } if (modalPaymentMethodInput) { modalPaymentMethodInput.disabled = false; modalPaymentMethodInput.value = ''; modalPaymentMethodInput.required = true; Array.from(modalPaymentMethodInput.options).forEach(opt => { opt.disabled = !['pix', 'cash', 'card', ''].includes(opt.value); if (opt.value === 'pix') opt.textContent = 'Pix'; else if (opt.value === 'cash') opt.textContent = 'Dinheiro'; else if (opt.value === 'card') opt.textContent = 'Conta/Cartão'; }); if (b.category === 'Fatura do cartão') { const cOpt = modalPaymentMethodInput.querySelector('option[value="card"]'); if (cOpt) { cOpt.disabled = true; cOpt.textContent = 'Conta/Cartão (Inválido)'; } } } if (modalOriginatingBillIdInput) { modalOriginatingBillIdInput.value = b.id; } const mTitle = transactionModal.querySelector('.modal-title'); if (mTitle) mTitle.textContent = `Confirmar Pgto: ${escapeHtml(b.name)}`; updatePlaceholders(); openModal(transactionModal); let aMsg = `Confirme pag. manual: <strong>"${escapeHtml(b.name)}" (${formatCurrency(b.amount)})</strong>.<br>`; if (b.insufficientBalance) aMsg += `Método original (${(b.paymentMethod||'?').toUpperCase()}) falhou. `; if (isOverdue) aMsg += `Pgto pós vencimento. `; if (b.category === 'Fatura do cartão') { aMsg += `Selecione o <strong>MÉTODO</strong> usado (Pix ou Dinheiro) e Salve.`; } else { aMsg += `Selecione o <strong>MÉTODO</strong> usado e Salve.`; } showAlert(aMsg, b.insufficientBalance || isOverdue ? 'warning' : 'info', 8000); }, 50);
}
function handleScheduledCategoryChange() { /* ... código como antes ... */
    const cS = scheduledCategoryInput; const mS = scheduledPaymentMethodInput; const hlp = document.getElementById('scheduledMethodHelp'); if (!cS || !mS || !hlp) { console.error("Erro: Elementos do formulário de agendamento não encontrados."); return; } const selC = cS.value; const mOpts = mS.options; let curM = mS.value; let firstEnabledOptionValue = ''; mS.disabled = false; Array.from(mOpts).forEach(o => { const v = o.value; if (v === 'pix' || v === 'cash' || v === 'card') { o.disabled = false; o.style.cssText = ''; o.textContent = v === 'pix' ? 'Pix' : (v === 'cash' ? 'Dinheiro' : 'Conta/Cartão'); if (!firstEnabledOptionValue && v !== 'card') { firstEnabledOptionValue = v; } } else if (v !== '' && v !== mS.options[0].value) { o.disabled = true; o.style.display = 'none'; } else if (v === '') { o.disabled = false; } }); if (!firstEnabledOptionValue) { firstEnabledOptionValue = Array.from(mOpts).find(o => (o.value === 'pix' || o.value === 'cash') && !o.disabled)?.value || ''; } if (selC === 'Fatura do cartão') { const cardOpt = mS.querySelector('option[value="card"]'); const pixOpt = mS.querySelector('option[value="pix"]'); const cashOpt = mS.querySelector('option[value="cash"]'); if (cardOpt) { cardOpt.disabled = true; cardOpt.style.color = 'var(--text-muted)'; cardOpt.textContent = 'Conta/Cartão (Inválido aqui)'; } if (pixOpt) pixOpt.disabled = false; if (cashOpt) cashOpt.disabled = false; if (curM === 'card') { mS.value = firstEnabledOptionValue; } else if (curM === '') { mS.value = ''; } mS.disabled = false; hlp.innerHTML = `ℹ️ Pagamento de Fatura de Cartão <strong>NÃO</strong> pode ser feito via "Conta/Cartão".<br><small>Use Pix ou Dinheiro. O saldo irá para a modalidade Conta/Cartão.</small>`; hlp.style.display = 'block'; } else { mS.disabled = false; hlp.textContent = ""; hlp.style.display = 'none'; const cardOpt = mS.querySelector('option[value="card"]'); if (cardOpt) { cardOpt.textContent = 'Conta/Cartão'; cardOpt.style.color = ''; cardOpt.disabled = false; } mS.value = curM; if (!Array.from(mOpts).some(opt => opt.value === curM && !opt.disabled)) { mS.value = ''; } }
}
function openAddNoteModal() { /* ... código como antes ... */
    currentEditingNoteId = null; if (!noteModal || !noteForm) return; closeModal(noteModal); if (noteForm) noteForm.reset(); if (noteIdInput) noteIdInput.value = ''; if (noteTypeSelect) noteTypeSelect.value = 'note'; if (noteModalTitle) noteModalTitle.textContent = "Nova Nota"; if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } if (noteContentInput) noteContentInput.addEventListener('keydown', handleNoteContentKeyDown); openModal(noteModal);
}
function openEditNoteModal(noteId) { /* ... código como antes ... */
    const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteModal || !noteForm) return showAlert("Erro.", 'danger'); currentEditingNoteId = noteId; closeModal(noteModal); if (noteForm) noteForm.reset(); if (noteIdInput) noteIdInput.value = note.id; if (noteTypeSelect) noteTypeSelect.value = note.type || 'note'; if (noteTitleInput) noteTitleInput.value = note.title || ''; if (noteContentInput) noteContentInput.value = note.content || ''; if (noteReminderDateInput) noteReminderDateInput.value = note.reminderDate || ''; if (noteReminderTimeInput) noteReminderTimeInput.value = note.reminderTime || ''; if (noteModalTitle) noteModalTitle.textContent = `Editar ${note.type === 'task' ? 'Tarefa' : 'Nota'}`; if (noteColorOptionsContainer) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.toggle('selected', o.dataset.color === note.color)); if (!noteColorOptionsContainer.querySelector('.selected')) noteColorOptionsContainer.querySelector('[data-color="default"]')?.classList.add('selected'); } if (noteContentInput) noteContentInput.addEventListener('keydown', handleNoteContentKeyDown); openModal(noteModal);
}
function handleNoteContentKeyDown(event) { /* ... código como antes, usa config.PENDING_CHECKLIST ... */
    if (event.key !== 'Enter' || !noteModal.classList.contains('active')) return; const cType = noteTypeSelect?.value; if (cType !== 'task') return; const txt = event.target; const pos = txt.selectionStart; const val = txt.value; const bef = val.substring(0, pos); const lines = bef.split('\n'); const cLine = lines[lines.length - 1]; const trimLine = cLine.trimStart(); const lead = cLine.substring(0, cLine.indexOf(trimLine)); const isChk = trimLine.startsWith(config.PENDING_CHECKLIST) || trimLine.startsWith(config.COMPLETED_CHECKLIST);
    if (isChk) { event.preventDefault(); const aft = val.substring(pos); const newV = bef + '\n' + lead + config.PENDING_CHECKLIST + aft; txt.value = newV; const newP = pos + 1 + lead.length + config.PENDING_CHECKLIST.length; txt.setSelectionRange(newP, newP); txt.scrollTop = txt.scrollHeight; }
    else if (trimLine.length === 0) { event.preventDefault(); const aft = val.substring(pos); const newV = bef + '\n' + config.PENDING_CHECKLIST + aft; txt.value = newV; const newP = pos + 1 + config.PENDING_CHECKLIST.length; txt.setSelectionRange(newP, newP); txt.scrollTop = txt.scrollHeight; }
}
function openQuickNotesPopup() { /* ... código como antes ... */
    if (!quickNotesModal || !quickNotesList) return; quickNotesList.innerHTML = '<p class="text-center text-muted small my-3">Carregando...</p>'; openModal(quickNotesModal); setTimeout(() => renderQuickNotesPopupContent(), 50);
}
function renderQuickNotesPopupContent() { /* ... código como antes ... */
    if (!quickNotesList) return; quickNotesList.innerHTML = ''; const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); if (sortedNotes.length === 0) { quickNotesList.innerHTML = '<p class="text-center text-muted small my-3">Nenhuma nota.</p>'; return; }
    sortedNotes.forEach(note => { const div = document.createElement('div'); div.className = `quick-note-item note-color-${note.color || 'default'} note-type-${note.type}`; div.dataset.noteId = note.id; const previewHtml = generateQuickNotePreviewHtml(note.content, note.type); const typeIcon = note.type === 'task' ? '<i class="fas fa-clipboard-list fa-fw text-muted me-1" title="Tarefa"></i>' : ''; const reminderIcon = note.reminderDate ? `<span title="${formatDisplayDateTime(note.reminderDate, note.reminderTime)}"><i class="far fa-bell${note.reminderTriggered ? '' : ' text-warning'}"></i></span>` : ''; const taskCountIcon = note.type === 'task' && note.totalTasks > 0 ? `<span title="${note.completedTasks}/${note.totalTasks} concluídas"><i class="fas fa-tasks"></i> ${note.completedTasks}/${note.totalTasks}</span>` : ''; div.innerHTML = ` ${note.title ? `<div class="quick-note-title">${typeIcon}${escapeHtml(note.title)}</div>` : `<div class="quick-note-title text-muted fst-italic">${typeIcon}(Sem Título)</div>`} <div class="quick-note-content-preview">${previewHtml}</div> <div class="quick-note-footer"> <span><i class="far fa-calendar-alt"></i> ${formatDisplayDate(note.updatedAt.substring(0,10))}</span> <div class="quick-note-icons">${reminderIcon} ${taskCountIcon}</div> </div>`; div.addEventListener('click', () => openNoteReaderModal(note.id)); quickNotesList.appendChild(div); });
}
function generateQuickNotePreviewHtml(content, noteType, maxLines = 3) { /* ... código como antes, usa config.PENDING/COMPLETED_CHECKLIST ... */
    if (!content) return ''; const lines = content.split('\n'); const linesToProc = lines.slice(0, maxLines); let pHtml = '';
    linesToProc.forEach(line => { const tLine = line.trimStart(); let lHtml = ''; if (noteType === 'task' && tLine.startsWith(config.PENDING_CHECKLIST)) { const rLine = line.substring(line.indexOf(config.PENDING_CHECKLIST) + config.PENDING_CHECKLIST.length); lHtml = `<div class="quick-preview-task-line"><input type="checkbox" disabled> ${escapeHtml(rLine)}</div>`; } else if (noteType === 'task' && tLine.startsWith(config.COMPLETED_CHECKLIST)) { const rLine = line.substring(line.indexOf(config.COMPLETED_CHECKLIST) + config.COMPLETED_CHECKLIST.length); lHtml = `<div class="quick-preview-task-line"><input type="checkbox" checked disabled> <span class="completed-text">${escapeHtml(rLine)}</span></div>`; } else { lHtml = `<div class="quick-preview-normal-line">${escapeHtml(line)}</div>`; } pHtml += lHtml; });
    if (lines.length > maxLines) pHtml += '<div class="ellipsis">...</div>'; return pHtml;
}
function openNoteReaderModal(noteId) { /* ... código como antes ... */
    const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteReaderModal || !noteReaderTitle || !noteReaderContent) return; if (quickNotesModal?.classList.contains('active')) closeModal(quickNotesModal); noteReaderTitle.textContent = note.title || "(Sem Título)"; const typeSpan = document.createElement('span'); typeSpan.className = `badge rounded-pill ms-2 ${note.type === 'task' ? 'bg-primary' : 'bg-secondary'}`; typeSpan.textContent = note.type === 'task' ? 'Tarefa' : 'Nota'; noteReaderTitle.appendChild(typeSpan); noteReaderModal.dataset.currentNoteId = note.id; updateNoteReaderContent(note.id); openModal(noteReaderModal);
}
function updateNoteReaderContent(noteId) { /* ... código como antes ... */
    const note = notes.find(n => String(n.id) === String(noteId)); if (!note || !noteReaderContent) return; noteReaderContent.removeEventListener('change', handleReaderCheckboxChange); const processedContentHtml = processNoteContentForDisplay(note.content || '', note.id, true); noteReaderContent.innerHTML = processedContentHtml; if (note.type === 'task') noteReaderContent.addEventListener('change', handleReaderCheckboxChange);
}
function openAttachmentViewer(dataUrl) { /* ... código como antes ... */
    if (!isProPlan || !dataUrl || !attachmentViewerModal || !attachmentViewerImage) { return showAlert("Não foi possível exibir o comprovante.", "warning"); } attachmentViewerImage.src = dataUrl; if (attachmentViewerDownloadLink) { attachmentViewerDownloadLink.href = dataUrl; const nameMatch = dataUrl.match(/name=([^;]+);/); const filename = nameMatch?.[1] || `comprovante_${Date.now()}.png`; attachmentViewerDownloadLink.download = filename; } openModal(attachmentViewerModal);
}
function showTransactionDetails(transactionId) { /* ... código como antes, usa config.categoryIconMapping e config.paymentMethodDetails ... */
    const t = transactions.find(tx => String(tx.id) === String(transactionId)); const m = transactionDetailModal; if (!t || !m) return showAlert("Erro ao buscar detalhes.", "warning");
    const setF = (fId, iCls, cont, isH = false) => { const el = safeGetElementById(fId); const sCId = fId === 'detailDescription' ? 'descriptionContainer' : (fId === 'detailOrigin' ? 'originContainer' : (fId === 'detailTags' ? 'tagsContainer' : (fId === 'detailBusinessInfo' ? 'businessInfoContainer' : (fId === 'detailAttachment' ? 'attachmentContainer' : null)))); const sC = sCId ? safeGetElementById(sCId) : null; if (el) { const dC = cont || cont === 0 ? String(cont) : ''; const iH = iCls ? `<i class="${iCls} fa-fw"></i> ` : ''; if (dC && dC !== '-') { if (isH || iCls) el.innerHTML = iH + dC; else el.textContent = dC; if (sC) sC.style.display = 'block'; } else { if (sC) sC.style.display = 'none'; else if (el.closest('.transaction-detail-grid')) el.innerHTML = '-'; } } };
    m.querySelectorAll('.transaction-detail-grid span, #detailDescription, #detailOrigin, #detailTags, #detailBusinessInfo, #detailAttachment').forEach(s => { s.innerHTML = '-'; }); ['descriptionContainer', 'originContainer', 'tagsContainer', 'businessInfoContainer', 'attachmentContainer'].map(id => safeGetElementById(id)).filter(Boolean).forEach(c => c.style.display = 'none');
    setF('detailId', 'fas fa-hashtag', t.id, true); setF('detailDate', 'far fa-calendar-alt', formatDisplayDate(t.date), true); const tTxt = t.type === 'income' ? 'Receita' : 'Despesa'; const tIcn = t.type === 'income' ? 'fas fa-arrow-up text-success' : 'fas fa-arrow-down text-danger'; const tEl = safeGetElementById('detailType'); if (tEl) tEl.innerHTML = `<i class="${tIcn} fa-fw"></i> ${tTxt}`; const aEl = safeGetElementById('detailAmount'); if (aEl) { aEl.innerHTML = `<i class="fas fa-dollar-sign fa-fw"></i> ${formatCurrency(t.amount)}`; aEl.className = t.type === 'income' ? 'amount-positive' : 'amount-negative'; } setF('detailItem', 'fas fa-tag', t.item, true); setF('detailDescription', null, t.description ? escapeHtml(t.description).replace(/\n/g, '<br>') : '', true);
    const cIcn = config.categoryIconMapping[t.category] || config.categoryIconMapping['default']; setF('detailCategory', `fas ${cIcn}`, t.category, true);
    const pmInfo = config.paymentMethodDetails[t.paymentMethod] || config.paymentMethodDetails.default; setF('detailPaymentMethod', pmInfo.icon, pmInfo.text, true);
    let oHtml = '', oTitle = 'Origem'; /* ... (lógica origem como antes, usa isWithinGracePeriod) ... */
        if (t.isScheduled && t.originatingBillId) { oTitle = 'Origem (Agendamento)'; const oBill = upcomingBills.find(b => String(b.id) === String(t.originatingBillId)); if (oBill) { oHtml = `Agend.: <strong>"${escapeHtml(oBill.name)}"</strong> (Venc: ${formatDisplayDate(oBill.date)}, Cat: ${escapeHtml(oBill.category)})<br><i>Pgto via ${t.paymentMethod.toUpperCase()} em ${formatDisplayDate(t.date)}.</i>`; if (oBill.paid && isWithinGracePeriod(oBill.processedTimestamp)) { const gracePeriodEndDate = new Date(parseFloat(String(oBill.processedTimestamp).replace(/[^\d.]/g, '')) + config.GRACE_PERIOD_MS); const rT = gracePeriodEndDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); oHtml += `<br><small class="text-success">Reversível até ${rT}.</small>`; } else if (oBill.paid) { oHtml += `<br><small class="text-muted">Reversão expirada.</small>`; } } else { oHtml = `Agend. ID: ${t.originatingBillId}<br><small class="text-warning">Registro original não encontrado.</small>`; } }
        else if (t.isRecurring && t.originatingRecurringId) { oTitle = 'Origem (Recorrência)'; const oRec = recurringTransactions.find(r => String(r.id) === String(t.originatingRecurringId)); if (oRec) { oHtml = `Recorrência: <strong>"${escapeHtml(oRec.name)}"</strong> (Freq: ${oRec.frequency})<br><i>Gerado em ${formatDisplayDate(t.date)}.</i>`; } else { oHtml = `Recorr. ID: ${t.originatingRecurringId}<br><small class="text-warning">Registro original não encontrado.</small>`; } }
        else if (t.originatingDebtId) { oTitle = 'Origem (Dívida)'; oHtml = `Dívida ID: <strong>${t.originatingDebtId}</strong><br><i>Pagamento registrado em ${formatDisplayDate(t.date)}.</i>`; }
        else { oTitle = 'Origem'; oHtml = `<i class="fas fa-keyboard fa-fw"></i> Transação Manual`; }
    setF('detailOrigin', null, oHtml, true); const oLbl = safeGetElementById('detailOriginLabel'); if (oLbl) oLbl.innerHTML = `<i class="fas fa-history fa-fw"></i> ${oTitle}:`;
    if (isProPlan && t.tags && t.tags.length > 0) { const tagsHtml = t.tags.map(tag => `<span class="badge bg-secondary me-1">${escapeHtml(tag)}</span>`).join(''); setF('detailTags', 'fas fa-tags', tagsHtml, true); }
    if (isBusinessPlan && (t.clientId || t.projectId || t.deductible || t.employeeId)) { let businessHtml = ''; if (t.clientId) { const clientName = getClientNameById(t.clientId); businessHtml += `<div><i class="fas fa-user-tie fa-fw"></i> Cliente: ${escapeHtml(clientName)}</div>`; } if (t.employeeId) { const employeeName = typeof getEmployeeNameById === 'function' ? getEmployeeNameById(t.employeeId) : `Funcionário ID ${t.employeeId}`; businessHtml += `<div><i class="fas fa-user fa-fw"></i> Funcionário: ${escapeHtml(employeeName)}</div>`; } if (t.projectId) { const projectName = getProjectNameById(t.projectId); businessHtml += `<div><i class="fas fa-briefcase fa-fw"></i> Projeto: ${escapeHtml(projectName)}</div>`; } if (t.deductible) { businessHtml += `<div><i class="fas fa-receipt fa-fw text-success"></i> Dedutível</div>`; } setF('detailBusinessInfo', null, businessHtml, true); }
    const attachmentContainer = safeGetElementById('attachmentContainer'); const detailAttachment = safeGetElementById('detailAttachment'); if (isProPlan && t.attachmentDataUrl && attachmentContainer && detailAttachment) { detailAttachment.innerHTML = `<button class="btn btn-sm btn-outline-secondary view-attachment-btn" data-url="${t.attachmentDataUrl}"><i class="fas fa-eye me-1"></i> Ver Comprovante</button>`; attachmentContainer.style.display = 'block'; } else if (attachmentContainer) { attachmentContainer.style.display = 'none'; }
    openModal(m);
}
// --- Fim Modals ---

// --- UI Navigation & Theme ---
function toggleSidebar() { /* ... código como antes ... */ if (sidebar) { sidebar.classList.toggle('open'); body.classList.toggle('body-scroll-locked', sidebar.classList.contains('open')); } }
export function showSection(sectionId) { /* ... código como antes ... */
    contentSections.forEach(s => s.classList.remove('active')); menuItems.forEach(i => i.classList.remove('active'));
    const secEl = safeGetElementById(`${sectionId}-section`); const mItem = safeQuerySelector(`.menu-item[data-section="${sectionId}"]`);
    if (secEl) {
        secEl.classList.add('active'); if (mItem) mItem.classList.add('active'); updatePageTitle(mItem?.querySelector('span')?.textContent || sectionId);
        if (sectionId === 'transactions') { if (safeGetElementById('filterCategory2')) updateCategoryDropdowns(safeGetElementById('filterCategory2'), 'filter'); clearFilters(); renderAllTransactions(); }
        else if (sectionId === 'scheduled') { renderAllScheduledPayments(); } else if (sectionId === 'goals') { renderGoals(); } else if (sectionId === 'notes') { renderNotes(); } else if (sectionId === 'settings') { loadSettingsValues(); }
        else if (sectionId === 'recurring' && isProPlan && typeof renderRecurringTransactions === 'function') { renderRecurringTransactions(); }
        else if (sectionId === 'invoices' && isBusinessPlan && typeof renderInvoices === 'function') { renderInvoices(); }
        else if (sectionId === 'debtors' && isBusinessPlan && typeof renderDebtorsList === 'function') { renderDebtorsList(); }
        else if (sectionId === 'tax-report' && isBusinessPlan) { /* Gerar Relatório? */ } updateCharts();
    } else { safeGetElementById('dashboard-section')?.classList.add('active'); safeQuerySelector('.menu-item[data-section="dashboard"]')?.classList.add('active'); updatePageTitle('Dashboard'); updateCharts(); }
    if (window.innerWidth < 768 && sidebar?.classList.contains('open')) { toggleSidebar(); }
}
function updatePageTitle(title) { /* ... código como antes ... */
    const dt = 'Gestor Financeiro'; let d = title ? title[0].toUpperCase() + title.slice(1) : 'Dashboard'; if (title?.toLowerCase() === 'dashboard') d = 'Dashboard'; if (pageTitleElement) pageTitleElement.textContent = d; document.title = `${dt} | ${d}`;
}
// --- Gerenciamento de Tema (Modo e Cor) ---
function setThemeMode(mode) {
    console.log(`[Theme] Tentando definir modo: ${mode}`);
    if (!['light', 'dark', 'auto'].includes(mode)) {
        console.warn(`[Theme] Modo inválido: ${mode}. Usando 'light'.`);
        mode = 'light';
    }
    themeModePreference = mode;
    localStorage.setItem(config.LS_KEY_THEME_MODE, mode); // Usa config

    // Remove listener antigo se existir
    if (prefersDarkSchemeListener && prefersDarkSchemeListener.removeEventListener) {
        try {
             prefersDarkSchemeListener.removeEventListener('change', handleSystemThemeChange);
             console.log("[Theme] Listener de tema do sistema removido.");
        } catch (e) {
             console.warn("[Theme] Erro ao remover listener antigo:", e);
        }
        prefersDarkSchemeListener = null;
    }

    if (mode === 'auto') {
        prefersDarkSchemeListener = window.matchMedia('(prefers-color-scheme: dark)');
        currentTheme = prefersDarkSchemeListener.matches ? 'dark' : 'light';
        console.log(`[Theme] Modo 'auto' ativado. Tema atual do sistema: ${currentTheme}`);
        // Adiciona novo listener
        if (prefersDarkSchemeListener.addEventListener) {
             prefersDarkSchemeListener.addEventListener('change', handleSystemThemeChange);
             console.log("[Theme] Listener de tema do sistema adicionado.");
        } else {
             console.warn("[Theme] addEventListener não suportado para matchMedia.");
        }
    } else {
        currentTheme = mode;
        console.log(`[Theme] Modo definido diretamente para: ${currentTheme}`);
    }
    applyCurrentThemePresentation();
}
function handleSystemThemeChange(e) {
    if (themeModePreference === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log(`[Theme] Mudança de tema do sistema detectada (modo auto). Novo tema: ${newTheme}`);
        if (newTheme !== currentTheme) {
             currentTheme = newTheme;
             applyCurrentThemePresentation();
        } else {
             console.log("[Theme] Mudança detectada, mas tema resultante é o mesmo. Nenhuma ação visual.");
        }
    } else {
        console.log("[Theme] Mudança de tema do sistema ignorada (modo não é 'auto'). Removendo listener.");
        if (prefersDarkSchemeListener && prefersDarkSchemeListener.removeEventListener) {
             try {
                  prefersDarkSchemeListener.removeEventListener('change', handleSystemThemeChange);
             } catch(e) { console.warn("[Theme] Erro ao remover listener (handleSystemThemeChange):", e);}
            prefersDarkSchemeListener = null;
        }
    }
}
function applyCurrentThemePresentation() {
    if (!body) {
        console.error("[Theme] Elemento <body> não encontrado para aplicar tema.");
        return;
    }
    console.log(`[Theme] Aplicando apresentação para o tema: ${currentTheme}`);
    body.setAttribute('data-theme', currentTheme); // Aplica ao BODY

    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.theme-icon-sun');
        const moonIcon = themeToggle.querySelector('.theme-icon-moon');
        const isDark = currentTheme === 'dark';
        if (sunIcon) sunIcon.style.display = isDark ? 'none' : 'inline-block';
        if (moonIcon) moonIcon.style.display = isDark ? 'inline-block' : 'none';
        themeToggle.title = isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
    }
    themeModeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === themeModePreference);
    });
    updateChartDefaults(); // Atualiza cores padrão dos gráficos
    updateCharts(); // Redesenha os gráficos com novas cores
    console.log(`[Theme] Atributo data-theme="${currentTheme}" aplicado ao <body>.`);
}
function applyThemeColor() {
    const root = document.documentElement;
    if (!root) {
         console.error("[Theme] Elemento <html> (root) não encontrado para aplicar cor.");
         return;
    }
    const savedColor = localStorage.getItem(config.LS_KEY_THEME_COLOR) || 'default'; // Usa config
    selectedThemeColor = savedColor;
    root.setAttribute('data-color', selectedThemeColor); // Aplica ao HTML
    console.log(`[Theme] Cor do tema aplicada: data-color="${selectedThemeColor}" no <html>.`);

    if (settingsSection?.classList.contains('active')) {
        themeColorOptions.forEach(option => {
            option.classList.toggle('selected', option.dataset.color === selectedThemeColor);
        });
    }
    updateChartDefaults();
    updateCharts();
}
// --- Fim Tema ---

// --- Value Visibility ---
function applyValueVisibilityIconAndClass() { /* ... código como antes, usa LS_KEY_VALUES_HIDDEN ... */
    if (body && valueToggleIcon) {
        valuesHidden = localStorage.getItem(config.LS_KEY_VALUES_HIDDEN) === 'true'; // Usa config
        body.classList.toggle('values-hidden', valuesHidden);
        valueToggleIcon.classList.toggle('fa-eye-slash', valuesHidden);
        valueToggleIcon.classList.toggle('fa-eye', !valuesHidden);
        valueToggle?.setAttribute('title', valuesHidden ? 'Mostrar valores' : 'Ocultar valores');
        updatePlaceholders();
    }
}
function toggleValueVisibility() { /* ... código como antes, usa LS_KEY_VALUES_HIDDEN ... */
    valuesHidden = !valuesHidden;
    localStorage.setItem(config.LS_KEY_VALUES_HIDDEN, String(valuesHidden)); // Usa config
    refreshAllUIComponents(); // Atualiza toda UI para refletir a mudança
}
export function updatePlaceholders() { /* ... código como antes ... */
    const ph = formatPlaceholderCurrency();
    [modalAmountInput, editAmountInput, scheduledAmountInput, monthlyContributionInput, comparePrice1, comparePrice2, monthlyBudgetInput].filter(Boolean).forEach(i => i.placeholder = ph);
    [initialBalancePixInput, initialBalanceCashInput, initialBalanceCardInput].filter(Boolean).forEach(i => i.placeholder = '0.00');
    goalsListContainer?.querySelectorAll('.contribution-input').forEach(i => i.placeholder = ph);
    [modalDescriptionInput, editDescriptionInput].filter(Boolean).forEach(t => t.placeholder = 'Notas... (Opc.)');
    if (safeGetElementById('searchInput2')) safeGetElementById('searchInput2').placeholder = 'Pesquisar...';
    [compareQuantity1, compareQuantity2].filter(Boolean).forEach(i => { if (i.placeholder === ph) { i.placeholder = i.id === 'compareQuantity1' ? '500' : '1'; } });
    const recurringAmountInput = document.getElementById('recurringAmount'); if (recurringAmountInput) recurringAmountInput.placeholder = ph;
    const invoiceItemPriceInputs = document.querySelectorAll('.item-unit-price'); invoiceItemPriceInputs.forEach(i => i.placeholder = ph);
    const debtAmountInput = document.getElementById('debtAmount'); if (debtAmountInput) debtAmountInput.placeholder = ph;
    const paymentAmountReceivedInput = document.getElementById('paymentAmountReceived'); if (paymentAmountReceivedInput) paymentAmountReceivedInput.placeholder = ph;
}
// --- Fim Value Visibility ---

// --- Settings Loader ---
function loadSettingsValues() { /* ... código como antes, usa config chaves LS_* ... */
    if (!settingsSection) return;
    if (initialBalancePixInput) initialBalancePixInput.value = initialBalances.pix.toFixed(2); if (initialBalanceCashInput) initialBalanceCashInput.value = initialBalances.cash.toFixed(2); if (initialBalanceCardInput) initialBalanceCardInput.value = initialBalances.card.toFixed(2); updateBalanceDisplays();
    if (userNameInput) userNameInput.value = userName; if (userEmailInput) userEmailInput.value = userEmail; if (currencyInput) currencyInput.value = currency; if (monthlyBudgetInput) { monthlyBudgetInput.value = monthlyBudget > 0 ? monthlyBudget.toFixed(2) : ''; }
    const companyNameInput = safeGetElementById('companyNameInput'); const companyTaxIdInput = safeGetElementById('companyTaxIdInput'); const companyAddressInput = safeGetElementById('companyAddressInput'); const companyPhoneInput = safeGetElementById('companyPhoneInput'); const companyEmailInput = safeGetElementById('companyEmailInput'); const invoiceLogoUrlInput = safeGetElementById('invoiceLogoUrlInput'); const invoiceNotesInput = safeGetElementById('invoiceNotesInput'); if (companyNameInput) companyNameInput.value = companySettings.name || ''; if (companyTaxIdInput) companyTaxIdInput.value = companySettings.taxId || ''; if (companyAddressInput) companyAddressInput.value = companySettings.address || ''; if (companyPhoneInput) companyPhoneInput.value = companySettings.phone || ''; if (companyEmailInput) companyEmailInput.value = companySettings.email || ''; if (invoiceLogoUrlInput) invoiceLogoUrlInput.value = companySettings.logoUrl || ''; if (invoiceNotesInput) invoiceNotesInput.value = companySettings.invoiceNotes || '';
    themeModeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === themeModePreference)); themeColorOptions.forEach(opt => opt.classList.toggle('selected', opt.dataset.color === selectedThemeColor));
    if (typeof importDataInput !== 'undefined' && importDataInput) importDataInput.value = '';
    // Re-renderiza componentes Business se settings estiverem visíveis
    if (isBusinessPlan && typeof renderClients === 'function') renderClients();
    if (isBusinessPlan && typeof renderProjects === 'function') renderProjects();
    if (isBusinessPlan && typeof renderEmployees === 'function') renderEmployees(); // Assumindo que exista essa função
    updatePlaceholders();
}
// --- Fim Settings Loader ---

// --- Event Listeners Setup ---
function setupEventListeners() {
    // ... (Todos os seus listeners ficam aqui, como antes)
    console.log("Configurando Listeners Core...");
    if (viewAllGoalsBtn) viewAllGoalsBtn.addEventListener('click', () => showSection('goals')); if (viewAllScheduledBtn) viewAllScheduledBtn.addEventListener('click', () => showSection('scheduled')); if (viewAllTransactionsBtn) viewAllTransactionsBtn.addEventListener('click', () => showSection('transactions')); if (createNoteFromEmptyStateBtn && addNoteBtn) { createNoteFromEmptyStateBtn.addEventListener('click', () => addNoteBtn.click()); } if (openEconomyCalculatorBtn) { openEconomyCalculatorBtn.addEventListener('click', () => { clearComparisonForm(); openModal(economyCalculatorModal); }); } if (calculateComparisonBtn) { calculateComparisonBtn.addEventListener('click', handleComparisonCalculation); } if (clearComparisonBtn) { clearComparisonBtn.addEventListener('click', clearComparisonForm); } if (menuToggle) menuToggle.addEventListener('click', toggleSidebar); if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
    if (themeToggle) { themeToggle.addEventListener('click', () => { const newMode = currentTheme === 'dark' ? 'light' : 'dark'; setThemeMode(newMode); }); }
    if (valueToggle) valueToggle.addEventListener('click', toggleValueVisibility); menuItems.forEach(item => item.addEventListener('click', (e) => { const s = e.currentTarget.dataset.section || e.currentTarget.closest('.menu-item')?.dataset.section; if (s) showSection(s); })); if (addTransactionFab) addTransactionFab.addEventListener('click', openAddTransactionModal); if (addScheduledPaymentBtn) addScheduledPaymentBtn.addEventListener('click', openScheduledPaymentModal); if (addScheduledFromListBtn) addScheduledFromListBtn.addEventListener('click', openScheduledPaymentModal); addGoalBtns.forEach(b => b?.addEventListener('click', openAddGoalModal)); document.querySelectorAll('.modal-overlay').forEach(ov => { ov.addEventListener('click', (e) => { const t = e.target; if (t === ov || t.classList.contains('modal-close') || t.closest('.modal-close')) { if (ov.id === 'scheduledWarningModal' && t === ov) return; if (ov.id === 'noteReaderModal' && !(t.id === 'closeNoteReaderBtn' || t.closest('#closeNoteReaderBtn'))) return; if (ov.id === 'attachmentViewerModal' && t === ov) return; closeModal(ov); } }); }); const ccBtn = confirmModal?.querySelector('#cancelConfirm'); if (ccBtn) ccBtn.onclick = () => closeModal(confirmModal); if (transactionModalForm) transactionModalForm.addEventListener('submit', addTransactionFromModal); if (editForm) editForm.addEventListener('submit', (e) => { e.preventDefault(); saveEditedTransaction(); }); if (goalForm) goalForm.addEventListener('submit', saveGoal); if (scheduledPaymentForm) scheduledPaymentForm.addEventListener('submit', saveScheduledPayment); if (noteForm) noteForm.addEventListener('submit', saveNote); if (saveInitialBalancesBtn) saveInitialBalancesBtn.addEventListener('click', saveSettings); if (saveUserSettingsBtn) saveUserSettingsBtn.addEventListener('click', saveUserSettings); if (saveBudgetBtn) saveBudgetBtn.addEventListener('click', saveBudget); const saveCompanySettingsBtn = safeGetElementById('saveCompanySettingsBtn'); if (saveCompanySettingsBtn) { saveCompanySettingsBtn.addEventListener('click', saveCompanySettings); } if (modalTypeInput && modalCategoryInput) modalTypeInput.addEventListener('change', () => updateCategoryDropdowns(modalCategoryInput, modalTypeInput.value || 'expense', isProPlan)); if (editTypeInput && editCategoryInput) editTypeInput.addEventListener('change', () => updateCategoryDropdowns(editCategoryInput, editTypeInput.value || 'expense', isProPlan)); if (scheduledCategoryInput) scheduledCategoryInput.addEventListener('change', handleScheduledCategoryChange);
    if (goalImageInput && goalImagePreview) { goalImageInput.addEventListener('change', (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => { if (ev.target?.result && goalImagePreview instanceof HTMLImageElement) { goalImagePreview.src = ev.target.result.toString(); goalImagePreview.style.display = 'block'; const rm = goalImagePreview.closest('.image-upload-container')?.querySelector('.remove-image-btn'); if (rm instanceof HTMLElement) rm.style.display = 'inline-block'; } }; r.readAsDataURL(f); } }); }
    if (removeGoalImageBtn) removeGoalImageBtn.addEventListener('click', removeImageHandler);
    if (settingsSection) {
        themeModeButtons.forEach(button => { button.addEventListener('click', () => { const selectedMode = button.dataset.mode; if (selectedMode && selectedMode !== themeModePreference) { setThemeMode(selectedMode); /* Alerta removido daqui, pois setThemeMode já loga */ } }); });
        themeColorOptions.forEach(option => { option.addEventListener('click', () => { const selectedColor = option.dataset.color; if (selectedColor && selectedColor !== selectedThemeColor) { themeColorOptions.forEach(o => o.classList.remove('selected')); option.classList.add('selected'); selectedThemeColor = selectedColor; localStorage.setItem(config.LS_KEY_THEME_COLOR, selectedThemeColor); applyThemeColor(); /* Alerta removido daqui */ } }); });
        settingsSection.addEventListener('click', (e) => { const bAB = e.target.closest('.balance-adjust'); if (bAB?.dataset.method && bAB?.dataset.amount) { const m = bAB.dataset.method; const a = parseFloat(bAB.dataset.amount); if (!isNaN(a)) adjustBalance(m, a); } });
    }
    if (exportDataBtn) exportDataBtn.addEventListener('click', exportData); if (importDataBtn && importDataInput) importDataBtn.addEventListener('click', () => importDataInput.click()); if (importDataInput) importDataInput.addEventListener('change', handleFileImport);
    [safeGetElementById('filterType2'), safeGetElementById('filterCategory2'), safeGetElementById('filterPayment2')].filter(Boolean).forEach(el => el.addEventListener('change', filterTransactions)); const tagFilterInput = document.getElementById('filterTagsInput'); if (tagFilterInput) tagFilterInput.addEventListener('input', debounce(filterTransactions, 300)); const sIn = safeGetElementById('searchInput2'); if (sIn) sIn.addEventListener('input', debounce(filterTransactions, 300)); const cF = safeGetElementById('clearFilters2'); if (cF) cF.addEventListener('click', clearFilters);
    if (allTransactionsContainer) { allTransactionsContainer.addEventListener('click', (e) => { const item = e.target.closest('.transaction-item'); if (!item?.dataset?.id) return; const txId = item.dataset.id; const txIndex = transactions.findIndex(t => String(t.id) === String(txId)); if (txIndex === -1) return; const editBtn = e.target.closest('.edit-transaction:not([disabled])'); const delBtn = e.target.closest('.delete-transaction:not([disabled])'); if (editBtn) { e.stopPropagation(); openEditModal(txIndex); } else if (delBtn) { e.stopPropagation(); confirmDeleteTransaction(txId); } else if (!e.target.closest('.edit-transaction') && !e.target.closest('.delete-transaction')) { showTransactionDetails(txId); } }); }
    if (goalsListContainer) { goalsListContainer.addEventListener('click', (e) => { const t = e.target; const item = t.closest('.goal-item'); const id = item?.dataset.id; if (!item || !id) return; const idx = goals.findIndex(g => String(g.id) === String(id)); if (idx === -1) return; const addBtn = t.closest('.add-contribution-btn'); const editBtn = t.closest('.edit-goal'); const delBtn = t.closest('.delete-goal'); const compBtn = t.closest('.complete-goal-btn'); if (editBtn) { e.stopPropagation(); openEditGoalModal(idx); } else if (delBtn) { e.stopPropagation(); deleteGoal(idx); } else if (compBtn) { e.stopPropagation(); completeGoal(idx); } else if (addBtn) { e.stopPropagation(); const inp = item.querySelector('.contribution-input'); if (inp instanceof HTMLInputElement) addContribution(idx, inp.value); } }); }
    const billActHandler = (e) => { const btn = e.target.closest('.action-btn, .manual-pay-btn'); if (!btn) return; const item = btn.closest('.bill-item'); const bId = item?.dataset?.id; if (!item || !bId) return; const bIdx = upcomingBills.findIndex(b => String(b.id) === String(bId)); if (bIdx === -1) return; e.stopPropagation(); if (btn.classList.contains('delete-scheduled-item-btn')) { deleteScheduledItem(bIdx); } else if (btn.classList.contains('manual-pay-btn')) { openManualPaymentForBill(bId); } }; if (upcomingBillsContainer) upcomingBillsContainer.addEventListener('click', billActHandler); if (allScheduledPaymentsListContainer) allScheduledPaymentsListContainer.addEventListener('click', billActHandler);
    if (addNoteBtn) addNoteBtn.addEventListener('click', openAddNoteModal); if (viewAllNotesBtn) viewAllNotesBtn.addEventListener('click', () => openModal(viewAllNotesModal)); if (quickViewNotesBtn) quickViewNotesBtn.addEventListener('click', openQuickNotesPopup); if (notesListContainer) { notesListContainer.addEventListener('click', (e) => { const t = e.target; const card = t.closest('.note-card'); const id = card?.dataset.noteId; if (!id) return; if (t.closest('.edit-note')) { e.stopPropagation(); openEditNoteModal(id); } else if (t.closest('.delete-note')) { e.stopPropagation(); confirmDeleteNote(id); } else { openNoteReaderModal(id); } }); }
    if (viewAllNotesList) { viewAllNotesList.addEventListener('click', (e) => { const t = e.target; const card = t.closest('.note-card'); const id = card?.dataset.noteId; if (!id) return; if (t.closest('.edit-note')) { e.stopPropagation(); closeModal(viewAllNotesModal); openEditNoteModal(id); } else if (t.closest('.delete-note')) { e.stopPropagation(); confirmDeleteNote(id).then(() => { if (viewAllNotesModal.classList.contains('active')) { renderNotes(); } }); } else { closeModal(viewAllNotesModal); openNoteReaderModal(id); } }); }
    if (noteColorOptionsContainer) { noteColorOptionsContainer.addEventListener('click', (e) => { const t = e.target.closest('.color-option'); if (t?.dataset.color) { noteColorOptionsContainer.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected')); t.classList.add('selected'); } }); } if (closeNoteReaderBtn) closeNoteReaderBtn.addEventListener('click', () => closeModal(noteReaderModal)); if (transactionDetailModal) { transactionDetailModal.addEventListener('click', (e) => { const viewBtn = e.target.closest('.view-attachment-btn'); if (viewBtn && viewBtn.dataset.url) { e.stopPropagation(); openAttachmentViewer(viewBtn.dataset.url); } }); }
    document.addEventListener('categoriesUpdated', () => { console.log("Core: Evento 'categoriesUpdated' recebido."); updateAllCategoryDropdowns(); });

    // --- Listener Botão PIX ---
    if (payWithPixBtn) { payWithPixBtn.addEventListener('click', async () => { const valorString = prompt("Qual valor deseja pagar via PIX? (Ex: 10.50)", "10.00"); if (valorString === null) { showAlert("Pagamento PIX cancelado.", "info"); return; } const valor = parseFloat(valorString.replace(',', '.')) || 0; if (isNaN(valor) || valor <= 0) { showAlert("Valor inválido.", "warning"); return; } try { if (loadingIndicator) loadingIndicator.style.display = 'flex'; const linkPagamento = await obterLinkPagamentoMercadoPago(valor); if (linkPagamento) { showAlert("Redirecionando para o pagamento PIX...", "success", 2000); setTimeout(() => { window.location.href = linkPagamento; }, 1500); } } catch (error) { if (loadingIndicator) loadingIndicator.style.display = 'none'; console.error("Erro no fluxo PIX:", error); /* obterLinkPagamento já mostra alerta */ } }); }
    else { console.warn("Botão PIX #payWithPixBtn não encontrado."); }

    console.log("Listeners Core Configurados.");
}
// --- Fim Event Listeners ---

// --- Filtering Logic ---
function filterTransactions() { /* ... código como antes ... */
    const ty = safeGetElementById('filterType2')?.value || 'all'; const ca = safeGetElementById('filterCategory2')?.value || 'all'; const pa = safeGetElementById('filterPayment2')?.value || 'all'; const se = (safeGetElementById('searchInput2')?.value || '').toLowerCase().trim(); const tagFilterInput = document.getElementById('filterTagsInput'); const tagsToFilter = isProPlan && tagFilterInput ? parseTags(tagFilterInput.value) : [];
    const filt = transactions.filter(t => { const typeMatch = (ty === 'all' || t.type === ty); const catMatch = (ca === 'all' || t.category === ca); const payMatch = (pa === 'all' || t.paymentMethod === pa); const searchMatch = (se === '' || t.item.toLowerCase().includes(se) || t.category.toLowerCase().includes(se) || (t.description && t.description.toLowerCase().includes(se))); const tagsMatch = tagsToFilter.length === 0 || tagsToFilter.every(filterTag => (t.tags || []).map(tg => tg.toLowerCase()).includes(filterTag.toLowerCase())); return typeMatch && catMatch && payMatch && searchMatch && tagsMatch; });
    renderAllTransactions(filt);
}
function clearFilters() { /* ... código como antes ... */
    const t = safeGetElementById('filterType2'); if (t) t.value = 'all'; const c = safeGetElementById('filterCategory2'); if (c) c.value = 'all'; const p = safeGetElementById('filterPayment2'); if (p) p.value = 'all'; const s = safeGetElementById('searchInput2'); if (s) s.value = ''; const tagFilterInput = document.getElementById('filterTagsInput'); if (tagFilterInput) tagFilterInput.value = ''; filterTransactions();
}
// --- Fim Filtering ---

// --- Charting Functions ---
export function updateCharts() {
    // ... (código como antes, usando config.incomeExpenseChartColors e config.paymentMethodDetails)
    if (typeof Chart === 'undefined') return;
    [expensesChart, incomeVsExpensesChart, paymentMethodsChart, expensesChart2, incomeVsExpensesChart2, paymentMethodsChart2, monthlyHistoryChart].forEach(ch => { try { ch?.destroy?.(); } catch (e) { console.warn("Erro ao destruir chart:", e); } }); expensesChart = incomeVsExpensesChart = paymentMethodsChart = expensesChart2 = incomeVsExpensesChart2 = paymentMethodsChart2 = monthlyHistoryChart = null;
    const expByCat = {}, payMethUseExpense = { pix: 0, cash: 0, card: 0 }, monthData = {}; let totInc = 0, totExp = 0;
    const reportDateRange = getReportDateRangeForCharts();
    const visibleTransactionsForChart = transactions.filter(t => !(t.isScheduled && t.type === 'income' && t.paymentMethod === 'card' && t.category === 'Pagamento Fatura Cartão' && t.originatingBillId)).filter(t => { if (!isProPlan || !reportDateRange.startDate || !reportDateRange.endDate) return true; return t.date >= reportDateRange.startDate && t.date <= reportDateRange.endDate; });
    visibleTransactionsForChart.forEach(t => { if (!t?.category || t.category.startsWith('--') || isNaN(t.amount)) return; const mY = t.date.substring(0, 7); if (!monthData[mY]) monthData[mY] = { income: 0, expense: 0 }; if (t.type === 'expense') { totExp += t.amount; expByCat[t.category] = (expByCat[t.category] || 0) + t.amount; if (payMethUseExpense.hasOwnProperty(t.paymentMethod)) payMethUseExpense[t.paymentMethod] += t.amount; monthData[mY].expense += t.amount; } else { totInc += t.amount; monthData[mY].income += t.amount; } });
    const formatLabel = (ctx, vPath = 'parsed') => { const l = ctx.label || ''; const v = vPath === 'parsed.x' ? ctx.parsed?.x : (vPath === 'parsed.y' ? ctx.parsed?.y : ctx.parsed) || 0; if (valuesHidden) return `${l}: R$ ***`; const ds = ctx.dataset; let pct = ''; if ((ctx.chart.config.type === 'pie' || ctx.chart.config.type === 'doughnut') && ds.data?.length > 0) { const tot = ds.data.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0); pct = tot > 0 ? ` (${(v/tot*100).toFixed(0)}%)` : ''; } return `${l}: ${formatCurrency(v)}${pct}`; };
    const chartOptsBase = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 10, font: { size: 10 } } }, tooltip: { callbacks: { label: (ctx) => formatLabel(ctx, ctx.chart.config.type === 'bar' && ctx.chart.config.options?.indexAxis === 'y' ? 'parsed.x' : 'parsed.y') } } } }; const pieTT = { callbacks: { label: ctx => formatLabel(ctx) } }; const hBarTT = { callbacks: { label: ctx => formatLabel(ctx, 'parsed.x') } };
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color')?.trim() || '#0d6efd'; const themeColors = [ themeColor, getComputedStyle(document.documentElement).getPropertyValue('--theme-color-purple')?.trim() || '#6f42c1', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-pink')?.trim() || '#d63384', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-red')?.trim() || '#dc3545', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-orange')?.trim() || '#fd7e14', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-yellow')?.trim() || '#ffc107', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-green')?.trim() || '#198754', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-teal')?.trim() || '#20c997', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-cyan')?.trim() || '#0dcaf0', getComputedStyle(document.documentElement).getPropertyValue('--text-muted')?.trim() || '#6c757d' ]; const eClrs = themeColors.slice(0, 10);
    const pClrs = { pix: config.paymentMethodDetails.pix.color, cash: config.paymentMethodDetails.cash.color, card: config.paymentMethodDetails.card.color, other: config.paymentMethodDetails.default.color };
    const manageC = (ctx, hasD, msg = "Sem dados") => { if (!ctx?.canvas?.parentElement) return; const p = ctx.canvas.parentElement; p.querySelectorAll('.chart-empty-message').forEach(e => e.remove()); if (hasD) { if (ctx.canvas) ctx.canvas.style.display = 'block'; } else { if (ctx.canvas) ctx.canvas.style.display = 'none'; const m = document.createElement('p'); m.className = 'chart-empty-message text-center text-muted p-3'; m.innerHTML = `<i class="fas fa-chart-pie fa-2x mb-2 d-block"></i> ${msg}`; p.appendChild(m); } }; const expL = Object.keys(expByCat).filter(cat => expByCat[cat] > 0).sort((a, b) => expByCat[b] - expByCat[a]);
    if (expChartCtx) { manageC(expChartCtx, expL.length > 0, "Nenhuma despesa"); if (expL.length > 0) { const cfg = { type: 'doughnut', data: { labels: expL, datasets: [{ data: expL.map(l => expByCat[l]), backgroundColor: expL.map((_, ix) => eClrs[ix % eClrs.length]), borderColor: currentTheme === 'dark' ? 'var(--card-bg)' : '#fff', borderWidth: 2 }] }, options: { ...chartOptsBase, cutout: '60%', plugins: { ...chartOptsBase.plugins, tooltip: pieTT } } }; try { expensesChart = new Chart(expChartCtx, cfg); } catch (e) { console.error(`Err Chart Exp 0:`, e); manageC(expChartCtx, false); } } }
    if (incExpChartCtx) { manageC(incExpChartCtx, totInc > 0 || totExp > 0, "Sem Rec/Desp"); if (totInc > 0 || totExp > 0) { const cfg = { type: 'bar', data: { labels: ['Receitas', 'Despesas'], datasets: [{ data: [totInc, totExp], backgroundColor: [config.incomeExpenseChartColors.income, config.incomeExpenseChartColors.expense], borderColor: [config.incomeExpenseChartColors.incomeBorder, config.incomeExpenseChartColors.expenseBorder], borderWidth: 1 }] }, options: { ...chartOptsBase, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) }, grid: { color: Chart.defaults.borderColor } }, y: { grid: { display: false } } }, plugins: { ...chartOptsBase.plugins, legend: { display: false }, tooltip: hBarTT } } }; try { incomeVsExpensesChart = new Chart(incExpChartCtx, cfg); } catch (e) { console.error(`Err Chart IncExp 0:`, e); manageC(incExpChartCtx, false); } } }
    const payL = Object.keys(payMethUseExpense).filter(m => payMethUseExpense[m] > 0); if (payMethChartCtx) { manageC(payMethChartCtx, payL.length > 0, "Métodos ñ usados"); if (payL.length > 0) { const l = payL.map(m => config.paymentMethodDetails[m]?.text || m); const cfg = { type: 'pie', data: { labels: l, datasets: [{ data: payL.map(m => payMethUseExpense[m]), backgroundColor: payL.map(m => pClrs[m] || pClrs.other), borderColor: currentTheme === 'dark' ? 'var(--card-bg)' : '#fff', borderWidth: 2 }] }, options: { ...chartOptsBase, plugins: { ...chartOptsBase.plugins, tooltip: pieTT } } }; try { paymentMethodsChart = new Chart(payMethChartCtx, cfg); } catch (e) { console.error(`Err Chart PayM 0:`, e); manageC(payMethChartCtx, false); } } }
    if (expChartCtx2) { manageC(expChartCtx2, expL.length > 0, "Nenhuma despesa no período"); if (expL.length > 0) { const cfg = { type: 'doughnut', data: { labels: expL, datasets: [{ data: expL.map(l => expByCat[l]), backgroundColor: expL.map((_, ix) => eClrs[ix % eClrs.length]), borderColor: currentTheme === 'dark' ? 'var(--card-bg)' : '#fff', borderWidth: 2 }] }, options: { ...chartOptsBase, cutout: '60%', plugins: { ...chartOptsBase.plugins, tooltip: pieTT } } }; try { expensesChart2 = new Chart(expChartCtx2, cfg); } catch (e) { console.error(`Err Chart Exp 2:`, e); manageC(expChartCtx2, false); } } }
    if (incExpChartCtx2) { manageC(incExpChartCtx2, totInc > 0 || totExp > 0, "Sem Rec/Desp no período"); if (totInc > 0 || totExp > 0) { const cfg = { type: 'bar', data: { labels: ['Receitas', 'Despesas'], datasets: [{ data: [totInc, totExp], backgroundColor: [config.incomeExpenseChartColors.income, config.incomeExpenseChartColors.expense], borderColor: [config.incomeExpenseChartColors.incomeBorder, config.incomeExpenseChartColors.expenseBorder], borderWidth: 1 }] }, options: { ...chartOptsBase, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) }, grid: { color: Chart.defaults.borderColor } }, y: { grid: { display: false } } }, plugins: { ...chartOptsBase.plugins, legend: { display: false }, tooltip: hBarTT } } }; try { incomeVsExpensesChart2 = new Chart(incExpChartCtx2, cfg); } catch (e) { console.error(`Err Chart IncExp 2:`, e); manageC(incExpChartCtx2, false); } } }
    if (payMethChartCtx2) { manageC(payMethChartCtx2, payL.length > 0, "Métodos ñ usados no período"); if (payL.length > 0) { const l = payL.map(m => config.paymentMethodDetails[m]?.text || m); const cfg = { type: 'pie', data: { labels: l, datasets: [{ data: payL.map(m => payMethUseExpense[m]), backgroundColor: payL.map(m => pClrs[m] || pClrs.other), borderColor: currentTheme === 'dark' ? 'var(--card-bg)' : '#fff', borderWidth: 2 }] }, options: { ...chartOptsBase, plugins: { ...chartOptsBase.plugins, tooltip: pieTT } } }; try { paymentMethodsChart2 = new Chart(payMethChartCtx2, cfg); } catch (e) { console.error(`Err Chart PayM 2:`, e); manageC(payMethChartCtx2, false); } } }
    if (monHistChartCtx) { updateCashFlowChart(monthData); } if (isProPlan && typeof renderCashFlowReport === 'function') { renderCashFlowReport(monthData); } else if (!isProPlan && cashFlowReportContainer) { cashFlowReportContainer.style.display = 'none'; }
}
function updateCashFlowChart(monthlyData) { /* ... código como antes, usa config.incomeExpenseChartColors ... */
    if (!monHistChartCtx || typeof Chart === 'undefined') return; if (monthlyHistoryChart?.destroy) monthlyHistoryChart.destroy(); const parent = monHistChartCtx.canvas?.parentElement;
    const manageC = (hasD, msg = "Sem histórico") => { if (!parent) return; parent.querySelectorAll('.chart-empty-message').forEach(e => e.remove()); if (hasD) { if (monHistChartCtx.canvas) monHistChartCtx.canvas.style.display = 'block'; } else { if (monHistChartCtx.canvas) monHistChartCtx.canvas.style.display = 'none'; const m = document.createElement('p'); m.className = 'chart-empty-message text-center text-muted p-3'; m.innerHTML = `<i class="fas fa-calendar-alt fa-2x mb-2 d-block"></i> ${msg}`; parent.appendChild(m); } };
    const sMonths = Object.keys(monthlyData).sort((a, b) => a.localeCompare(b)); manageC(sMonths.length > 0); if (sMonths.length === 0) return;
    const lbls = sMonths.map(mY => { const [y, m] = mY.split('-'); return `${getMonthName(parseInt(m)-1)}/${y.slice(-2)}`; }); const incData = sMonths.map(m => monthlyData[m].income); const expData = sMonths.map(m => monthlyData[m].expense); const tCb = (v) => valuesHidden ? '***' : formatCurrency(v); const ttCb = (ctx) => { const lbl = ctx.dataset.label || ''; const v = ctx.parsed?.y || 0; return `${lbl}: ${valuesHidden?'***':formatCurrency(v)}`; };
    try { monthlyHistoryChart = new Chart(monHistChartCtx, { type: 'bar', data: { labels: lbls, datasets: [{ label: 'Receitas', data: incData, backgroundColor: config.incomeExpenseChartColors.income, borderColor: config.incomeExpenseChartColors.incomeBorder, borderWidth: 1 }, { label: 'Despesas', data: expData, backgroundColor: config.incomeExpenseChartColors.expense, borderColor: config.incomeExpenseChartColors.expenseBorder, borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: false, grid: { display: false } }, y: { beginAtZero: true, stacked: false, ticks: { callback: tCb }, grid: { color: Chart.defaults.borderColor } } }, plugins: { tooltip: { callbacks: { label: ttCb } }, legend: { position: 'top' } } } }); }
    catch (e) { console.error("Erro criar monthlyHistoryChart:", e); manageC(false); }
}
function getReportDateRangeForCharts() { /* ... código como antes ... */
    let startDate = null; let endDate = null; if (isProPlan && reportStartDateInput && reportEndDateInput) { startDate = reportStartDateInput.value || null; endDate = reportEndDateInput.value || null; if (startDate && endDate && startDate > endDate) { return { startDate: null, endDate: null }; } } return { startDate, endDate };
}
function updateChartDefaults() { /* ... código como antes ... */
    if (typeof Chart === 'undefined') return; const isDark = currentTheme === 'dark'; const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : '#495057';
    Chart.defaults.color = textColor; Chart.defaults.borderColor = gridColor; if (Chart.defaults.plugins?.legend?.labels) { Chart.defaults.plugins.legend.labels.color = textColor; } if (Chart.defaults.scale?.ticks) { Chart.defaults.scale.ticks.color = textColor; } if (Chart.defaults.scale?.grid) { Chart.defaults.scale.grid.color = gridColor; } if (Chart.defaults.elements?.bar) { Chart.defaults.elements.bar.borderRadius = 4; Chart.defaults.elements.bar.borderSkipped = 'start'; }
    console.log(`[Theme] Chart defaults updated for ${currentTheme} theme.`);
}
// --- Fim Charting ---

// --- UI Update Helpers ---
export function refreshAllUIComponents() { /* ... código como antes ... */
    console.log("Core: Atualizando UI..."); applyValueVisibilityIconAndClass(); updateBalanceDisplay(); updateBalanceDisplays(); updateBudgetDisplay(); renderTransactionHistory(); renderUpcomingBills(); renderGoals(); updateGoalsSummary();
    const actSect = document.querySelector('.content-section.active'); const currentSectionId = actSect ? actSect.id.replace('-section', '') : null;
    if (currentSectionId === 'transactions') { if (safeGetElementById('filterCategory2')) updateCategoryDropdowns(safeGetElementById('filterCategory2'), 'filter'); filterTransactions(); }
    else if (currentSectionId === 'scheduled') { renderAllScheduledPayments(); } else if (currentSectionId === 'notes') { renderNotes(); } else if (currentSectionId === 'settings') { loadSettingsValues(); }
    if (currentSectionId === 'recurring' && isProPlan && typeof renderRecurringTransactions === 'function') { renderRecurringTransactions(); } if (currentSectionId === 'invoices' && isBusinessPlan && typeof renderInvoices === 'function') { renderInvoices(); } if (currentSectionId === 'debtors' && isBusinessPlan && typeof renderDebtorsList === 'function') { renderDebtorsList(); }
    if (quickNotesModal?.classList.contains('active')) renderQuickNotesPopupContent(); updateCharts(); updatePlaceholders(); console.log("Core: UI Atualizada.");
}
function updateUIafterTransactionChange() { refreshAllUIComponents(); checkScheduledPayments(); }
function updateUIafterSettingsChange() { refreshAllUIComponents(); }
function updateUIafterImport() { refreshAllUIComponents(); checkScheduledPayments(); checkReminders(); loadSettingsValues(); showSection('dashboard'); if (isBusinessPlan && typeof renderSettingsBasedOnRole === 'function') { if (settingsSection?.classList.contains('active')) { renderSettingsBasedOnRole(); } } }
function highlightNewTransaction(txId) { /* ... código como antes ... */
    const h = (el) => { if (!el) return; el.classList.add('new-transaction-highlight'); setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100); setTimeout(() => el.classList.remove('new-transaction-highlight'), 3500); };
    const hEl = transactionHistoryContainer?.querySelector(`.transaction-item[data-id="${txId}"]`); const aEl = allTransactionsContainer?.querySelector(`.transaction-item[data-id="${txId}"]`); h(hEl); if (allTransactionsContainer?.closest('.content-section')?.classList.contains('active')) { h(aEl); }
}
export function updateAllCategoryDropdowns() { /* ... código como antes ... */
    console.log("Core: Atualizando todos os dropdowns de categoria...");
    if (modalCategoryInput) updateCategoryDropdowns(modalCategoryInput, document.getElementById('modalType')?.value || 'expense', true); if (editCategoryInput) updateCategoryDropdowns(editCategoryInput, document.getElementById('editType')?.value || 'expense', true); const recurringCatSelect = document.querySelector('#recurringTxModal #recurringCategory'); const recurringTypeSelect = document.querySelector('#recurringTxModal #recurringType'); if (recurringCatSelect && recurringTypeSelect) updateCategoryDropdowns(recurringCatSelect, recurringTypeSelect.value || 'expense', true); if (document.getElementById('filterCategory2')) updateCategoryDropdowns(document.getElementById('filterCategory2'), 'filter');
}
// --- Fim UI Helpers ---

// --- Inicialização Principal ---
document.addEventListener('DOMContentLoaded', () => {
    function init() {
        console.log(`Gestor Financeiro: Inicializando Core v${config.APP_VERSION}`); // Usa config
        loadDataFromStorage();

        // Aplica tema e cor iniciais LIDOS do localStorage
        setThemeMode(themeModePreference); // Aplica modo (e define currentTheme)
        applyThemeColor(); // Aplica cor primária

        setupEventListeners(); // Configura todos os listeners core (inclui PIX)

        if (safeQuerySelector('.user-name')) safeQuerySelector('.user-name').textContent = userName;
        if (safeQuerySelector('.user-email')) safeQuerySelector('.user-email').textContent = userEmail;
        [modalDateInput, editDateInput, goalDateInput, scheduledDateInput].filter(Boolean).forEach(inp => { if (!inp.value) inp.value = getLocalDateString() });
        updateAllCategoryDropdowns();

        if (typeof Chart !== 'undefined' && Chart.register) {
            Chart.defaults.font.family = "'Poppins', sans-serif";
            updateChartDefaults(); // Aplica defaults iniciais baseados no tema carregado
            console.log("Core: Chart.js OK.");
        } else { console.error("ERRO CRÍTICO: Chart.js não carregado."); showAlert("Erro: Gráficos indisponíveis.", 'danger'); }

        let proInitialized = false; let businessInitialized = false;
        if (isProPlan) { try { console.log("Core: Init Pro..."); initProFeatures(); proInitialized = true; console.log("Core: Init Pro OK."); document.querySelectorAll('.pro-feature').forEach(el => { el.style.display = ''; if (el.tagName === 'BUTTON' || el.tagName === 'A') { el.classList.remove('disabled'); el.removeAttribute('disabled'); } }); } catch (e) { console.error("Erro Pro Init:", e); showAlert("Erro recursos Pro.", "danger"); isProPlan = false; document.querySelectorAll('.pro-feature').forEach(el => el.style.display = 'none'); } } else { document.querySelectorAll('.pro-feature').forEach(el => el.style.display = 'none'); console.log("Core: Pro não ativo."); }
        if (isBusinessPlan) { if (!proInitialized) { console.error("Core: Business requer Pro."); isBusinessPlan = false; } else { try { console.log("Core: Init Business..."); initBusinessFeatures(); businessInitialized = true; console.log("Core: Init Business OK."); document.querySelectorAll('.business-feature').forEach(el => { el.style.display = ''; if (el.tagName === 'BUTTON' || el.tagName === 'A') { el.classList.remove('disabled'); el.removeAttribute('disabled'); } }); } catch (e) { console.error("Erro Business Init:", e); showAlert("Erro recursos Business.", "danger"); isBusinessPlan = false; document.querySelectorAll('.business-feature').forEach(el => el.style.display = 'none'); } } }
        if (!isBusinessPlan) { document.querySelectorAll('.business-feature').forEach(el => el.style.display = 'none'); console.log("Core: Business não ativo."); }

        refreshAllUIComponents(); // Renderiza tudo com dados carregados
        checkScheduledPayments(); // Verifica pagamentos vencidos na carga
        checkReminders(); // Verifica lembretes vencidos na carga
        if (isBusinessPlan && typeof checkAllOverdueDebts === 'function') { checkAllOverdueDebts(); }
        if (isProPlan && typeof checkRecurringTransactions === 'function') { checkRecurringTransactions(); } // Verifica recorrentes na carga

        // Inicia timers de verificação periódica
        setInterval(checkScheduledPayments, 60 * 1000); // Verifica agendamentos a cada minuto
        if (reminderCheckIntervalId) clearInterval(reminderCheckIntervalId);
        reminderCheckIntervalId = setInterval(checkReminders, config.NOTE_REMINDER_CHECK_INTERVAL); // Usa config
        // Timer para recorrentes é iniciado em app-pro.js

        showSection('dashboard'); // Mostra dashboard inicial
        const activePlan = isBusinessPlan ? 'Business' : (isProPlan ? 'Pro' : 'Básico');
        console.log(`Gestor Financeiro: Pronto. Plano: ${activePlan}`);
    }
    init();
});

// --- Exportações Adicionais (se necessário para Pro/Business) ---
// Mantenha exportações existentes se houver ou adicione novas aqui
export {
    // Exemplo: se app-pro precisar de acesso direto a `transactions` (geralmente não recomendado)
    // transactions
};