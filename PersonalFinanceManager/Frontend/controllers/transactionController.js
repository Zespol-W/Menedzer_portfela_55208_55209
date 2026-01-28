const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');

// 1. LISTA TRANSAKCJI
exports.renderTransactionsPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        const transactions = await Transaction.getAll(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);

        const categoryMap = new Map(categories.map(cat => [(cat.id || cat.Id || '').toString(), cat.name]));

        const formattedTransactions = transactions.map(t => ({
            ...t,
            id: t.id || t.Id,
            categoryName: categoryMap.get((t.categoryId || t.CategoryId || '').toString()) || 'Brak',
            formattedDate: new Date(t.date || t.Date).toLocaleDateString('pl-PL')
        }));

        res.render('transactions/index', {
            title: `Transakcje: ${account.name}`,
            account,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Błąd listy:', error.message);
        res.redirect('/accounts');
    }
};

// 2. FORMULARZ DODAWANIA (GET)
exports.renderAddTransactionPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);
        const userAccounts = await Account.getAll(req.session.token);
        res.render('transactions/add', { title: 'Dodaj', account, categories, userAccounts });
    } catch (error) {
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// 3. DODAWANIE (POST)
exports.addTransaction = async (req, res) => {
    const { accountId } = req.params;
    const { amount, description, category } = req.body;
    try {
        const transactionData = {
            name: description || "Nowa transakcja",
            amount: Math.abs(parseFloat(amount)),
            accountId: parseInt(accountId),
            categoryId: category ? parseInt(category) : null,
            date: new Date().toISOString()
        };
        await Transaction.add(accountId, transactionData, req.session.token);
        req.flash('success_msg', 'Dodano!');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd dodawania:', error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// 4. FORMULARZ EDYCJI (GET) - TUTAJ BYŁ BŁĄD (brakowało accountId)
exports.renderEditTransactionPage = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        // Przekazujemy 3 argumenty do modelu
        const transaction = await Transaction.getById(accountId, transactionId, req.session.token);
        const account = await Account.getById(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);

        res.render('transactions/edit', {
            title: 'Edytuj',
            transaction: { ...transaction, id: transaction.id || transaction.Id },
            account,
            categories
        });
    } catch (error) {
        console.error('Błąd wejścia w edycję:', error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// 5. AKTUALIZACJA (POST) - TUTAJ BYŁ BŁĄD (brakowało accountId)
exports.updateTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    const { amount, description, category } = req.body;
    try {
        const transactionData = {
            id: parseInt(transactionId),
            name: description || "Edycja",
            amount: Math.abs(parseFloat(amount)),
            accountId: parseInt(accountId),
            categoryId: category ? parseInt(category) : null,
            date: new Date().toISOString()
        };
        // Przekazujemy 4 argumenty do modelu
        await Transaction.update(accountId, transactionId, transactionData, req.session.token);
        req.flash('success_msg', 'Zaktualizowano!');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd aktualizacji:', error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// 6. USUWANIE (POST) - TUTAJ BYŁ BŁĄD (brakowało accountId)
exports.deleteTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        // Przekazujemy 3 argumenty do modelu
        await Transaction.delete(accountId, transactionId, req.session.token);
        req.flash('success_msg', 'Usunięto!');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd usuwania:', error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};