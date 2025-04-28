// =============================================================================
// Gestor Financeiro - app-config.js - v1.1.0
// Descrição: Contém configurações globais, constantes e dados estáticos
//            raramente modificados para o aplicativo Gestor Financeiro.
// =============================================================================

/**
 * @description Lista de categorias padrão para despesas e receitas.
 * Usado para inicializar a estrutura de categorias se não houver no localStorage.
 */
export const defaultCategories = {
    expense: [
        '-- MORADIA --', 'Aluguel', 'Condomínio', 'Financiamento Imobiliário', 'IPTU', 'Água', 'Energia', 'Gás', 'Internet & Celular', 'Manutenção Residencial', 'Casa & Decoração', 'Eletrodomésticos',
        '-- ALIMENTAÇÃO --', 'Mercado', 'Restaurantes & Lanches',
        '-- TRANSPORTE --', 'Transporte Público', 'Combustível', 'Aplicativos de Transporte', 'Manutenção Veículo', 'Seguro Veicular', 'Estacionamento & Pedágio',
        '-- DESPESAS PESSOAIS --', 'Salários', 'Vestuário & Calçados', 'Saúde', 'Plano de Saúde', 'Farmácia', 'Cuidados Pessoais', 'Educação', 'Academia & Clubes',
        '-- LAZER & ENTRETENIMENTO --', 'Lazer', 'Viagens', 'Livros, Música & Jogos',
        '-- SERVIÇOS & FINANCEIRO --', 'Faturas', 'Fatura do cartão', 'Assinaturas & Serviços', 'Empréstimos & Financiamentos', 'Tarifas Bancárias', 'Impostos', 'Seguros (outros)',
        '-- OUTROS --', 'Presentes (oferecidos)', 'Pet', 'Doações', 'Outras Despesas'
    ],
    income: [
        'Salário', '13º Salário', 'Bônus & PLR', 'Serviços / Freelance', 'Vendas & Comissões', 'Investimentos', 'Aluguel Recebido', 'Benefícios Sociais / Auxílios', 'Aposentadoria', 'Pensão', 'Presentes Recebidos', 'Reembolsos',
        '-- INTERNO --',
        'Pagamento Fatura Cartão', // Categoria interna para crédito em conta/cartão
        'Recebimentos Diversos',
        'Outras Receitas'
    ]
};

/**
 * @description Opções visíveis no dropdown de categoria para Pagamentos Agendados.
 */
export const scheduledPaymentVisibleCategories = [
    { value: '', text: '-- Selecione --' },
    { value: 'Faturas', text: 'Faturas (Geral)' },
    { value: 'Aluguel', text: 'Aluguel / Financiamento Imob.' },
    { value: 'Fatura do cartão', text: 'Fatura Cartão Crédito' }
    // Adicione outras categorias específicas de agendamento aqui, se necessário
];

/**
 * @description Mapeia a categoria selecionada no Agendamento para a categoria
 * da Transação gerada automaticamente (se forem diferentes).
 * Usado principalmente para agendamentos normais.
 * A categoria 'Fatura do cartão' tem tratamento especial na lógica de criação.
 */
export const scheduleToTransactionCategoryMap = {
    'Faturas': 'Faturas', // Agendamento 'Faturas' gera Tx 'Faturas'
    'Aluguel': 'Aluguel', // Agendamento 'Aluguel' gera Tx 'Aluguel'
    // Se uma categoria de agendamento não estiver aqui, a lógica tentará
    // usar a própria categoria do agendamento como categoria da transação.
};

/**
 * @description Mapeamento de nomes de categorias para classes de ícones Font Awesome.
 * Usado para exibir ícones nas listas de transações, agendamentos, etc.
 */
export const categoryIconMapping = {
    // Despesas
    'Aluguel': 'fas fa-file-contract', 'Condomínio': 'fas fa-building', 'Financiamento Imobiliário': 'fas fa-landmark', 'IPTU': 'fas fa-home', 'Água': 'fas fa-tint', 'Energia': 'fas fa-bolt', 'Gás': 'fas fa-burn', 'Internet & Celular': 'fas fa-wifi', 'Manutenção Residencial': 'fas fa-tools', 'Casa & Decoração': 'fas fa-couch', 'Eletrodomésticos': 'fas fa-plug',
    'Mercado': 'fas fa-shopping-basket', 'Restaurantes & Lanches': 'fas fa-utensils',
    'Transporte Público': 'fas fa-bus-alt', 'Combustível': 'fas fa-gas-pump', 'Aplicativos de Transporte': 'fas fa-taxi', 'Manutenção Veículo': 'fas fa-wrench', 'Seguro Veicular': 'fas fa-car-crash', 'Estacionamento & Pedágio': 'fas fa-parking',
    'Salários': 'fas fa-hand-holding-usd', // Pode ser despesa (funcionários) ou receita
    'Vestuário & Calçados': 'fas fa-tshirt', 'Saúde': 'fas fa-stethoscope', 'Plano de Saúde': 'fas fa-briefcase-medical', 'Farmácia': 'fas fa-pills', 'Cuidados Pessoais': 'fas fa-spa', 'Educação': 'fas fa-graduation-cap', 'Academia & Clubes': 'fas fa-dumbbell',
    'Lazer': 'fas fa-film', 'Viagens': 'fas fa-plane-departure', 'Livros, Música & Jogos': 'fas fa-book-open',
    'Faturas': 'fas fa-file-invoice', // Usado para pagamentos gerais e débito da fatura do cartão
    'Fatura do cartão': 'fas fa-credit-card', // Usado para agendamento específico, mas ícone de débito usa 'Faturas'
    'Assinaturas & Serviços': 'fas fa-sync-alt', 'Empréstimos & Financiamentos': 'fas fa-file-invoice-dollar', 'Tarifas Bancárias': 'fas fa-piggy-bank', 'Impostos': 'fas fa-landmark', 'Seguros (outros)': 'fas fa-shield-alt',
    'Presentes (oferecidos)': 'fas fa-gift', 'Pet': 'fas fa-paw', 'Doações': 'fas fa-hand-holding-heart', 'Outras Despesas': 'fas fa-question-circle',

    // Receitas
    'Salário': 'fas fa-money-bill-wave', // Pode ser receita (próprio)
    '13º Salário': 'fas fa-gifts', 'Bônus & PLR': 'fas fa-star', 'Serviços / Freelance': 'fas fa-briefcase', 'Vendas & Comissões': 'fas fa-tags', 'Investimentos': 'fas fa-chart-line', 'Aluguel Recebido': 'fas fa-key', 'Benefícios Sociais / Auxílios': 'fas fa-hands-helping', 'Aposentadoria': 'fas fa-user-clock', 'Pensão': 'fas fa-hand-holding-usd', // Pode ser receita (recebida)
    'Presentes Recebidos': 'fas fa-hand-holding-heart', 'Reembolsos': 'fas fa-undo-alt', 'Outras Receitas': 'fas fa-plus-circle',

    // Categorias Internas / Especiais (mapeadas em transações)
    'Pagamento Fatura Cartão': 'fas fa-receipt', // Ícone para a transação de *crédito* na conta/cartão (não visível normalmente)
    'Recebimentos Diversos': 'fas fa-handshake',

    // Ícone Padrão (se categoria não encontrada no mapeamento)
    'default': 'fas fa-question-circle'
};

/**
 * @description Mapeamento de Tipos de Metas para Nomes e Ícones.
 */
export const goalTypes = {
    travel: { name: 'Viagem', icon: 'fa-plane-departure' },
    electronics: { name: 'Eletrônicos', icon: 'fa-laptop' },
    education: { name: 'Educação', icon: 'fa-graduation-cap' },
    emergency: { name: 'Emergência', icon: 'fa-briefcase-medical' },
    home: { name: 'Casa', icon: 'fa-home' },
    car: { name: 'Carro', icon: 'fa-car' },
    debt: { name: 'Dívida', icon: 'fa-credit-card' },
    investment: { name: 'Investimento', icon: 'fa-piggy-bank' },
    other: { name: 'Outro', icon: 'fa-bullseye' }
};

/**
 * @description Cores e ícones para os métodos de pagamento.
 */
export const paymentMethodDetails = {
    pix: { text: 'Pix', icon: 'fas fa-qrcode', color: '#0dcaf0' },
    cash: { text: 'Dinheiro', icon: 'fas fa-money-bill-wave', color: '#fd7e14' },
    card: { text: 'Conta/C.', icon: 'fas fa-credit-card', color: '#6f42c1' },
    default: { text: 'N/D', icon: 'fas fa-question-circle', color: '#adb5bd' }
};

/**
 * @description Cores para os gráficos de Receita vs. Despesa.
 */
export const incomeExpenseChartColors = {
    income: 'rgba(25, 135, 84, 0.7)',   // Verde semi-transparente
    expense: 'rgba(220, 53, 69, 0.7)',   // Vermelho semi-transparente
    incomeBorder: 'rgb(25, 135, 84)',    // Verde sólido
    expenseBorder: 'rgb(220, 53, 69)'     // Vermelho sólido
};

// --- Constantes de Configuração de Comportamento ---

/** @description Período de tolerância em milissegundos para reverter pagamentos agendados (1 dia). */
export const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

/** @description Intervalo em milissegundos para verificar lembretes de notas (1 minuto). */
export const NOTE_REMINDER_CHECK_INTERVAL = 60 * 1000;

/** @description Marcador para item de checklist pendente em notas/tarefas. */
export const PENDING_CHECKLIST = '- ';

/** @description Marcador para item de checklist completo em notas/tarefas. */
export const COMPLETED_CHECKLIST = '+ ';

/** @description Limite de metas ativas simultâneas no plano básico. */
export const MAX_ACTIVE_GOALS_BASIC = 5;

/** @description Limite de pagamentos agendados (não pagos) no plano básico. */
export const MAX_SCHEDULED_ITEMS_BASIC = 10;

/** @description Intervalo em milissegundos para verificar transações recorrentes (5 minutos) - Usado por app-pro.js. */
export const RECURRING_CHECK_INTERVAL = 5 * 60 * 1000;

/** @description Versão atual da aplicação (para referência no backup). */
export const APP_VERSION = "1.9.21.4"; // Incrementado

// --- Chaves do LocalStorage ---
export const LS_KEY_TRANSACTIONS = 'transactions';
export const LS_KEY_GOALS = 'goals';
export const LS_KEY_UPCOMING_BILLS = 'upcomingBills';
export const LS_KEY_INITIAL_BALANCES = 'initialBalances';
export const LS_KEY_NOTES = 'notes';
export const LS_KEY_MONTHLY_BUDGET = 'monthlyBudget';
export const LS_KEY_CATEGORY_STRUCTURE = 'categoryStructure';
export const LS_KEY_RECURRING_TRANSACTIONS = 'recurringTransactions'; // PRO
export const LS_KEY_CATEGORY_BUDGETS = 'categoryBudgets'; // PRO
export const LS_KEY_ASSETS = 'assets'; // PRO
export const LS_KEY_LIABILITIES = 'liabilities'; // PRO
export const LS_KEY_USER_NAME = 'userName';
export const LS_KEY_USER_EMAIL = 'userEmail';
export const LS_KEY_CURRENCY = 'currency';
export const LS_KEY_THEME_COLOR = 'themeColor';
export const LS_KEY_THEME_MODE = 'themeModePreference';
export const LS_KEY_VALUES_HIDDEN = 'valuesHidden';
export const LS_KEY_HIDE_SCHEDULED_WARNING = 'hideScheduledPaymentWarning';
export const LS_KEY_COMPANY_SETTINGS = 'companySettings'; // BUSINESS
export const LS_KEY_CLIENTS = 'clients'; // BUSINESS
export const LS_KEY_PROJECTS = 'projects'; // BUSINESS
export const LS_KEY_INVOICES = 'invoices'; // BUSINESS
export const LS_KEY_EMPLOYEES = 'employees'; // BUSINESS
export const LS_KEY_DEBTORS = 'debtors'; // BUSINESS
export const LS_KEY_DEBTS = 'debts'; // BUSINESS