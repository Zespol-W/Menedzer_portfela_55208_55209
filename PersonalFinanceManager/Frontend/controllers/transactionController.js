const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');

// Wyświetlanie listy transakcji dla konkretnego konta
exports.renderTransactionsPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        if (!account) {
            req.flash('error_msg', 'Konto nie zostało znalezione.');
            return res.redirect('/accounts');
        }

        const transactions = await Transaction.getAll(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);

        // Mapowanie kategorii dla łatwiejszego wyświetlania nazw w tabeli
        const categoryMap = new Map(categories.map(cat => [(cat.id || cat._id).toString(), cat.name]));

        const formattedTransactions = transactions.map(t => ({
            ...t,
            id: t.id || t._id,
            categoryName: categoryMap.get((t.categoryId || t.category || '').toString()) || 'Brak',
            formattedDate: new Date(t.date).toLocaleDateString('pl-PL', {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        }));

        res.render('transactions/index', {
            title: `Transakcje: ${account.name}`,
            account: account,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy transakcji:', error.message);
        req.flash('error_msg', 'Nie udało się załadować transakcji.');
        res.redirect('/accounts');
    }
};

// Renderowanie formularza dodawania nowej transakcji
exports.renderAddTransactionPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);
        const userAccounts = await Account.getAll(req.session.token);

        res.render('transactions/add', {
            title: `Dodaj Transakcję: ${account.name}`,
            account: account,
            categories: categories,
            userAccounts: userAccounts.filter(acc => (acc.id || acc._id).toString() !== accountId.toString()),
            type: 'expense',
            amount: '',
            description: '',
            category: ''
        });
    } catch (error) {
        console.error('Błąd renderowania strony dodawania:', error.message);
        res.redirect('/accounts');
    }
};

// Obsługa dodawania nowej transakcji (POST)
exports.addTransaction = async (req, res) => {
    const { accountId } = req.params;
    const { type, category, amount, description, senderAccountId, receiverAccountId } = req.body;

    try {
        const account = await Account.getById(accountId, req.session.token);
        
        const transactionData = {
            accountId: parseInt(accountId), 
            // Mapowanie na Enum w WebAPI: Income=0, Expense=1, Transfer=2
            type: type === 'income' ? 0 : (type === 'expense' ? 1 : 2), 
            amount: parseFloat(amount),
            currencyCode: account.currencyCode || account.currency,
            description: description || "",
            name: description || "Nowa transakcja", // Pole Name często wymagane przez API
            categoryId: category ? parseInt(category) : null,
            senderAccountId: senderAccountId ? parseInt(senderAccountId) : null,
            receiverAccountId: receiverAccountId ? parseInt(receiverAccountId) : null,
            date: new Date().toISOString()
        };

        await Transaction.add(accountId, transactionData, req.session.token); 
        req.flash('success_msg', 'Transakcja dodana pomyślnie!');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd zapisu transakcji:', error.response?.data || error.message);
        req.flash('error_msg', 'Nie udało się dodać transakcji. Sprawdź poprawność danych.');
        res.redirect(`/accounts/${accountId}/transactions/add`);
    }
};

// Renderowanie formularza edycji istniejącej transakcji
exports.renderEditTransactionPage = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        const transaction = await Transaction.getById(transactionId, req.session.token);
        const account = await Account.getById(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);
        const userAccounts = await Account.getAll(req.session.token);

        res.render('transactions/edit', { 
            transaction, 
            categories, 
            account,
            userAccounts,
            title: 'Edytuj transakcję' 
        });
    } catch (error) {
        console.error('Błąd renderowania edycji transakcji:', error.message);
        req.flash('error_msg', 'Nie udało się pobrać danych transakcji.');
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// Obsługa aktualizacji transakcji (POST/PUT)
exports.updateTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    const { type, category, amount, description } = req.body;

    try {
        const transactionData = {
            id: parseInt(transactionId),
            accountId: parseInt(accountId),
            type: type === 'income' ? 0 : (type === 'expense' ? 1 : 2),
            amount: parseFloat(amount),
            description: description || "",
            name: description || "Edytowana transakcja",
            categoryId: category ? parseInt(category) : null,
            date: new Date().toISOString()
        };

        await Transaction.update(transactionId, transactionData, req.session.token);
        req.flash('success_msg', 'Zmiany zostały zapisane.');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd aktualizacji transakcji:', error.response?.data || error.message);
        req.flash('error_msg', 'Błąd podczas aktualizacji transakcji.');
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

// Obsługa usuwania transakcji
exports.deleteTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        await Transaction.delete(transactionId, req.session.token);
        req.flash('success_msg', 'Transakcja została usunięta.');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        console.error('Błąd podczas usuwania:', error.message);
        req.flash('error_msg', 'Nie udało się usunąć transakcji.');
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};