const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;

class Category {
    static async getAll(token) {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error.response ? error.response.data : error.message);
            throw new Error(error.response?.data?.message || 'Nie udało się pobrać kategorii.');
        }
    }

    static async getById(id, token) {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching category with ID ${id}:`, error.response ? error.response.data : error.message);
            throw new Error(error.response?.data?.message || `Nie udało się pobrać kategorii o ID: ${id}.`);
        }
    }

    // Zmienione: Teraz przyjmuje obiekt categoryData i token
    static async add(categoryData, token) {
        try {
            const response = await axios.post(`${API_BASE_URL}/categories`, categoryData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding category:', error.response ? error.response.data : error.message);
            // Wyciągamy błąd prosto z WebAPI, żeby wiedzieć czy np. nazwa się powtarza
            const apiMessage = error.response?.data?.errors 
                ? JSON.stringify(error.response.data.errors) 
                : (error.response?.data?.message || 'Błąd serwera API');
            throw new Error(apiMessage);
        }
    }

    // Zmienione: Teraz przyjmuje id, obiekt categoryData i token
    static async update(id, categoryData, token) {
        try {
            const response = await axios.put(`${API_BASE_URL}/categories/${id}`, categoryData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating category with ID ${id}:`, error.response ? error.response.data : error.message);
            throw new Error(error.response?.data?.message || `Nie udało się zaktualizować kategorii.`);
        }
    }

    static async delete(id, token) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting category with ID ${id}:`, error.response ? error.response.data : error.message);
            throw new Error(error.response?.data?.message || `Nie udało się usunąć kategorii.`);
        }
    }
}

module.exports = Category;