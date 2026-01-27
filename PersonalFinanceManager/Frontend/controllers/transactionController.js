const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');

exports.renderTransactionsPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        if (!account) {
            req.flash('error_msg', 'Konto nie znaleziono.');
            return res.redirect('/accounts');
        }

        const transactions = await Transaction.getAll(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);

        // Poprawka: cat.id zamiast cat._id
        const categoryMap = new Map(categories.map(cat => [(cat.id || cat._id).toString(), cat.name]));

        const formattedTransactions = transactions.map(t => ({
            ...t,
            // Poprawka: t.id zamiast t._id dla spójności w widoku
            id: t.id || t._id,
            categoryName: categoryMap.get((t.categoryId || t.category || '').toString()) || 'N/A',
            formattedDate: new Date(t.date).toLocaleDateString('pl-PL', {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        }));

        res.render('transactions/index', {
            title: `Transakcje dla konta: ${account.name}`,
            account: account,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy transakcji:', error.message);
        req.flash('error_msg', 'Nie udało się załadować transakcji.');
        res.redirect(`/accounts`);
    }
};

exports.renderAddTransactionPage = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.getById(accountId, req.session.token);
        const categories = await Category.getAll(req.session.token);
        const userAccounts = await Account.getAll(req.session.token);

        res.render('transactions/add', {
            title: `Dodaj Transakcję do konta: ${account.name}`,
            account: account,
            categories: categories,
            // Poprawka: acc.id zamiast acc._id
            userAccounts: userAccounts.filter(acc => (acc.id || acc._id).toString() !== accountId.toString()),
            type: 'expense',
            amount: '',
            description: '',
            category: ''
        });
    } catch (error) {
        res.redirect('/accounts');
    }
};

exports.addTransaction = async (req, res) => {
    const { accountId } = req.params;
    const { type, category, amount, description, senderAccountId, receiverAccountId } = req.body;

    try {
        const account = await Account.getById(accountId, req.session.token);
        
        let transactionData = {
            // Mapowanie na nazwy, które prawdopodobnie przyjmuje Twoje DTO w .NET
            accountId: parseInt(accountId), 
            type: type === 'income' ? 0 : (type === 'expense' ? 1 : 2), // Zamiana na Enum (0,1,2)
            amount: parseFloat(amount),
            currencyCode: account.currencyCode || account.currency,
            description: description,
            categoryId: category ? parseInt(category) : null,
            senderAccountId: senderAccountId ? parseInt(senderAccountId) : null,
            receiverAccountId: receiverAccountId ? parseInt(receiverAccountId) : null
        };

        await Transaction.add(accountId, transactionData, req.session.token); 
        req.flash('success_msg', 'Transakcja dodana!');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        req.flash('error_msg', 'Błąd zapisu: ' + error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

exports.deleteTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        // Upewniamy się, że używamy poprawnej nazwy ID
        await Transaction.delete(transactionId, req.session.token);
        req.flash('success_msg', 'Transakcja usunięta.');
        res.redirect(`/accounts/${accountId}/transactions`);
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect(`/accounts/${accountId}/transactions`);
    }
};

exports.renderEditTransactionPage = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        const transaction = await Transaction.getById(transactionId, req.session.token);
        const categories = await Transaction.getCategories(req.session.token);
        res.render('transactions/edit', { 
            transaction, 
            categories, 
            accountId,
            title: 'Edytuj transakcję' 
        });
    } catch (error) {
        console.error('Błąd renderowania edycji transakcji:', error.message);
        req.flash('error_msg', 'Nie udało się pobrać danych transakcji.');
        res.redirect(`/accounts/edit/${accountId}`);
    }
};

exports.updateTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        await Transaction.update(transactionId, req.body, req.session.token);
        req.flash('success_msg', 'Transakcja zaktualizowana.');
        res.redirect(`/accounts/edit/${accountId}`);
    } catch (error) {
        req.flash('error_msg', 'Błąd podczas aktualizacji: ' + error.message);
        res.redirect(`/accounts/edit/${accountId}`);
    }
};

exports.deleteTransaction = async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
        await Transaction.delete(transactionId, req.session.token);
        req.flash('success_msg', 'Transakcja usunięta.');
        res.redirect(`/accounts/edit/${accountId}`);
    } catch (error) {
        req.flash('error_msg', 'Błąd podczas usuwania: ' + error.message);
        res.redirect(`/accounts/edit/${accountId}`);
    }
};