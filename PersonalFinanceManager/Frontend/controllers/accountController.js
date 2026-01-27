const Account = require('../models/Account');

exports.renderAccountsPage = async (req, res) => {
    try {
        const accounts = await Account.getAll(req.session.token);
        res.render('accounts/index', {
            title: 'Twoje Konta Bankowe',
            accounts: accounts
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy kont:', error.message);
        req.flash('error_msg', 'Nie udało się pobrać listy kont.');
        res.redirect('/dashboard'); 
    }
};

exports.renderAddAccountPage = (req, res) => {
    res.render('accounts/add', {
        title: 'Dodaj Nowe Konto',
        name: '',
        balance: 0,
        currency: 'PLN',
        accountNumber: '',
        description: '',
        type: 'personal'
    });
};

exports.addAccount = async (req, res) => {
    const { name, balance, currency, accountNumber, description, type } = req.body;

    if (!name || !balance || !currency) {
        req.flash('error_msg', 'Nazwa, saldo i waluta konta są wymagane.');
        return res.render('accounts/add', {
            title: 'Dodaj Nowe Konto',
            name, balance, currency, accountNumber, description, type
        });
    }

    try {
        // Upewnij się, że Account.add przyjmuje argumenty w tej kolejności
        await Account.add(name, balance, currency, accountNumber, description, type, req.session.token);
        req.flash('success_msg', 'Konto zostało dodane pomyślnie!');
        res.redirect('/accounts');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.render('accounts/add', {
            title: 'Dodaj Nowe Konto',
            name, balance, currency, accountNumber, description, type
        });
    }
};

exports.renderEditAccountPage = async (req, res) => {
    try {
        const account = await Account.getById(req.params.id, req.session.token);
        if (!account) {
            req.flash('error_msg', 'Konto nie znaleziono.');
            return res.redirect('/accounts');
        }
        res.render('accounts/edit', {
            title: `Edytuj Konto: ${account.name}`,
            account: account,
            // Używamy spójnego nazewnictwa pól (zgodnie z DTO)
            name: account.name,
            balance: account.balance,
            currency: account.currencyCode || account.currency,
            accountNumber: account.accountNumber,
            description: account.description,
            type: account.type
        });
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/accounts');
    }
};

exports.updateAccount = async (req, res) => {
    const { id } = req.params;
    const { name, balance, currency, accountNumber, description, type } = req.body;

    try {
        // Poprawka: id zamiast _id
        await Account.update(id, name, balance, currency, accountNumber, description, type, req.session.token);
        req.flash('success_msg', 'Konto zostało zaktualizowane!');
        res.redirect('/accounts');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.render('accounts/edit', {
            title: `Edytuj Konto`,
            account: { id, name, balance, currency, accountNumber, description, type },
            name, balance, currency, accountNumber, description, type
        });
    }
};

exports.renderShareAccountPage = async (req, res) => {
    try {
        const account = await Account.getById(req.params.id, req.session.token);
        
        // Pobieramy ID z sesji - upewnij się, że nazwa pola pasuje (id lub userId)
        const currentUserId = req.session.user ? req.session.user.id : null;

        res.render('accounts/share', { 
            account, 
            currentUserId, // przekazujemy to jawnie
            title: 'Udostępnij konto' 
        });
    } catch (error) {
        console.error('Błąd w renderShareAccountPage:', error.message);
        req.flash('error_msg', 'Nie udało się załadować strony udostępniania.');
        res.redirect('/accounts');
    }
};

exports.shareAccount = async (req, res) => {
    const { id } = req.params;
    const { email, accessLevel } = req.body;

    try {
        await Account.addSharedUser(id, email, accessLevel, req.session.token);
        req.flash('success_msg', `Konto zostało udostępnione użytkownikowi ${email}.`);
        res.redirect(`/accounts/edit/${id}`); 
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect(`/accounts/share/${id}`);
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await Account.delete(req.params.id, req.session.token);
        req.flash('success_msg', 'Konto usunięte.');
        res.redirect('/accounts');
    } catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/accounts');
    }
};

exports.removeSharedUser = async (req, res) => {
    const { accountId, sharedUserId } = req.params;
    try {
        await Account.removeSharedUser(accountId, sharedUserId, req.session.token);
        req.flash('success_msg', 'Użytkownik współdzielący konto został usunięty.');
        res.redirect(`/accounts/edit/${accountId}`);
    } catch (error) {
        console.error('Błąd podczas usuwania współdzielonego użytkownika:', error.message);
        req.flash('error_msg', error.message);
        res.redirect(`/accounts/edit/${accountId}`);
    }
};

exports.updateSharedUserAccess = async (req, res) => {
    const { accountId, sharedUserId } = req.params;
    const { accessLevel } = req.body;

    if (!accessLevel) {
        req.flash('error_msg', 'Poziom dostępu jest wymagany.');
        return res.redirect(`/accounts/edit/${accountId}`); 
    }

    try {
        await Account.updateSharedUserAccess(accountId, sharedUserId, accessLevel, req.session.token);
        req.flash('success_msg', 'Poziom dostępu użytkownika został zaktualizowany.');
        res.redirect(`/accounts/edit/${accountId}`);
    } catch (error) {
        console.error('Błąd podczas aktualizacji poziomu dostępu:', error.message);
        req.flash('error_msg', error.message);
        res.redirect(`/accounts/edit/${accountId}`);
    }
};