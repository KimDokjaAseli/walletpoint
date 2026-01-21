class API {
    static getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    static async login(email, password) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Pendaftaran gagal');
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    static async getProfile() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: API.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    API.logout();
                }
                throw new Error(data.message || 'Gagal mengambil profil');
            }

            return data;
        } catch (error) {
            console.error('Profile error:', error);
            throw error;
        }
    }

    static async updateProfile(data) {
        return API.request('/auth/profile', 'PUT', data);
    }

    static async updatePassword(data) {
        return API.request('/auth/password', 'PUT', data);
    }

    static async updatePin(data) {
        return API.request('/auth/pin', 'PUT', data);
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // ========================================
    // ADMIN: User Management
    // ========================================
    static async getUsers(params = {}) {
        return API.request('/admin/users', 'GET', null, params);
    }

    static async createUser(userData) {
        return API.request('/admin/users', 'POST', userData);
    }

    static async updateUser(id, userData) {
        return API.request(`/admin/users/${id}`, 'PUT', userData);
    }

    static async deleteUser(id) {
        return API.request(`/admin/users/${id}`, 'DELETE');
    }

    static async resetUserPassword(id, newPassword) {
        return API.request(`/admin/users/${id}/password`, 'PUT', { new_password: newPassword });
    }

    // ========================================
    // ADMIN: Wallet Management
    // ========================================
    static async getWallets(params = {}) {
        return API.request('/admin/wallets', 'GET', null, params);
    }

    static async getWalletTransactions(id, params = {}) {
        return API.request(`/admin/wallets/${id}/transactions`, 'GET', null, params);
    }

    static async adjustWalletPoints(data) {
        return API.request('/admin/wallet/adjustment', 'POST', data);
    }

    static async resetWallet(data) {
        return API.request('/admin/wallet/reset', 'POST', data);
    }

    static async getAllTransactions(params = {}) {
        return API.request('/admin/transactions', 'GET', null, params);
    }

    // ========================================
    // ADMIN: Marketplace
    // ========================================
    static async getProducts(params = {}) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
            return API.request('/admin/products', 'GET', null, params);
        }
        return API.request('/mahasiswa/marketplace/products', 'GET', null, params);
    }

    static async createProduct(productData) {
        return API.request('/admin/products', 'POST', productData);
    }

    static async updateProduct(id, productData) {
        return API.request(`/admin/products/${id}`, 'PUT', productData);
    }

    static async deleteProduct(id) {
        return API.request(`/admin/products/${id}`, 'DELETE');
    }

    static async getAuditLogs(params = {}) {
        return API.request('/admin/audit-logs', 'GET', null, params);
    }

    static async getAllTransfers(params = {}) {
        return API.request('/admin/transfers', 'GET', null, params);
    }

    static async getMarketplaceTransactions(params = {}) {
        return API.request('/admin/marketplace/transactions', 'GET', null, params);
    }

    static async getAdminStats() {
        return API.request('/admin/stats', 'GET');
    }

    // ========================================
    // ADMIN: External Integration
    // ========================================
    static async getExternalSources() {
        return API.request('/admin/external/sources', 'GET');
    }

    static async createExternalSource(data) {
        return API.request('/admin/external/sources', 'POST', data);
    }

    static async getMerchantStats() {
        return API.request('/merchant/stats', 'GET');
    }

    // ========================================
    // MAHASISWA: Transfers
    // ========================================
    static async createTransfer(data) {
        return API.request('/mahasiswa/transfer', 'POST', data);
    }

    static async lookupUser(id) {
        return API.request(`/mahasiswa/users/lookup`, 'GET', null, { id });
    }

    static async getMyTransfers(params = {}) {
        return API.request('/mahasiswa/transfer/history', 'GET', null, params);
    }

    // ========================================
    // DOSEN: Mission Management
    // ========================================
    static async getDosenMissions(params = {}) {
        return API.request('/dosen/missions', 'GET', null, params);
    }

    static async createMission(data) {
        return API.request('/dosen/missions', 'POST', data);
    }

    static async updateMission(id, data) {
        return API.request(`/dosen/missions/${id}`, 'PUT', data);
    }

    static async deleteMission(id) {
        return API.request(`/dosen/missions/${id}`, 'DELETE');
    }

    static async getDosenSubmissions(params = {}) {
        return API.request('/dosen/submissions', 'GET', null, params);
    }

    static async reviewSubmission(id, data) {
        return API.request(`/dosen/submissions/${id}/review`, 'POST', data);
    }

    static async getDosenStats() {
        return API.request('/dosen/stats', 'GET');
    }

    static async getStudents(params = {}) {
        return API.request('/dosen/students', 'GET', null, params);
    }

    static async rewardStudent(data) {
        return API.request('/dosen/reward', 'POST', data);
    }

    // ========================================
    // MAHASISWA & SHARED
    // ========================================
    static async getMissions(params = {}) {
        const user = JSON.parse(localStorage.getItem('user'));
        const prefix = user.role === 'dosen' ? '/dosen' : '/mahasiswa';
        return API.request(`${prefix}/missions`, 'GET', null, params);
    }

    static async getMissionByID(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        const prefix = user.role === 'dosen' ? '/dosen' : '/mahasiswa';
        return API.request(`${prefix}/missions/${id}`, 'GET');
    }

    static async submitMissionSubmission(data) {
        return API.request('/mahasiswa/missions/submit', 'POST', data);
    }

    static async getSubmissions(params = {}) {
        // Mahasiswa looking at history
        return API.request('/mahasiswa/submissions', 'GET', null, params);
    }

    static async getWallet(userId = null) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin' && userId) {
            return API.request(`/admin/wallets/${userId}`, 'GET');
        } else {
            // Mahasiswa or Dosen checking own wallet
            return API.request('/mahasiswa/wallet', 'GET');
        }
    }

    static async getTransactions(userId = null, params = {}) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin' && userId) {
            return API.request(`/admin/wallets/${userId}/transactions`, 'GET', null, params);
        } else {
            // Personal transactions
            return API.request('/mahasiswa/transactions', 'GET', null, params);
        }
    }

    static async purchaseProduct(data) {
        return API.request('/mahasiswa/marketplace/purchase', 'POST', data);
    }

    static async generatePaymentToken(data) {
        return API.request('/mahasiswa/payment/token', 'POST', data);
    }

    static async checkTokenStatus(token) {
        return API.request(`/payment/status/${token}`, 'GET');
    }

    static async executePayment(token, pin) {
        return API.request('/mahasiswa/payment/execute', 'POST', { token, pin });
    }

    static async syncExternalPoints(data) {
        return API.request('/mahasiswa/external/sync', 'POST', data);
    }

    // Overload getProducts to handle roles if needed, or create specific
    // Admin uses getProducts (line 119) -> /admin/products
    // Mahasiswa uses renderShop -> needs /mahasiswa/marketplace/products
    // Let's modify the admin one or add getShopProducts
    static async request(endpoint, method = 'GET', body = null, params = {}, isMultipart = false) {
        try {
            let url = `${CONFIG.API_BASE_URL}${endpoint}`;
            if (Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams(params);
                url += `?${searchParams.toString()}`;
            }

            const headers = API.getHeaders();
            let finalBody = body;

            if (body instanceof FormData) {
                // Remove Content-Type to let browser set boundary for multipart/form-data
                delete headers['Content-Type'];
            } else if (body) {
                finalBody = JSON.stringify(body);
            }

            const options = {
                method,
                headers,
            };

            if (finalBody) {
                options.body = finalBody;
            }

            const response = await fetch(url, options);

            // Safely parse JSON
            let data = {};
            const text = await response.text();
            try {
                if (text) data = JSON.parse(text);
            } catch (e) {
                console.warn("Failed to parse JSON response:", text.substring(0, 100));
                if (!response.ok) {
                    throw new Error(`Server Error (${response.status}): ${response.statusText}`);
                }
            }

            if (!response.ok) {
                if (response.status === 401) {
                    API.logout();
                }
                throw new Error(data.message || 'Permintaan gagal');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
}
