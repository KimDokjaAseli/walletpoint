document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch User Profile
        const response = await API.getProfile();
        const user = response.data;

        // Update UI with User Info
        updateUserProfile(user);

        // Initialize Navigation and View
        renderNavigation(user.role);
        handleNavigation('dashboard', user.role);

    } catch (error) {
        console.error('Dashboard Init Error:', error);
        // If profile fetch fails heavily, might redirect to login (handled in API.getProfile)
    }
});

function updateUserProfile(user) {
    const avatar = (user.full_name || user.email).charAt(0).toUpperCase();
    const miniAvatar = document.getElementById('userAvatarMini');
    if (miniAvatar) miniAvatar.textContent = avatar;

    // Fallback for any other avatar elements
    const mainAvatar = document.getElementById('userAvatar');
    if (mainAvatar) mainAvatar.textContent = avatar;

    const userName = document.getElementById('userName');
    if (userName) userName.textContent = user.full_name || user.email;
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function closeModal(e) {
    // Only close if clicking the actual overlay background, not elements inside it
    if (e && e.target !== e.currentTarget) return;
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function renderNavigation(role) {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;

    let items = [];

    // Navigation configuration with icons
    if (role === 'admin') {
        items.push(
            { label: 'Beranda', href: '#dashboard', icon: '🏠', active: true },
            { label: 'User', href: '#users', icon: '👥' },
            { label: 'Logs', href: '#audit-logs', icon: '📜' },
            { label: 'Profil', href: '#profile', icon: '👤' }
        );
    } else if (role === 'dosen') {
        items.push(
            { label: 'Beranda', href: '#dashboard', icon: '🏠', active: true },
            { label: 'Misi', href: '#missions', icon: '🎯' },
            { label: 'Market', href: '#products', icon: '🛍️' },
            { label: 'Profil', href: '#profile', icon: '👤' }
        );
    } else if (role === 'mahasiswa') {
        items.push(
            { label: 'Beranda', href: '#dashboard', icon: '🏠', active: true },
            { label: 'Misi', href: '#missions', icon: '🎯' },
            { label: 'Pindai', href: '#transfer-scan', icon: '📸' },
            { label: 'Pasar', href: '#shop', icon: '🛍️' },
            { label: 'Profil', href: '#profile', icon: '👤' }
        );
    } else if (role === 'merchant') {
        items.push(
            { label: 'Beranda', href: '#merchant-dashboard', icon: '🏠', active: true },
            { label: 'Pindai', href: '#merchant-scanner', icon: '📸' },
            { label: 'Profil', href: '#profile', icon: '👤' }
        );
    }

    nav.innerHTML = items.map(item => `
        <a href="${item.href}" class="bottom-nav-item ${item.active ? 'active' : ''}" data-target="${item.href.substring(1)}">
            <div class="nav-icon-bg">
                <span class="nav-icon">${item.icon}</span>
            </div>
            <span>${item.label}</span>
        </a>
    `).join('');

    // Add click listeners
    nav.querySelectorAll('.bottom-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            nav.querySelectorAll('.bottom-nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            handleNavigation(link.dataset.target, role);
        });
    });
}

function handleNavigation(target, role) {
    // Force close any open modals to prevent blurring issues
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const title = document.getElementById('pageTitle');
    title.textContent = target.charAt(0).toUpperCase() + target.slice(1).replace('-', ' ');

    if (role === 'admin') {
        switch (target) {
            case 'users':
                AdminController.renderUsers();
                break;
            case 'products':
                AdminController.renderProducts();
                break;
            case 'audit-logs':
                AdminController.renderAuditLogs();
                break;
            case 'dashboard':
                AdminController.renderDashboard();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                AdminController.renderDashboard();
                title.textContent = 'Dashboard Administrator';
        }
    } else if (role === 'dosen') {
        switch (target) {
            case 'dashboard':
                renderDashboard({ role: 'dosen' });
                break;
            case 'quizzes':
                DosenController.renderQuizzes();
                break;
            case 'missions':
                DosenController.renderMissions();
                break;
            case 'submissions':
                DosenController.renderSubmissions();
                break;
            case 'products':
                DosenController.renderProducts();
                break;
            case 'dosen-students':
                DosenController.renderStudents();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'dosen' });
                title.textContent = 'Ringkasan Dosen';
        }
    } else if (role === 'mahasiswa') {
        switch (target) {
            case 'dashboard':
                renderDashboard({ role: 'mahasiswa' });
                break;
            case 'missions':
                MahasiswaController.renderMissions();
                break;
            case 'shop':
                MahasiswaController.renderShop();
                break;
            case 'transfer-scan':
                MahasiswaController.renderTransferScanHub();
                break;
            // Legacy/Direct Link Fallbacks
            case 'transfer':
                MahasiswaController.renderTransferScanHub('transfer');
                break;
            case 'scan':
                MahasiswaController.renderTransferScanHub('scan');
                break;
            case 'history':
                MahasiswaController.renderLedger(); // Still accessible if linked from elsewhere
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'mahasiswa' });
                title.textContent = 'Dashboard Mahasiswa';
        }
    } else if (role === 'merchant') {
        switch (target) {
            case 'merchant-scanner':
                MerchantController.renderMerchantScanner();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'merchant' });
                title.textContent = 'Dashboard Kasir';
        }
    }
}

function renderDashboard(user) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');

    title.textContent = `Dashboard ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;

    if (user.role === 'admin') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Pengguna Sistem</span>
                    <div class="stat-value" id="stats-users">--</div>
                    <div class="stat-trend" style="color: var(--primary)">Total Terdaftar</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Total Transaksi</span>
                    <div class="stat-value" id="stats-txns">--</div>
                    <div class="stat-trend" style="color: var(--secondary)">Semua Acara</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <span class="stat-label">Status API</span>
                    <div class="stat-value" style="color: var(--success); font-size: 1.5rem; margin-top: 0.5rem;">SEHAT</div>
                    <div class="stat-trend">Koneksi Stabil</div>
                </div>
            </div>
            
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Akses Cepat</h3>
                </div>
                <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                    <p>Selamat datang di panel admin premium. Gunakan bilah sisi untuk menavigasi antar modul.</p>
                </div>
            </div>
        `;
        AdminController.loadDashboardStats();
    } else if (user.role === 'dosen') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Misi Saya</span>
                    <div class="stat-value" id="stats-missions">--</div>
                    <div class="stat-trend" style="color:rgba(255,255,255,0.8); font-weight: 600;">📚 Total tugas dibuat</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Ulasan Tertunda</span>
                    <div class="stat-value" id="stats-pending" style="color: #fbbf24;">--</div>
                    <div class="stat-trend" style="color:rgba(255,255,255,0.8); font-weight: 600;">⏳ Perlu segera diperiksa</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <span class="stat-label">Tugas Divalidasi</span>
                    <div class="stat-value" id="stats-validated">--</div>
                    <div class="stat-trend" style="color:rgba(255,255,255,0.8); font-weight: 600;">✅ Sudah diberikan poin</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 2rem; margin-top: 2rem;">
                <div class="table-wrapper">
                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>📥 Butuh Review Segera</h3>
                        <button class="btn btn-sm" onclick="handleNavigation('submissions', 'dosen')" style="background: var(--primary-bg); color: var(--primary); font-weight: 600;">Lihat Semua</button>
                    </div>
                    <div style="padding: 1rem;">
                        <div id="quickReviewList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Simple items or empty state -->
                            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                <span class="spinner"></span> Menarik pengiriman terbaru...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card fade-in" style="padding: 2rem; background: white; border: 1px solid var(--border); border-radius: 24px;">
                    <h3 style="margin-bottom: 1.5rem;">📊 Analisis Kelas</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span style="font-weight: 600;">Tingkat Kelulusan</span>
                                <span style="color: var(--success); font-weight: 700;">85%</span>
                            </div>
                            <div style="height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;">
                                <div style="width: 85%; height: 100%; background: var(--success);"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span style="font-weight: 600;">Keaktifan Kuis</span>
                                <span style="color: var(--primary); font-weight: 700;">92%</span>
                            </div>
                            <div style="height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;">
                                <div style="width: 92%; height: 100%; background: var(--primary);"></div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; font-size: 0.85rem; color: var(--text-muted);">
                            <strong>Insight:</strong> Mahasiswa paling aktif di hari Senin & Selasa. Waktu terbaik untuk merilis kuis baru!
                        </div>
                    </div>
                </div>
            </div>
        `;
        DosenController.loadDosenStats();
        loadDosenQuickReview();
    } else if (user.role === 'mahasiswa') {
        const time = new Date().getHours();
        const greeting = time < 12 ? 'Selamat Pagi' : time < 15 ? 'Selamat Siang' : time < 18 ? 'Selamat Sore' : 'Selamat Malam';

        content.innerHTML = `
            <div class="fade-in">
                <!-- HERO SECTION -->
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 24px; padding: 2.5rem; color: white; position: relative; overflow: hidden; margin-bottom: 2rem; box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);">
                    <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: 40px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 2; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="font-size: 1.1rem; opacity: 0.9; font-weight: 500;">👋 ${greeting},</div>
                            <h2 style="font-size: 2.5rem; font-weight: 800; margin: 0.2rem 0 1rem; letter-spacing: -0.02em;">${user.full_name || 'Mahasiswa'}</h2>
                            <div style="display: inline-flex; align-items: center; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: 12px; font-weight: 600;">
                                <span style="margin-right: 0.5rem;">💎</span> 
                                <span id="userBalance" style="font-size: 1.2rem;">...</span> 
                                <span style="font-size: 0.8rem; margin-left: 0.3rem; opacity: 0.8;">Emerald Pts</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">Misi Selesai</div>
                            <div style="font-size: 2rem; font-weight: 800;" id="stats-missions-done">--</div>
                        </div>
                    </div>
                </div>

                <!-- MAIN GRID -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    
                    <!-- LEFT COLUMN: ACTIONS & DISCOVERY -->
                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        
                        <!-- QUICK ACTIONS -->
                        <div>
                            <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                                🚀 Jalan Pintas
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div onclick="handleNavigation('transfer-scan', 'mahasiswa')" style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center;">
                                    <div style="width: 50px; height: 50px; background: #e0e7ff; color: #4338ca; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">📸</div>
                                    <div style="font-weight: 700; color: var(--text-main);">Scan & Transfer</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Bayar & Kirim Poin</div>
                                </div>

                                <div onclick="handleNavigation('shop', 'mahasiswa')" style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center;">
                                    <div style="width: 50px; height: 50px; background: #dcfce7; color: #15803d; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">🛍️</div>
                                    <div style="font-weight: 700; color: var(--text-main);">MarketPlace</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Jajan & Belanja</div>
                                </div>
                            </div>
                        </div>

                         <!-- MISSION HIGHLIGHT -->
                        <div class="card" style="padding: 0; overflow: hidden; border-radius: 24px; border: none; box-shadow: var(--shadow-md);">
                            <div style="background: #1e293b; padding: 1.5rem; color: white;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h3 style="margin: 0; color: #38bdf8;">🎯 Misi Tersedia</h3>
                                    <span class="badge" style="background: rgba(255,255,255,0.1); color: white;" id="stats-active-missions">-- Misi</span>
                                </div>
                                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.7;">Selesaikan tantangan untuk raih poin lebih banyak!</p>
                            </div>
                            <div style="padding: 1rem; background: white;">
                                <button class="btn btn-primary" onclick="handleNavigation('missions', 'mahasiswa')" style="width: 100%; border-radius: 12px; font-weight: 600; padding: 1rem;">
                                    Lihat Semua Misi →
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- RIGHT COLUMN: INFORMATION CENTER -->
                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        
                        <!-- ACADEMIC INFO WIDGET -->
                        <div class="card" style="padding: 2rem; border-radius: 24px; border: 1px solid var(--border); background: #fffcf0;">
                             <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: #d97706;">
                                📢 Papan Pengumuman
                            </h3>
                            <div id="campusInfoContainer" style="display: flex; flex-direction: column; gap: 1rem;">
                                <div class="spinner-sm"></div> Memuat info...
                            </div>
                        </div>

                        <!-- DAILY INSIGHT/TIP -->
                        <div class="card" style="padding: 2rem; border-radius: 24px; border: 1px solid var(--border); background: white;">
                            <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">💡 Wawasan Harian</h4>
                            <p id="dailyTip" style="font-size: 1.1rem; line-height: 1.6; color: var(--text-main); font-weight: 500; font-style: italic;">
                                "Memuat tips bijak..."
                            </p>
                        </div>
                        
                        <!-- LEDGER LINK (since Wallet page is removed from Nav) -->
                        <div onclick="handleNavigation('history', 'mahasiswa')" style="cursor: pointer; padding: 1rem; border-radius: 16px; background: #f8fafc; border: 1px dashed var(--text-muted); text-align: center; color: var(--text-muted); font-weight: 600; transition: 0.2s;">
                            📑 Buka Riwayat Transaksi (Buku Kas)
                        </div>

                    </div>
                </div>

                <div style="margin-top: 3rem; text-align: center; font-size: 0.85rem; color: var(--text-muted);">
                    WalletPoint v2.1 &bull; Pusat Kendali Mahasiswa
                </div>
            </div>
        `;
        loadStudentStats();
        loadCampusInfo();
        // Since loadCampusInfo styles might have been built for dark background in previous version, 
        // I might need to update loadCampusInfo template in next step if it looks bad.
        // But let's check loadCampusInfo implementation first.
    }

}

async function loadStudentStats() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const [walletRes, missionsRes, subsRes] = await Promise.all([
            API.getWallet(user.id),
            API.getMissions(),
            API.getSubmissions({ status: 'approved' })
        ]);

        if (document.getElementById('userBalance')) document.getElementById('userBalance').textContent = walletRes.data.balance.toLocaleString();
        if (document.getElementById('stats-missions-done')) document.getElementById('stats-missions-done').textContent = (subsRes.data.submissions || []).filter(s => s.student_id === user.id).length;
        if (document.getElementById('stats-active-missions')) document.getElementById('stats-active-missions').textContent = (missionsRes.data.missions || []).length;

        // Random Tip
        const tips = [
            "Selesaikan misi harian untuk poin bonus rutin!",
            "Cek MarketPlace secara berkala untuk promo terbatas.",
            "Gunakan fitur transfer untuk berbagi poin dengan teman kelompok.",
            "Misi Quiz memiliki tenggat waktu, jangan sampai terlewat!",
            "Pantau Buku Kas untuk memastikan seluruh saldo Anda aman."
        ];
        const tipElem = document.getElementById('dailyTip');
        if (tipElem) tipElem.textContent = tips[Math.floor(Math.random() * tips.length)];

    } catch (e) { console.error(e); }
}

async function loadCampusInfo() {
    try {
        const res = await API.getMissions();
        const missions = res.data.missions || [];
        const container = document.getElementById('campusInfoContainer');

        const events = missions.slice(0, 3);

        if (events.length === 0) {
            if (container) container.innerHTML = '<p style="opacity:0.7; font-size:0.9rem;">Belum ada info akademik terbaru.</p>';
            return;
        }

        if (container) {
            container.innerHTML = events.map(e => `
                <div style="background: white; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:0.25rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${e.title}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                        <span style="background: #f1f5f9; padding: 0.1rem 0.6rem; border-radius: 20px; color: var(--text-muted); font-weight: 500;">${e.type === 'quiz' ? '📝 Kuis' : '📅 Kegiatan'}</span>
                        <span style="color: var(--primary); font-weight: 700;">${e.points} Pts</span>
                    </div>
                </div>
            `).join('');
        }

    } catch (e) {
        const c = document.getElementById('campusInfoContainer');
        if (c) c.innerHTML = '<small style="color:rgba(255,255,255,0.5)">Gagal memuat info.</small>';
    }
}

async function loadDosenQuickReview() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await API.getDosenSubmissions({ status: 'pending', limit: 3, creator_id: user.id });
        const submissions = res.data.submissions || [];
        const container = document.getElementById('quickReviewList');
        if (!container) return;

        if (submissions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: #f8fafc; border-radius: 16px;">
                    <div>🎉</div>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem;">Semua tugas telah diperiksa!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">
                        ${s.student_name ? s.student_name.charAt(0) : 'S'}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${s.student_name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${s.mission_title}</div>
                    </div>
                </div>
                <button class="btn btn-sm" onclick="handleNavigation('submissions', 'dosen')" style="padding: 0.3rem 0.6rem; font-size: 0.7rem;">Cek</button>
            </div>
        `).join('');

    } catch (e) { console.error(e); }
}

// function toggleSidebar() {
//    // Obsolete in mobile-first design
// }
