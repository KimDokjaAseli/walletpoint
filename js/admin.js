/* Admin Dashboard Features */

class AdminController {
    static init() {
        console.log("Admin module initialized");
    }

    static async renderDashboard() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="stats-grid">
                    <div class="stat-card" style="background: linear-gradient(135deg, #6366f1, #818cf8); color: white;">
                        <span class="stat-label" style="color: rgba(255,255,255,0.8)">TOTAL PENGGUNA</span>
                        <div class="stat-value" id="stats-users">--</div>
                        <div class="stat-trend" id="stats-active-users" style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">-- Aktif</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #34d399); color: white;">
                        <span class="stat-label" style="color: rgba(255,255,255,0.8)">POIN BEREDAR</span>
                        <div class="stat-value" id="stats-circulation">--</div>
                        <div class="stat-trend" style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">💎 Emerald Total</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white;">
                        <span class="stat-label" style="color: rgba(255,255,255,0.8)">AKTIVITAS HARI INI</span>
                        <div class="stat-value" id="stats-today-txns">--</div>
                        <div class="stat-trend" style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">Transaksi Berhasil</div>
                    </div>
                </div>

                <div style="margin-top: 2.5rem;">
                    <div class="card" style="padding: 2rem;">
                        <h4 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            📊 Aliran Poin Hari Ini (Real-time)
                        </h4>
                        <div class="grid-2-col">
                            <div style="padding: 2.5rem; background: rgba(16, 185, 129, 0.05); border-radius: 20px; border: 1px dashed var(--success); text-align: center;">
                                <small style="color: var(--success); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Total Kredit (+)</small>
                                <div id="stats-today-credits" style="font-size: 3rem; font-weight: 800; color: var(--success); margin-top: 0.5rem;">--</div>
                            </div>
                            <div style="padding: 2.5rem; background: rgba(239, 68, 68, 0.05); border-radius: 20px; border: 1px dashed var(--error); text-align: center;">
                                <small style="color: var(--error); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Total Debit (-)</small>
                                <div id="stats-today-debits" style="font-size: 3rem; font-weight: 800; color: var(--error); margin-top: 0.5rem;">--</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-wrapper" style="margin-top: 2rem;">
                    <div class="table-header">
                        <h3 style="display: flex; align-items: center; gap: 0.5rem;">⚡ Transaksi Terakhir</h3>
                        <button class="btn btn-sm" onclick="AdminController.renderUsers('transactions')" style="background:var(--primary-bg); color:var(--primary);">Lihat Semua →</button>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="recentTxnTable">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Pengguna</th>
                                    <th>Tipe</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody><tr><td colspan="4" class="text-center">Memuat transaksi terbaru...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        // Use class name to be safe with context
        AdminController.loadDashboardStats();
        AdminController.loadRecentTransactions();
    }

    static async loadDashboardStats() {
        try {
            const res = await API.getAdminStats();
            // Standardise: res might be the whole JSON or result.data depending on wrapper
            const stats = res.data || res || {};

            const elUsers = document.getElementById('stats-users');
            const elActive = document.getElementById('stats-active-users');
            const elCirc = document.getElementById('stats-circulation');
            const elToday = document.getElementById('stats-today-txns');
            const elCredits = document.getElementById('stats-today-credits');
            const elDebits = document.getElementById('stats-today-debits');

            if (elUsers) elUsers.textContent = (stats.total_users ?? 0).toLocaleString();
            if (elActive) elActive.textContent = `${(stats.active_users ?? 0).toLocaleString()} Aktif`;
            if (elCirc) elCirc.textContent = (stats.circulation_points ?? 0).toLocaleString();
            if (elToday) elToday.textContent = (stats.today_transactions ?? 0).toLocaleString();
            if (elCredits) elCredits.textContent = `+${(stats.today_credits ?? 0).toLocaleString()}`;
            if (elDebits) elDebits.textContent = `-${(stats.today_debits ?? 0).toLocaleString()}`;

            // Add extra stats
            const extraStatsHtml = `
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div class="card" style="padding:1.5rem; text-align:center;">
                        <h4 style="margin:0; color:var(--text-muted);">Total Produk</h4>
                        <div style="font-size:2rem; font-weight:800; color:var(--text-main);">${(stats.total_products || 0)}</div>
                    </div>
                    <div class="card" style="padding:1.5rem; text-align:center;">
                        <h4 style="margin:0; color:var(--text-muted);">Total Misi</h4>
                        <div style="font-size:2rem; font-weight:800; color:var(--text-main);">${(stats.total_missions || 0)}</div>
                    </div>
                    <div class="card" style="padding:1.5rem; text-align:center;">
                        <h4 style="margin:0; color:var(--text-muted);">Menunggu Review</h4>
                        <div style="font-size:2rem; font-weight:800; color:${stats.pending_submissions > 0 ? 'var(--warning)' : 'var(--success)'};">${(stats.pending_submissions || 0)}</div>
                    </div>
                </div>
            `;
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid && !document.getElementById('extra-stats-container')) {
                const container = document.createElement('div');
                container.id = 'extra-stats-container';
                container.style.gridColumn = "1 / -1";
                container.innerHTML = extraStatsHtml;
                statsGrid.parentNode.insertBefore(container, statsGrid.nextSibling);
            }

        } catch (e) {
            console.error("Failed to load admin dashboard stats", e);
        }
    }

    static async loadRecentTransactions() {
        try {
            const result = await API.getAllTransactions({ limit: 5 });
            const data = result.data || result || {};
            const txns = data.transactions || [];
            const tbody = document.querySelector('#recentTxnTable tbody');

            if (!tbody) return;

            if (txns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Belum ada transaksi sistem.</td></tr>';
                return;
            }

            tbody.innerHTML = txns.map(t => `
                <tr>
                    <td data-label="Waktu"><small>${new Date(t.created_at).toLocaleTimeString()}</small></td>
                    <td data-label="User"><strong>${t.user_name || 'System'}</strong></td>
                    <td data-label="Tipe"><span class="badge" style="background:var(--bg-main); color:var(--text-muted); font-size:0.7rem; font-weight:700;">${(t.type || 'N/A').toUpperCase()}</span></td>
                    <td data-label="Jumlah" style="font-weight: 800; color: ${t.direction === 'credit' ? 'var(--success)' : 'var(--error)'}">
                        ${t.direction === 'credit' ? '↑' : '↓'} ${(t.amount || 0).toLocaleString()}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            console.error("Failed to load recent transactions", e);
        }
    }

    // ==========================
    // MODULE: DATA PENGGUNA (Integrated)
    // ==========================
    static async renderUsers(activeTab = 'accounts') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="tab-header" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
                    <button class="tab-btn ${activeTab === 'accounts' ? 'active' : ''}" onclick="AdminController.renderUsers('accounts')">Daftar Akun</button>
                    <button class="tab-btn ${activeTab === 'wallets' ? 'active' : ''}" onclick="AdminController.renderUsers('wallets')">Manajemen Dompet</button>
                    <button class="tab-btn ${activeTab === 'transactions' ? 'active' : ''}" onclick="AdminController.renderUsers('transactions')">Log Transaksi</button>
                    <button class="tab-btn ${activeTab === 'transfers' ? 'active' : ''}" onclick="AdminController.renderUsers('transfers')">Riwayat P2P</button>
                </div>
                <div id="tabContent"></div>
            </div>
            <style>
                .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 8px; transition: 0.3s; }
                .tab-btn.active { background: var(--primary-bg); color: var(--primary); }
                .tab-btn:hover:not(.active) { background: #f8fafc; color: var(--text-main); }
            </style>
        `;

        if (activeTab === 'accounts') await this.renderUserAccounts();
        else if (activeTab === 'wallets') await this.renderWallets();
        else if (activeTab === 'transactions') await this.renderTransactions();
        else if (activeTab === 'transfers') await this.renderTransfers();
    }

    static async renderUserAccounts() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Daftar Akun Pengguna</h3>
                    <button class="btn btn-primary" onclick="AdminController.showAddUserModal()">+ Tambah Pengguna</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>NIM/NIP</th>
                                <th>Peran</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="6" class="text-center">Memuat...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getUsers({ limit: 100 });
            const users = result.data.users || [];
            const tbody = document.querySelector('#usersTable tbody');

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada pengguna ditemukan.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td data-label="Nama"><strong>${user.full_name}</strong></td>
                    <td data-label="Email">${user.email}</td>
                    <td data-label="NIM/NIP"><code>${user.nim_nip}</code></td>
                    <td data-label="Peran"><span class="badge badge-info">${user.role}</span></td>
                    <td data-label="Status"><span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}">${user.status}</span></td>
                    <td data-label="Aksi" class="text-right">
                        <button class="btn-icon" onclick="AdminController.showEditUserModal(${user.id})" title="Edit Pengguna">✏️</button>
                        <button class="btn-icon" onclick="AdminController.resetPassword(${user.id})" title="Reset Password">🔑</button>
                        ${user.status === 'active'
                    ? `<button class="btn-icon" style="color:var(--error)" onclick="AdminController.toggleUserStatus(${user.id}, 'inactive')">🚫</button>`
                    : `<button class="btn-icon" style="color:var(--success)" onclick="AdminController.toggleUserStatus(${user.id}, 'active')">✅</button>`
                }
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderWallets() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Status & Penyesuaian Dompet</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="walletsTable">
                        <thead>
                            <tr>
                                <th>Akun</th>
                                <th>Peran</th>
                                <th>Saldo Emerald</th>
                                <th>Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="4" class="text-center">Memuat Dompet...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getWallets({ limit: 100 });
            const wallets = result.data || [];
            const tbody = document.querySelector('#walletsTable tbody');

            tbody.innerHTML = wallets.map(w => `
                <tr>
                    <td data-label="Akun">
                        <strong>${w.full_name}</strong><br>
                        <small style="color: var(--text-muted)">${w.email}</small>
                    </td>
                    <td data-label="Peran"><span class="badge badge-info">${w.role}</span></td>
                    <td data-label="Saldo" style="font-size: 1.1em; font-weight: 800; color: var(--primary)">${w.balance.toLocaleString()} pts</td>
                    <td data-label="Aksi" class="text-right">
                        <button class="btn btn-primary btn-sm" onclick="AdminController.showAdjustModal(${w.wallet_id}, '${w.full_name}')">Ajust</button>
                        <button class="btn btn-sm btn-block" style="background: var(--bg-main); color: var(--error); margin-top: 5px;" onclick="AdminController.showResetModal(${w.wallet_id}, '${w.full_name}')">Reset</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderTransactions() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Semua Transaksi Sistem</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="txnTable">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Pengguna</th>
                                <th>Tipe</th>
                                <th>Jumlah</th>
                                <th>Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Memuat Log...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getAllTransactions({ limit: 50 });
            const txns = result.data.transactions || [];
            const tbody = document.querySelector('#txnTable tbody');

            tbody.innerHTML = txns.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.user_name}</strong></td>
                    <td><span class="badge badge-info">${t.type}</span></td>
                    <td style="font-weight: 800; color: ${t.direction === 'credit' ? 'var(--success)' : 'var(--error)'}">
                        ${t.direction === 'credit' ? '+' : '-'} ${t.amount.toLocaleString()}
                    </td>
                    <td><small>${t.description}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderTransfers() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Log Transfer Antar Pengguna</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="transfersTable">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Pengirim</th>
                                <th>Penerima</th>
                                <th>Jumlah</th>
                                <th>Catatan</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Memuat Transfer...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getAllTransfers({ limit: 50 });
            const items = result.data.transfers || [];
            const tbody = document.querySelector('#transfersTable tbody');

            tbody.innerHTML = items.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.sender_name}</strong></td>
                    <td><strong>${t.receiver_name}</strong></td>
                    <td style="font-weight: 800; color: var(--primary)">${t.amount.toLocaleString()} pts</td>
                    <td><small>${t.description || '-'}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // ==========================
    // MODULE: DATA PRODUK (Integrated)
    // ==========================
    static async renderProducts(activeTab = 'catalog') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="tab-header tabs-container" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
                    <button class="tab-btn ${activeTab === 'catalog' ? 'active' : ''}" onclick="AdminController.renderProducts('catalog')" style="white-space: nowrap;">Katalog Produk</button>
                    <button class="tab-btn ${activeTab === 'sales' ? 'active' : ''}" onclick="AdminController.renderProducts('sales')" style="white-space: nowrap;">Riwayat Penjualan</button>
                </div>
                <div id="tabContent"></div>
            </div>
        `;

        if (activeTab === 'catalog') await this.renderCatalog();
        else if (activeTab === 'sales') await this.renderSalesHistory();
    }

    static async renderCatalog() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-header" style="margin-bottom: 2rem;">
                <div>
                    <h3>Manajemen Inventaris Produk</h3>
                </div>
                <button class="btn btn-primary" onclick="AdminController.showProductModal()">+ Tambah Produk</button>
            </div>
            <div class="table-wrapper">
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="productsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Gambar</th>
                                <th>Nama Produk</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="7" class="text-center">Belum ada produk.</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getProducts({ limit: 100 });
            const products = result.data.products || [];
            const tbody = document.querySelector('#productsTable tbody');

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada produk.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>#${p.id}</td>
                    <td><div class="table-img" style="background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; border-radius: 8px;">📦</div></td>
                    <td>
                        <div style="font-weight: 600;">${p.name}</div>
                        <small style="color: var(--text-muted);">${p.category || 'Umum'}</small>
                    </td>
                    <td style="font-weight: 700; color: var(--primary);">${p.price.toLocaleString()}</td>
                    <td>${p.stock} unit</td>
                    <td>
                        <button class="btn btn-sm" onclick="AdminController.showProductModal(${p.id})" style="margin-right:0.5rem;">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="AdminController.deleteProduct(${p.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderSalesHistory() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Data Penjualan Marketplace</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="salesTable">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Pembeli</th>
                                <th>Produk</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="4" class="text-center">Memuat Penjualan...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getMarketplaceTransactions({ limit: 50 });
            const items = result.data.transactions || [];
            const tbody = document.querySelector('#salesTable tbody');

            tbody.innerHTML = items.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.user_name}</strong></td>
                    <td><strong>${t.product_name}</strong> (x${t.quantity})</td>
                    <td style="font-weight: 800; color: var(--success)">+${t.amount.toLocaleString()} pts</td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderAuditLogs() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem;">
                    <div><h2>Log Audit Keamanan</h2></div>
                    <button class="btn" style="background:white; border:1px solid var(--border);" onclick="AdminController.renderAuditLogs()">Segarkan 🔄</button>
                </div>
                <div class="table-wrapper">
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="auditTable">
                            <thead>
                                <tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Target</th><th>Detail</th></tr>
                            </thead>
                            <tbody><tr><td colspan="5" class="text-center">Memuat Log Audit...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        try {
            const result = await API.getAuditLogs({ limit: 50 });
            const logs = result.data.logs || [];
            const tbody = document.querySelector('#auditTable tbody');
            tbody.innerHTML = logs.map(log => `
                <tr>
                    <td><small>${new Date(log.created_at).toLocaleString()}</small></td>
                    <td><strong>${log.user_name || 'System'}</strong></td>
                    <td><span class="badge" style="background:#f1f5f9; color:var(--text-main);">${log.action}</span></td>
                    <td><code>${log.entity} #${log.entity_id}</code></td>
                    <td><small>${log.details}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // MODALS & HELPERS
    static async showAddUserModal() { AdminController.renderUserModal(null, 'Tambah Pengguna Baru'); }
    static async showEditUserModal(id) {
        try { const response = await API.request(`/admin/users/${id}`, 'GET'); AdminController.renderUserModal(response.data, 'Edit Pengguna'); } catch (e) { showToast(e.message, 'error'); }
    }
    static renderUserModal(user, title) {
        const isEdit = !!user;
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>${title}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="userForm" onsubmit="AdminController.handleUserSubmit(event, ${isEdit ? user.id : 'null'})">
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="full_name" value="${user?.full_name || ''}" required></div>
                            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div><label>Email</label><input type="email" name="email" value="${user?.email || ''}" required></div>
                                <div><label>NIM/NIP</label><input type="text" name="nim_nip" value="${user?.nim_nip || ''}" required></div>
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <select name="role">
                                    <option value="mahasiswa" ${user?.role === 'mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                                    <option value="dosen" ${user?.role === 'dosen' ? 'selected' : ''}>Dosen</option>
                                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                            ${!isEdit ? `<div class="form-group"><label>Password</label><input type="password" name="password" required minlength="6"></div>` : ''}
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Buat'}</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleUserSubmit(e, id) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            if (id) await API.updateUser(id, data); else await API.createUser(data);
            closeModal(); AdminController.renderUsers(); showToast(`Selesai`);
        } catch (e) { showToast(e.message, 'error'); }
    }
    static async toggleUserStatus(id, newStatus) {
        if (!confirm(`Ubah status?`)) return;
        try { await API.updateUser(id, { status: newStatus }); AdminController.renderUsers(); } catch (e) { showToast(e.message, 'error'); }
    }
    static async resetPassword(id) {
        const pw = prompt("Password baru:");
        if (pw) try { await API.resetUserPassword(id, pw); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }

    static showAdjustModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>⚖️ Sesuaikan: ${userName}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="adjustForm" onsubmit="AdminController.handleAdjust(event)">
                            <input type="hidden" name="wallet_id" value="${walletId}">
                            <div class="form-group"><label>Arah</label><select name="direction"><option value="credit">Tambah (+)</option><option value="debit">Kurang (-)</option></select></div>
                            <div class="form-group"><label>Jumlah</label><input type="number" name="amount" min="1" required></div>
                            <div class="form-group"><label>Alasan</label><textarea name="description" required></textarea></div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleAdjust(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.wallet_id = parseInt(data.wallet_id); data.amount = parseInt(data.amount);
        try { await API.adjustWalletPoints(data); closeModal(); AdminController.renderUsers('wallets'); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }

    static showResetModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>⚠️ Reset: ${userName}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="resetForm" onsubmit="AdminController.handleReset(event)">
                            <input type="hidden" name="wallet_id" value="${walletId}">
                            <div class="form-group"><label>Saldo Target</label><input type="number" name="new_balance" min="0" value="0" required></div>
                            <div class="form-group"><label>Justifikasi</label><input type="text" name="reason" required></div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-error" style="background:var(--error); color:white">RESET</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleReset(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.wallet_id = parseInt(data.wallet_id); data.new_balance = parseInt(data.new_balance);
        if (!confirm("Reset?")) return;
        try { await API.resetWallet(data); closeModal(); AdminController.renderUsers('wallets'); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }


    static async showProductModal(id = null) {
        let product = null;
        if (id) { try { const res = await API.request(`/admin/products/${id}`, 'GET'); product = res.data; } catch (e) { console.error(e); } }
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>${id ? '🛠️ Edit' : '🎁 Baru'}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="productForm" onsubmit="AdminController.handleProductSubmit(event, ${id})">
                            <div class="form-group"><label>Nama</label><input type="text" name="name" value="${product?.name || ''}" required></div>
                            <div class="form-group"><label>Deskripsi</label><textarea name="description">${product?.description || ''}</textarea></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group"><label>Harga</label><input type="number" name="price" value="${product?.price || ''}" required min="1"></div>
                                <div class="form-group"><label>Stok</label><input type="number" name="stock" value="${product?.stock || 0}" required min="0"></div>
                            </div>
                            <div class="form-group">
                                <label>Gambar Produk</label>
                                ${product?.image_url ?
                `<div style="margin-bottom:0.5rem;"><img src="${product.image_url.startsWith('http') ? product.image_url : `${CONFIG.BASE_URL}/${product.image_url.replace(/^\/+/, '')}`}" style="height:50px; border-radius:4px;"></div>`
                : ''}
                                <input type="file" name="image" accept="image/*">
                                <input type="hidden" name="image_url" value="${product?.image_url || ''}">
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem; display: block;">Unggah file gambar dari penyimpanan lokal.</small>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status">
                                    <option value="active" ${product?.status === 'active' ? 'selected' : ''}>Aktif</option>
                                    <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>Tidak Aktif</option>
                                </select>
                            </div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleProductSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const endpoint = id ? `/admin/products/${id}` : '/admin/products';
        const method = id ? 'PUT' : 'POST';

        try {
            await API.request(endpoint, method, formData);
            closeModal(); AdminController.renderProducts('catalog'); showToast("Selesai");
        } catch (e) { showToast(e.message, "error"); }
    }
    static async deleteProduct(id) {
        if (!confirm('Hapus?')) return;
        try { await API.deleteProduct(id); AdminController.renderProducts('catalog'); } catch (e) { showToast(e.message, 'error'); }
    }

}
