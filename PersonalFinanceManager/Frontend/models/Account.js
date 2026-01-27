const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;

class Account {
    // Pomocnicza mapa dla Enumów - upewnij się, że zgadza się z AccountType.cs
    static typeMapping = {
        'personal': 0,
        'savings': 1,
        'credit': 2
    };

    static async getAll(token) {
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching accounts:', error.response?.data || error.message);
            throw new Error('Nie udało się pobrać kont.');
        }
    }

    static async getById(id, token) {
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching account ${id}:`, error.response?.data || error.message);
            throw new Error(`Nie udało się pobrać konta o ID: ${id}.`);
        }
    }

    static async add(name, balance, currency, accountNumber, description, type, token) {
        try {
            // Mapujemy dane na format AccountDto.cs
            const accountDto = {
                Name: name,
                Balance: parseFloat(balance),
                CurrencyCode: currency, 
                Type: this.typeMapping[type] ?? 0,
                ShowInSummary: true,
                OwnerId: 0 // Zazwyczaj API bierze to z Claimów w tokenie, ale pole w DTO jest
            };

            const response = await axios.post(`${API_BASE_URL}/accounts`, accountDto, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding account:', error.response?.data || error.message);
            // Wyciągamy szczegółowy błąd z walidacji .NET jeśli istnieje
            const msg = error.response?.data?.title || 'Nie udało się dodać konta.';
            throw new Error(msg);
        }
    }

    static async update(id, name, balance, currency, accountNumber, description, type, token) {
        try {
            const accountDto = {
                Id: parseInt(id),
                Name: name,
                Balance: parseFloat(balance),
                CurrencyCode: currency,
                Type: this.typeMapping[type] ?? 0,
                ShowInSummary: true
            };

            const response = await axios.put(`${API_BASE_URL}/accounts/${id}`, accountDto, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating account ${id}:`, error.response?.data || error.message);
            throw new Error('Nie udało się zaktualizować konta.');
        }
    }

    static async delete(id, token) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/accounts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting account ${id}:`, error.response?.data || error.message);
            throw new Error('Nie udało się usunąć konta.');
        }
    }

    // Metody współdzielenia (Share) - tutaj musisz sprawdzić jak wyglądają DTO dla share w C#
    static async addSharedUser(accountId, sharedUserEmail, accessLevel, token) {
        try {
            // Zakładam, że API oczekuje nazw zgodnych z C# (np. Email, AccessLevel)
            const shareData = {
                Email: sharedUserEmail,
                AccessLevel: parseInt(accessLevel) || 0
            };

            const response = await axios.post(`${API_BASE_URL}/accounts/${accountId}/share`, shareData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error sharing account:', error.response?.data || error.message);
            throw new Error('Nie udało się udostępnić konta.');
        }
    }

    static async removeSharedUser(accountId, sharedUserId, token) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/accounts/${accountId}/share/${sharedUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error removing shared user:', error.response?.data || error.message);
            throw new Error('Nie udało się usunąć współdzielonego użytkownika.');
        }
    }

    static async updateSharedUserAccess(accountId, sharedUserId, newAccessLevel, token) {
        try {
            const response = await axios.put(`${API_BASE_URL}/accounts/${accountId}/share/${sharedUserId}`, {
                AccessLevel: parseInt(newAccessLevel)
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating access:', error.response?.data || error.message);
            throw new Error('Nie udało się zaktualizować dostępu.');
        }
    }
}

module.exports = Account;