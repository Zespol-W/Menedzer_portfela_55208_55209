const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { ensureAuthenticated } = require('../controllers/authController'); 

// Wszystkie trasy poniżej wymagają zalogowania
router.use(ensureAuthenticated);

// Lista: GET /categories
router.get('/', categoryController.renderCategoriesPage);

// Dodawanie: GET /categories/add i POST /categories/add
router.get('/add', categoryController.renderAddCategoryPage);
router.post('/add', categoryController.addCategory); // Zmienione z '/' na '/add'

// Edycja: GET /categories/edit/2 i POST /categories/edit/2
router.get('/edit/:id', categoryController.renderEditCategoryPage); // Zmienione z '/:id/edit'
router.post('/edit/:id', categoryController.updateCategory); // Zmienione z '/:id'

// Usuwanie: POST /categories/delete/2
// Używamy POST, bo zwykłe formularze HTML nie obsługują metody DELETE
router.post('/delete/:id', categoryController.deleteCategory); 

module.exports = router;