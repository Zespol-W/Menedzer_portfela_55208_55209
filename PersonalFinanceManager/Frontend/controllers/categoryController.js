const Category = require('../models/Category');

// Wyświetlanie listy kategorii
exports.renderCategoriesPage = async (req, res) => {
    try {
        const categories = await Category.getAll(req.session.token);
        res.render('categories/index', {
            title: 'Kategorie Wydatków',
            categories: categories
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy kategorii:', error.message);
        req.flash('error_msg', 'Nie udało się pobrać kategorii.');
        res.redirect('/dashboard');
    }
};

// Renderowanie strony dodawania
exports.renderAddCategoryPage = (req, res) => {
    res.render('categories/add', {
        title: 'Dodaj Nową Kategorię'
    });
};

// Obsługa dodawania (POST)
exports.addCategory = async (req, res) => {
    const { name, description, color } = req.body; 

    if (!name) { 
        req.flash('error_msg', 'Nazwa kategorii jest wymagana.');
        return res.render('categories/add', {
            title: 'Dodaj Nową Kategorię',
            name, description, color
        });
    }

    try {
        // Zmienione: Przekazujemy obiekt, aby model mógł go łatwo wysłać do WebAPI
        const categoryData = { name, description, color: color || '#495057' };
        await Category.add(categoryData, req.session.token); 
        
        req.flash('success_msg', 'Kategoria została dodana!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Błąd podczas dodawania kategorii:', error.message);
        req.flash('error_msg', 'Błąd: ' + error.message);
        res.render('categories/add', {
            title: 'Dodaj Nową Kategorię',
            name, description, color
        });
    }
};

// Renderowanie strony edycji
exports.renderEditCategoryPage = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.getById(id, req.session.token);
        if (!category) {
            req.flash('error_msg', 'Kategoria nie została znaleziona.');
            return res.redirect('/categories');
        }
        res.render('categories/edit', {
            title: `Edytuj Kategorię: ${category.name}`,
            category: category
        });
    } catch (error) {
        console.error('Błąd ładowania edycji kategorii:', error.message);
        req.flash('error_msg', 'Nie udało się pobrać danych kategorii.');
        res.redirect('/categories');
    }
};

// Obsługa aktualizacji (POST)
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, color } = req.body; 

    if (!name) { 
        req.flash('error_msg', 'Nazwa kategorii jest wymagana.');
        return res.render('categories/edit', {
            title: `Edytuj Kategorię`, 
            // Używamy id zamiast _id dla spójności z widokiem
            category: { id, name, description, color }
        });
    }

    try {
        // Zmienione: Przekazujemy spójny obiekt danych
        const categoryData = { 
            id: parseInt(id), 
            name, 
            description, 
            color 
        };
        await Category.update(id, categoryData, req.session.token); 
        
        req.flash('success_msg', 'Kategoria została zaktualizowana!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Błąd aktualizacji kategorii:', error.message);
        req.flash('error_msg', 'Błąd aktualizacji: ' + error.message);
        res.render('categories/edit', {
            title: `Edytuj Kategorię`,
            category: { id, name, description, color }
        });
    }
};

// Usuwanie kategorii
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await Category.delete(id, req.session.token);
        req.flash('success_msg', 'Kategoria usunięta.');
        res.redirect('/categories');
    } catch (error) {
        console.error('Błąd podczas usuwania kategorii:', error.message);
        req.flash('error_msg', 'Nie można usunąć kategorii. Upewnij się, że nie jest przypisana do transakcji.');
        res.redirect('/categories');
    }
};