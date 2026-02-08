/* Mahasiswa Dashboard Features */

class MahasiswaController {
    static init() {
        console.log("Mahasiswa module initialized");
    }

    // ==========================
    // MODULE: DISCOVERY HUB (Missions & Quizzes)
    // ==========================
    static async renderMissions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <!-- Modern Missions Header -->
                <div class="missions-header">
                    <div class="missions-hero">
                        <div class="missions-hero-content">
                            <h2>Lokakarya Misi</h2>
                            <p>Koordinasikan tugas dan penugasan untuk pengembangan siswa</p>
                        </div>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="filter-tabs tabs-container" style="margin-bottom: 2rem; background: #fff; padding: 0.5rem; border-radius: 12px; border: 1px solid var(--border); width: 100%; box-shadow: var(--shadow-sm);">
                    <button class="tab-btn active" onclick="MahasiswaController.filterMissions('all', this)" style="padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; background: var(--primary); color: white; white-space: nowrap; transition: 0.3s;">Semua Item</button>
                    <button class="tab-btn" onclick="MahasiswaController.filterMissions('quiz', this)" style="padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: transparent; color: var(--text-muted); white-space: nowrap; transition: 0.3s;">Kuis</button>
                    <button class="tab-btn" onclick="MahasiswaController.filterMissions('task', this)" style="padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: transparent; color: var(--text-muted); white-space: nowrap; transition: 0.3s;">Tugas</button>
                    <button class="tab-btn" onclick="MahasiswaController.filterMissions('history', this)" style="padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: transparent; color: var(--text-muted); white-space: nowrap; transition: 0.3s;">Riwayat & Status</button>
                </div>

                <!-- Missions Grid -->
                <div class="card-grid" id="missionsGrid">
                    <div class="text-center" style="grid-column: 1/-1; padding: 4rem;">Memuat peluang menarik...</div>
                </div>
            </div>
        `;

        await this.loadMissions();
    }

    static async loadMissions(filterType = 'all') {
        const grid = document.getElementById('missionsGrid');
        try {
            const [resMissions, resSubs] = await Promise.all([
                API.getMissions(),
                API.getSubmissions()
            ]);

            const missions = (resMissions.data?.missions || resMissions.missions || []);
            const submissions = (resSubs.data?.submissions || resSubs.submissions || []);

            // Map submissions by mission_id for easy lookup
            const subMap = {};
            submissions.forEach(s => {
                // If multiple submissions, take the latest one or the one that is approved
                if (!subMap[s.mission_id] || subMap[s.mission_id].status !== 'approved') {
                    subMap[s.mission_id] = s;
                }
            });

            grid.innerHTML = '';

            let filtered = [];

            if (filterType === 'history') {
                // Show all things user has submitted
                filtered = missions.filter(m => subMap[m.id]);
            } else {
                // Show available missions logic
                filtered = missions.filter(m => {
                    const sub = subMap[m.id];

                    // If approved, hide from available list (it's in history)
                    if (sub && sub.status === 'approved') return false;

                    // If pending, show it but mark as 'Pending'
                    // If rejected, show it and mark as 'Retry'

                    if (filterType === 'all') return true;
                    if (filterType === 'quiz') return m.type === 'quiz';
                    return m.type !== 'quiz';
                });
            }

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                        <div style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem;">${filterType === 'history' ? '📜' : '🌪️'}</div>
                        <h3 style="color: var(--text-muted);">${filterType === 'history' ? 'Belum ada riwayat' : 'Belum ada misi tersedia'}</h3>
                        <p style="opacity: 0.6;">${filterType === 'history' ? 'Kerjakan misi untuk melihat riwayat Anda' : 'Cek lagi nanti untuk misi baru!'}</p>
                    </div>
                `;
                return;
            }


            grid.innerHTML = filtered.map(m => {
                const sub = subMap[m.id];
                const isPending = sub && sub.status === 'pending';
                const isRejected = sub && sub.status === 'rejected';
                const isApproved = sub && sub.status === 'approved';

                // Determine status badge
                let statusBadge = '';
                if (isPending) {
                    statusBadge = '<span class="mission-status-badge pending">⏳ Pending</span>';
                } else if (isApproved) {
                    statusBadge = '<span class="mission-status-badge completed">✓ Selesai</span>';
                } else {
                    statusBadge = '<span class="mission-status-badge active">Aktif</span>';
                }

                return `
                <div class="mission-card fade-in-item">
                    <div class="mission-card-body">
                        <!-- row: MISI -->
                        <div class="mission-row">
                            <div class="mission-label">MISI</div>
                            <div class="mission-value" style="display: flex; align-items: center; gap: 0.75rem;">
                                <div class="mission-icon-box small" style="background: ${m.type === 'quiz' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)'};">
                                    ${m.type === 'quiz' ? '📝' : '✅'}
                                </div>
                                <div style="flex:1">
                                    <div class="mission-title">${m.title}</div>
                                    <div class="mission-subtitle">${m.description || 'Implementasikan Sorting Algorithm...'}</div>
                                </div>
                                ${isApproved ? '<div class="mission-check">✓</div>' : ''}
                            </div>
                        </div>

                        <!-- row: TIPE -->
                        <div class="mission-row">
                            <div class="mission-label">TIPE</div>
                            <div class="mission-value"><strong>${m.type === 'quiz' ? 'quiz' : 'task'}</strong></div>
                        </div>

                        <!-- row: REWARD -->
                        <div class="mission-row">
                            <div class="mission-label">REWARD</div>
                            <div class="mission-value" style="display: flex; align-items: center; gap: 0.35rem;">
                                <span style="font-size: 1.1rem;">💎</span>
                                <strong>${m.points}</strong>
                            </div>
                        </div>

                        <!-- row: TARGET -->
                        <div class="mission-row">
                            <div class="mission-label">TARGET</div>
                            <div class="mission-value"><strong>${m.deadline ? new Date(m.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).toUpperCase() : 'OPEN'}</strong></div>
                        </div>

                        <!-- row: STATUS -->
                        <div class="mission-row">
                            <div class="mission-label">STATUS</div>
                            <div class="mission-value">
                                ${statusBadge}
                            </div>
                        </div>

                        <!-- row: AKSI -->
                        <div class="mission-row no-border">
                            <div class="mission-label">AKSI</div>
                            <div class="mission-value" style="display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;">
                                <div class="action-buttons-group">
                                    <button class="btn-action-round secondary" onclick="alert('Statistik')">📊</button>
                                    <button class="btn-action-round secondary" onclick="${m.type === 'quiz' ? `MahasiswaController.takeQuiz(${m.id})` : `MahasiswaController.showSubmitModal(${m.id})`}">✏️</button>
                                    <button class="btn-action-round primary" onclick="MahasiswaController.showSubmitModal(${m.id})">🚀</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');


        } catch (e) {
            console.error(e);
            showToast("Gagal memuat Pusat Misi", "error");
        }
    }

    static filterMissions(type, btn) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = 'var(--text-muted)';
            b.style.boxShadow = 'none';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';
        btn.style.boxShadow = 'var(--shadow-md)';
        this.loadMissions(type);
    }

    // ==========================
    // MODULE: QUIZ ENGINE
    // ==========================
    static async takeQuiz(id) {
        try {
            const res = await API.getMissionByID(id);
            const mission = res.data; // Fixed structure

            if (!mission.questions || mission.questions.length === 0) {
                showToast("Kuis ini belum memiliki pertanyaan", "warning");
                return;
            }

            let currentQuestion = 0;
            const answers = [];

            const renderQuestion = () => {
                const q = mission.questions[currentQuestion];
                const modalBody = document.querySelector('#quizModalBody');

                modalBody.innerHTML = `
                    <div class="fade-in">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <span style="font-weight: 700; color: var(--primary); font-size: 0.9rem;">PERTANYAAN ${currentQuestion + 1} DARI ${mission.questions.length}</span>
                            <div style="height: 6px; width: 150px; background: #f1f5f9; border-radius: 3px; position: relative;">
                                <div style="position: absolute; left: 0; top: 0; height: 100%; background: var(--primary); border-radius: 3px; width: ${((currentQuestion + 1) / mission.questions.length) * 100}%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        
                        <h3 style="font-weight: 700; color: var(--text-main); margin-bottom: 2rem; line-height: 1.4;">${q.question}</h3>
                        
                        <div style="display: grid; gap: 1rem;">
                            ${(q.options || []).map((opt, i) => `
                                <div class="quiz-option" onclick="this.parentElement.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected')" 
                                     data-val="${opt}"
                                     style="padding: 1.25rem; background: white; border: 2px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: var(--text-muted);">
                                        ${String.fromCharCode(65 + i)}
                                    </div>
                                    ${opt}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            const modalHtml = `
                <div class="modal-overlay" id="quizModal">
                    <div class="modal-card" style="max-width: 650px; min-height: 500px; display: flex; flex-direction: column;">
                        <div class="modal-head" style="background: #fdfcfd; border-bottom: 1px solid var(--border); padding: 1rem 2rem;">
                            <h3 style="margin:0; font-size: 1.1rem; color: var(--text-main);">${mission.title}</h3>
                            <button class="btn-icon" onclick="MahasiswaController.confirmCloseQuiz()">×</button>
                        </div>
                        <div class="modal-body" id="quizModalBody" style="flex: 1; padding: 3rem 2rem;">
                            <!-- Dynamic Content -->
                        </div>
                        <div class="modal-foot" style="padding: 1.5rem 2rem; background: white;">
                            <button class="btn btn-primary" id="nextBtn" style="width: 100%; border-radius: 12px; padding: 1rem;">Pertanyaan Berikutnya</button>
                        </div>
                    </div>
                </div>
                <style>
                    .quiz-option:hover { border-color: var(--primary-light); background: rgba(99, 102, 241, 0.02); }
                    .quiz-option.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); color: var(--primary); }
                    .quiz-option.selected div { border-color: var(--primary); background: var(--primary); color: white; }
                </style>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            renderQuestion();

            document.getElementById('nextBtn').addEventListener('click', async () => {
                const selected = document.querySelector('.quiz-option.selected');
                if (!selected) {
                    showToast("Silakan pilih jawaban", "warning");
                    return;
                }

                answers.push({
                    question_id: mission.questions[currentQuestion].id,
                    answer: selected.dataset.val
                });

                if (currentQuestion < mission.questions.length - 1) {
                    currentQuestion++;
                    renderQuestion();
                    if (currentQuestion === mission.questions.length - 1) {
                        document.getElementById('nextBtn').textContent = 'Selesaikan Penilaian';
                    }
                } else {
                    // Submit Quiz
                    try {
                        document.getElementById('nextBtn').disabled = true;
                        document.getElementById('nextBtn').textContent = 'Menghitung Skor...';

                        const submitData = {
                            mission_id: id,
                            answers: answers
                        };

                        await API.submitMissionSubmission(submitData);
                        showToast("Kuis berhasil dikirim! Mengalihkan ke misi...");
                        document.getElementById('quizModal').remove();
                        MahasiswaController.renderMissions();
                    } catch (e) {
                        showToast(e.message, "error");
                        document.getElementById('nextBtn').disabled = false;
                        document.getElementById('nextBtn').textContent = 'Selesaikan Penilaian';
                    }
                }
            });

        } catch (e) {
            console.error(e);
            showToast("Gagal memulai kuis", "error");
        }
    }

    static confirmCloseQuiz() {
        if (confirm("Apakah Anda yakin ingin keluar? Kemajuan Anda tidak akan disimpan.")) {
            const m = document.getElementById('quizModal');
            if (m) m.remove();
        }
    }

    // ==========================
    // MODULE: MISSION SUBMISSION
    // ==========================
    static async showSubmitModal(id) {
        try {
            const res = await API.getMissionByID(id);
            const mission = res.data;

            const modalHtml = `
                <div class="modal-overlay" onclick="closeModal(event)">
                    <div class="modal-card" style="max-width: 600px;">
                        <div class="modal-head" style="background: var(--primary); color: white;">
                            <h3 style="margin:0;">🚀 Mulai Pengiriman</h3>
                            <button class="btn-icon" onclick="closeModal()" style="color:white;">×</button>
                        </div>
                        <div class="modal-body">
                            <div style="margin-bottom: 2rem; border-left: 3px solid var(--primary); padding-left: 1rem;">
                                <h4 style="margin:0;">${mission.title}</h4>
                                <p style="margin: 0.5rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">${mission.description || 'Tidak ada instruksi khusus yang diberikan.'}</p>
                            </div>

                            <form id="missionSubmitForm" onsubmit="MahasiswaController.handleMissionSubmission(event, ${mission.id})">
                                <div class="form-group">
                                    <label style="font-weight: 600;">Laporan / Jawaban Teks</label>
                                    <textarea name="content" required placeholder="Jelaskan hasil pekerjaan Anda di sini..." style="min-height: 120px; border-radius: 12px; border: 1px solid var(--border); padding: 1rem;"></textarea>
                                </div>
                                <div class="form-group" style="margin-bottom:0;">
                                    <label style="font-weight: 600;">Unggah Bukti File (Opsional)</label>
                                    <div style="border: 2px dashed var(--border); padding: 2rem; border-radius: 12px; text-align: center; background: #fafafa; position: relative; cursor: pointer;" 
                                         onclick="this.querySelector('input').click()">
                                        <input type="file" name="file" accept="image/*,.pdf" style="display: none;" onchange="this.parentElement.querySelector('p').textContent = this.files[0].name; this.parentElement.style.borderColor = 'var(--primary)';">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📁</div>
                                        <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">Klik untuk memilih file atau seret ke sini</p>
                                        <small style="color: #94a3b8; display: block; margin-top: 0.5rem;">Maksimal 10MB (PDF, JPG, PNG)</small>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-foot">
                            <div class="form-actions" style="display: flex; gap: 1rem;">
                                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex:1;">Batal</button>
                                <button type="submit" form="missionSubmitForm" class="btn btn-primary" style="flex:2;">🚀 Kirim Sekarang</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (e) {
            showToast("Failed to load mission details", "error");
        }
    }

    static async handleMissionSubmission(e, missionId) {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('mission_id', missionId);

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

            await API.submitMissionSubmission(formData);
            showToast("Misi berhasil dikirim! Hadiah menunggu peninjauan.", "success");
            closeModal();
            this.renderMissions();
        } catch (error) {
            console.error(error);
            showToast(error.message || "Gagal mengirim misi", "error");
            const submitBtn = e.target.querySelector('button[type="submit"]'); // Re-select button in case of error
            submitBtn.disabled = false;
            submitBtn.textContent = '🚀 Kirim Sekarang';
        }
    }

    // ==========================
    // MODULE: REWARDS STORE (Marketplace)
    // ==========================
    static async renderShop() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-weight: 700; color: var(--text-main);">Toko Hadiah</h2>
                        <p style="color: var(--text-muted);">Tukarkan poin Anda untuk item eksklusif dan voucher</p>
                    </div>
                    <div style="background: white; padding: 0.75rem 1.5rem; border-radius: 20px; box-shadow: var(--shadow-sm); display:flex; align-items:center; gap:0.75rem;">
                         <span style="font-size: 1.2rem;">🛡️</span>
                         <span style="font-weight: 700; color: var(--primary);" id="shopBalance">Loading...</span>
                    </div>
                </div>

                <div id="shopContent">
                    <div id="shopGrid" class="card-grid">
                        <div class="text-center" style="grid-column: 1/-1; padding: 4rem;">Memuat Data Toko...</div>
                    </div>
                </div>
            </div>
        `;

        try {
            // Load balance
            const user = JSON.parse(localStorage.getItem('user'));
            const walletRes = await API.getWallet(user.id);
            const balanceElem = document.getElementById('shopBalance');
            if (balanceElem) balanceElem.textContent = `${walletRes.data.balance.toLocaleString()} Pts`;

            this.loadCatalog();

        } catch (e) {
            console.error(e);
            showToast("Failed to initiate store", "error");
        }
    }

    static async loadCatalog() {
        const grid = document.getElementById('shopGrid');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const [productsRes, txRes] = await Promise.all([
                API.getProducts({ limit: 100 }),
                API.getTransactions(user.id) // Still fetch txns to check stock or limits if needed, but we don't hide purchased items anymore unless logic dictates
            ]);

            let products = (productsRes.data?.products || productsRes.products || []);
            // We can keep the logic to show purchased items as disabled or allow multiple purchases.
            // Requirement didn't specify to remove "Purchase: " filtering, but if inventory is gone, maybe we allow re-purchase?
            // "Fix the bug where product stock does not decrease after purchase" - this implies normal stock behavior.
            // Let's assume standard shop behavior: show stock.

            if (products.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-muted);">Toko saat ini kehabisan stok! 🎉</div>';
                return;
            }

            grid.innerHTML = products.map(p => `
                <div class="card product-card fade-in-item">
                    <div class="product-image-box">
                        ${p.image_url ?
                    `<img src="${p.image_url.startsWith('http') ? p.image_url : `${CONFIG.BASE_URL}/${p.image_url.replace(/^\/+/, '')}`}" class="product-img">`
                    : (p.category === 'vouchers' ? '🎟️' : (p.category === 'merchandise' ? '👕' : '🎁'))}
                        <div class="product-stock-badge" style="color: ${p.stock > 0 ? 'var(--success)' : 'var(--error)'};">
                            STOCK: ${p.stock}
                        </div>
                    </div>
                    <div class="product-details">
                        <h4 class="product-title">${p.name}</h4>
                        <p class="product-desc">${p.description}</p>
                        
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 0.3rem;">
                                    <span style="font-size: 1.1rem;">💎</span>
                                    <span style="font-weight: 800; color: var(--primary); font-size: 1.2rem;">${p.price.toLocaleString()}</span>
                                </div>
                                <div style="display:flex; gap:0.5rem;">
                                    <button class="btn-cart-add" 
                                            onclick="MahasiswaController.addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} title="Tambah ke Keranjang">
                                        🛒
                                    </button>
                                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem;" 
                                            onclick="MahasiswaController.purchaseProduct(${p.id}, '${p.name}', ${p.price})" ${p.stock <= 0 ? 'disabled' : ''}>
                                        ${p.stock <= 0 ? 'Habis' : 'Beli'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add Floating Cart Button
            const cartBtn = `
                <button class="floating-cart-btn" onclick="MahasiswaController.showCart()">
                    🛒
                    <span id="cartCountBadge" class="cart-badge-dot" style="opacity:0;">0</span>
                </button>
            `;
            const content = document.getElementById('mainContent');
            if (!document.getElementById('floatingCartBtn')) {
                const div = document.createElement('div');
                div.id = 'floatingCartBtn';
                div.innerHTML = cartBtn;
                content.appendChild(div);
                this.updateCartCount();
            }

        } catch (e) {
            grid.innerHTML = '<div style="grid-column:1/-1;">Gagal memuat produk</div>';
        }
    }

    static async updateCartCount() {
        try {
            const res = await API.request('/mahasiswa/marketplace/cart');
            const items = (res.data?.items || res.items || []);
            const badge = document.getElementById('cartCountBadge');
            if (badge) {
                badge.textContent = items.length;
                badge.style.opacity = items.length > 0 ? 1 : 0;
            }
        } catch (e) { }
    }

    static async addToCart(productId) {
        try {
            await API.request('/mahasiswa/marketplace/cart', 'POST', { product_id: productId, quantity: 1 });
            showToast("Produk ditambahkan ke keranjang");
            this.updateCartCount();
        } catch (e) {
            showToast(e.message, "error");
        }
    }

    static async showCart() {
        try {
            const res = await API.request('/mahasiswa/marketplace/cart');
            const items = (res.data?.items || res.items || []);

            const modalHtml = `
                <div class="modal-overlay" id="cartModal" onclick="closeModal(event)">
                    <div class="modal-card" style="max-width: 600px; height: 80vh; display: flex; flex-direction: column;">
                        <div class="modal-head">
                            <h3>🛒 Keranjang Belanja</h3>
                            <button class="btn-icon" onclick="closeModal()">×</button>
                        </div>
                        <div class="modal-body" style="flex:1; overflow-y:auto; padding: 1.5rem;">
                            ${items.length === 0 ? '<div style="text-align:center; padding:3rem; color:var(--text-muted);"><div style="font-size:3rem;">🛒</div>Keranjang kosong</div>' :
                    `<div style="display:flex; flex-direction:column; gap:1rem;">
                                    ${items.map(item => `
                                        <div style="display:flex; gap:1rem; align-items:center; border:1px solid var(--border); p:1rem; border-radius:12px; padding:1rem;">
                                            <div style="width:50px; height:50px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center;">🎁</div>
                                            <div style="flex:1;">
                                                <div style="font-weight:700;">${item.product_name}</div>
                                                <div style="color:var(--primary); font-weight:600;">💎 ${item.price.toLocaleString()} x ${item.quantity}</div>
                                            </div>
                                            <button onclick="MahasiswaController.removeFromCart(${item.id})" style="color:var(--error); background:none; border:none; padding:0.5rem; cursor:pointer;">🗑️</button>
                                        </div>
                                    `).join('')}
                                </div>`
                }
                        </div>
                        <div class="modal-foot" style="border-top:1px solid var(--border); padding:1.5rem;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:1rem; font-size:1.1rem; font-weight:700;">
                                <span>Total</span>
                                <span>💎 ${(items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                            </div>
                            <button class="btn btn-primary" style="width:100%; padding:1rem;" onclick="MahasiswaController.checkoutCart()" ${(!items || items.length === 0) ? 'disabled' : ''}>Checkout Sekarang</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (e) {
            showToast("Gagal memuat keranjang", "error");
        }
    }

    static async removeFromCart(itemId) {
        if (!confirm("Hapus item?")) return;
        try {
            await API.request(`/mahasiswa/marketplace/cart/${itemId}`, 'DELETE');
            // Refresh modal
            document.getElementById('cartModal').remove();
            this.showCart();
            this.updateCartCount();
        } catch (e) { showToast(e.message, "error"); }
    }

    static async checkoutCart() {
        // Implement Cart Checkout with PIN
        const res = await API.request('/mahasiswa/marketplace/cart');
        const items = (res.data?.items || res.items || []);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Show PIN modal specifically for Cart Checkout
        const modalHtml = `
            <div class="modal-overlay" id="cartCheckoutModal" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 400px;">
                    <div class="modal-head">
                        <h3 style="margin:0;">🔐 Konfirmasi Bayar</h3>
                        <button class="btn-icon" onclick="closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                         <div style="text-align:center; margin-bottom:1.5rem;">
                            <p style="color:var(--text-muted);">Total Pembayaran</p>
                            <h2 style="color:var(--primary); font-weight:800;">💎 ${total.toLocaleString()}</h2>
                         </div>
                         
                         <form id="cartPayForm" onsubmit="MahasiswaController.processCartCheckout(event)">
                            <div class="form-group" style="margin-bottom:0;">
                                <label style="text-align:center; display:block;">Masukkan PIN Keamanan</label>
                                <input type="password" name="pin" required maxlength="6" pattern="[0-9]{6}" inputmode="numeric" style="text-align:center; letter-spacing:0.5em; font-size:1.5rem; padding:0.8rem; border-radius:12px; border:2px solid var(--border);">
                            </div>
                         </form>
                    </div>
                    <div class="modal-foot">
                        <button type="submit" form="cartPayForm" class="btn btn-primary btn-block" style="padding:1.1rem; border-radius:14px; font-weight:800;">Bayar Sekarang 🚀</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async processCartCheckout(e) {
        e.preventDefault();
        const pin = new FormData(e.target).get('pin');
        try {
            await API.request('/mahasiswa/marketplace/cart/checkout', 'POST', { pin, payment_method: 'wallet' });
            showToast("Pembelian Berhasil!", "success");
            document.getElementById('cartCheckoutModal').remove();
            document.getElementById('cartModal').remove();
            this.updateCartCount();
            this.renderShop(); // Refresh stock
        } catch (e) {
            showToast(e.message, "error");
        }
    }

    static async purchaseProduct(id, name, price) {
        this.showCheckoutForm({ id, name, price });
    }

    static closePurchaseAndReload() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.remove();
        this.renderShop();
        loadStudentStats();
    }

    // ==========================
    // MODULE: MY LEDGER (History)
    // ==========================
    static async renderLedger() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="font-weight: 700; color: var(--text-main);">Dompet Saya</h2>
                        <p style="color: var(--text-muted);">Catatan kriptografi dari semua perolehan dan penukaran poin Anda</p>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="premium-table" id="ledgerTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Detail Transaksi</th>
                                <th>Jumlah</th>
                                <th>Saldo Setelah</th>
                                <th>Waktu</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Mendekripsi buku besar...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await API.getTransactions(user.id);
            const txns = res.data.transactions || [];
            const tbody = document.querySelector('#ledgerTable tbody');

            if (txns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada transaksi tercatat.</td></tr>';
                return;
            }

            tbody.innerHTML = txns.map(t => {
                const typeMap = {
                    'transfer_in': 'Masuk 📥',
                    'transfer_out': 'Keluar 📤',
                    'marketplace': 'Belanja 🛒',
                    'reward': 'Reward 🎁',
                    'topup': 'Top Up 💎',
                    'adjustment': 'Admin ⚖️',
                    'penalty': 'Sanksi ⚠️'
                };
                const friendlyType = typeMap[t.type] || t.type.replace('_', ' ').toUpperCase();
                const isPositive = t.type.includes('reward') || t.type.includes('topup') || t.type.includes('receive') || t.type === 'transfer_in' || t.direction === 'credit';

                return `
                <tr>
                    <td data-label="ID"><code style="font-size: 0.75rem; color: var(--text-muted);">#TX-${t.id}</code></td>
                    <td data-label="Detail">
                        <div style="font-weight: 700; color: var(--text-main);">${t.description}</div>
                        <span class="badge" style="background: var(--bg-main); color: var(--text-muted); padding: 2px 6px; font-size: 0.7rem;">${friendlyType}</span>
                    </td>
                    <td data-label="Jumlah">
                        <span style="font-weight: 800; color: ${isPositive ? 'var(--success)' : 'var(--error)'};">
                            ${isPositive ? '+' : '-'}${t.amount.toLocaleString()}
                        </span>
                    </td>
                    <td data-label="Saldo" style="font-weight: 700; color: var(--text-main);">${t.balance_after?.toLocaleString() || '-'}</td>
                    <td data-label="Waktu"><small>${new Date(t.created_at).toLocaleDateString()} ${new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
                </tr>
            `}).join('');
        } catch (e) {
            console.error(e);
            showToast("Gagal memuat riwayat", "error");
        }
    }



    // ==========================
    // MODULE: TRANSFER POINTS
    // ==========================
    // ==========================
    // MODULE: TRANSFER POINTS
    // ==========================
    static async renderTransfer() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h2 style="font-weight: 700; color: var(--text-main);">Transfer Rekan</h2>
                    <p style="color: var(--text-muted);">Kirim poin ke teman atau kelompok belajar Anda</p>
                </div>

                <!-- Balance Display (Always Visible) -->
                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 2rem; border-radius: 20px; color: white; margin-bottom: 2rem; text-align: center; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
                        <div style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; margin-bottom: 0.5rem;">Saldo Tersedia</div>
                        <div style="font-size: 3rem; font-weight: 800;" id="transferBalance">Loading...</div>
                </div>

                <!-- VIEW 1: MENU (Buttons + History) -->
                <div id="transferMenu">
                    <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                        <button class="btn btn-primary" style="padding: 1.5rem 3rem; border-radius: 50px; font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);" onclick="MahasiswaController.showTransferForm()">
                            <span>💸</span> Kirim Poin Baru
                        </button>
                    </div>

                    <div class="card" style="padding: 0; border: 1px solid var(--border); overflow: hidden; min-height: 400px; display: flex; flex-direction: column;">
                        <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); background: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="margin:0; color: var(--text-main);">Riwayat Transfer Terbaru</h4>
                            <button class="btn btn-sm" onclick="MahasiswaController.loadTransferHistory()" style="background: white; border: 1px solid var(--border);">Segarkan 🔄</button>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="premium-table" id="transferHistoryTable" style="margin:0;">
                                <thead>
                                    <tr>
                                        <th>Tipe</th>
                                        <th>Lawan Transaksi</th>
                                        <th>Jumlah</th>
                                        <th>Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="4" class="text-center" style="padding: 3rem;">Memuat riwayat...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VIEW 2: FORM (Hidden by default) -->
                <div id="transferFormContainer" style="display: none;">
                    <div class="card fade-in-item" style="padding: 2rem; border: 1px solid var(--border); max-width: 500px; margin: 0 auto; border-radius: 24px;">
                        <div style="margin-bottom: 2rem; text-align: center;">
                            <h3 style="margin-bottom:0.5rem;">Kirim Poin</h3>
                            <p style="color:var(--text-muted);">Lengkapi detail transfer di bawah ini</p>
                        </div>
                        
                        <form id="transferForm" onsubmit="MahasiswaController.handleTransferSubmit(event)">
                            <div class="form-group">
                                <label style="font-weight: 600;">Penerima</label>
                                <div style="position:relative;">
                                    <input type="number" name="receiver_id" id="receiverIdInput" placeholder="Masukkan ID Siswa / NIM" required style="border-radius: 12px; padding: 1rem; font-size: 1rem; width: 100%; box-sizing: border-box; border: 2px solid #e2e8f0;" oninput="MahasiswaController.checkReceiver(this.value)">
                                    <div id="receiverFeedback" style="margin-top: 0.5rem; font-size: 0.9rem; min-height: 1.2em; font-weight: 600;"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label style="font-weight: 600;">Jumlah (Poin)</label>
                                <input type="number" name="amount" min="1" placeholder="e.g. 50" required style="border-radius: 12px; font-weight: 700; color: var(--text-main); padding: 1rem; font-size: 1rem; width: 100%; box-sizing: border-box; border: 2px solid #e2e8f0;">
                            </div>

                            <div class="form-group">
                                <label style="font-weight: 600;">Pesan (Opsional)</label>
                                <textarea name="description" placeholder="Untuk proyek kelompok..." style="min-height: 100px; border-radius: 12px; padding: 1rem; width: 100%; box-sizing: border-box; border: 2px solid #e2e8f0;"></textarea>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
                                <button type="button" onclick="MahasiswaController.showTransferMenu()" class="btn" style="background: transparent; border: 1px solid var(--border); padding: 1rem; border-radius: 12px; font-weight: 600; color: var(--text-muted);">Batal</button>
                                <button type="submit" class="btn btn-primary" style="padding: 1rem; border-radius: 12px; font-weight: 700; background: linear-gradient(to right, #6366f1, #8b5cf6);">
                                    Konfirmasi 💸
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Initial Load
        this.loadTransferHistory();

        // Get Balance
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const wallet = await API.getWallet(user.id);
            document.getElementById('transferBalance').textContent = `${wallet.data.balance.toLocaleString()}`;
        } catch (e) { console.error(e); }
    }

    static showTransferMenu() {
        document.getElementById('transferMenu').style.display = 'block';
        document.getElementById('transferFormContainer').style.display = 'none';

        // Reset form
        const form = document.getElementById('transferForm');
        if (form) form.reset();
        const feedback = document.getElementById('receiverFeedback');
        if (feedback) feedback.innerHTML = '';
        this.currentRecipient = null;
    }

    static showTransferForm(receiverId = null) {
        document.getElementById('transferMenu').style.display = 'none';
        document.getElementById('transferFormContainer').style.display = 'block';

        if (receiverId) {
            const input = document.getElementById('receiverIdInput');
            if (input) {
                input.value = receiverId;
                this.checkReceiver(receiverId);
            }
        }
    }

    static checkReceiver(id) {
        const feedback = document.getElementById('receiverFeedback');
        const btn = document.querySelector('#transferForm button[type="submit"]');

        // Reset stored data
        this.currentRecipient = null;

        if (this.checkTimeout) clearTimeout(this.checkTimeout);

        if (!id) {
            feedback.innerHTML = '';
            if (btn) btn.disabled = false;
            return;
        }

        // Show searching state
        feedback.innerHTML = '<span style="color:var(--text-muted); display:flex; align-items:center; gap:0.5rem;"><span class="spinner" style="width:12px; height:12px; border-width:2px;"></span> Mencari pengguna...</span>';
        if (btn) btn.disabled = true;

        this.checkTimeout = setTimeout(async () => {
            try {
                const res = await API.lookupUser(id);
                const user = res.data;
                // Don't allow self-transfer
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (user.id == currentUser.id) {
                    feedback.innerHTML = `<span style="color:var(--error);">❌ Tidak dapat mengirim ke diri sendiri</span>`;
                    if (btn) btn.disabled = true;
                    return;
                }

                // Store valid user for submission display
                this.currentRecipient = user;

                feedback.innerHTML = `<span style="color:var(--success);">✅ Penerima: <b>${user.full_name}</b> <small>(${user.role})</small></span>`;
                if (btn) btn.disabled = false;
            } catch (e) {
                feedback.innerHTML = `<span style="color:var(--error);">❌ Pengguna tidak ditemukan</span>`;
                if (btn) btn.disabled = true;
            }
        }, 500);
    }

    static async handleTransferSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.amount = parseInt(data.amount);
        data.receiver_user_id = parseInt(data.receiver_id);
        delete data.receiver_id;

        const btn = e.target.querySelector('button[type="submit"]');

        // Get name from stored check or fallback to ID
        const recipientName = this.currentRecipient ? this.currentRecipient.full_name : `ID: ${data.receiver_user_id}`;

        try {
            btn.textContent = 'Memverifikasi Transaksi...';
            btn.disabled = true;

            const res = await API.request('/mahasiswa/transfer', 'POST', data);

            // Success Receipt Modal
            const receiptHtml = `
            <div class="modal-overlay" id="transferReceiptModal">
                <div class="modal-card" style="max-width: 450px; text-align: center; padding: 2rem; border-top: 8px solid var(--success);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🛰️</div>
                    <h3 style="color: var(--success); margin-bottom: 0.5rem;">Transmisi Berhasil</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Transfer P2P sebesar <b>${data.amount.toLocaleString()} Poin</b> telah dikonfirmasi dan dicatat di buku besar.</p>
                    
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; text-align: left; font-family: monospace; font-size: 0.85rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>PENERIMA:</span>
                            <span style="font-weight: 700; text-transform: uppercase;">${recipientName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>HASH ID:</span>
                            <span style="font-weight: 700;">${Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                        </div>
                    </div>

                    <button class="btn btn-primary" onclick="document.getElementById('transferReceiptModal').remove(); MahasiswaController.renderTransfer();" style="width: 100%; padding: 1rem; border-radius: 12px; font-weight: 700;">
                        Kembali ke Dompet
                    </button>
                </div>
            </div>
        `;
            document.body.insertAdjacentHTML('beforeend', receiptHtml);
            e.target.reset();

        } catch (error) {
            showToast(error.message || "Transfer gagal", "error");
            btn.textContent = 'Konfirmasi Transfer 💸';
            btn.disabled = false;
        }
    }




    static async syncExternalPoints() {
        try {
            const btn = document.querySelector('button[onclick*="syncExternalPoints"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner"></span> Sinkronisasi...';
            }

            // We use the default source for now or specific if needed
            // API payload for sync: { source_id: 1, external_user_id: "..." }
            // But let's assume the backend automatically knows based on user mapping

            await API.request('/mahasiswa/external/sync', 'POST', {
                source_id: 1 // Default to first source for demo
            });

            showToast("Klaim poin eksternal berhasil! Saldo diperbarui.", "success");

            // Reload views
            this.renderLedger();
            loadStudentStats();

        } catch (e) {
            showToast("Gagal sinkronisasi: " + e.message, "error");
        } finally {
            const btn = document.querySelector('button[onclick*="syncExternalPoints"]');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>🔄</span> Sinkronisasi Poin Luar';
            }
        }
    }


    static async loadTransferHistory() {
        const tbody = document.querySelector('#transferHistoryTable tbody');
        try {
            // Fetch both transfers and user wallet to identify self
            const user = JSON.parse(localStorage.getItem('user'));
            const [transfersRes, walletRes] = await Promise.all([
                API.request('/mahasiswa/transfer/history', 'GET'),
                API.getWallet(user.id) // Ensure we have the wallet ID
            ]);

            const transfers = transfersRes.data.transfers || [];
            const myWalletId = walletRes.data.id;

            if (transfers.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center" style="padding: 4rem;">
                            <div style="font-size: 2.5rem; opacity: 0.2; margin-bottom: 0.5rem;">💸</div>
                            <p style="color: var(--text-muted);">Tidak ada catatan transfer ditemukan</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = transfers.map(t => {
                // Correct logic: Compare sender_wallet_id with myWalletId
                const isIncoming = t.sender_wallet_id !== myWalletId;

                return `
                <tr>
                    <td>
                        <span class="badge ${isIncoming ? 'badge-success' : 'badge-warning'}">
                            ${isIncoming ? 'DITERIMA 📥' : 'DIKIRIM 📤'}
                        </span>
                    </td>
                    <td>
                         <div style="font-weight:600; color:var(--text-main);">
                            ${isIncoming ? 'Dari Wallet ID: ' + t.sender_wallet_id : 'Ke Wallet ID: ' + t.receiver_wallet_id}
                         </div>
                         <small style="color:var(--text-muted);">${t.description || 'Tidak ada catatan'}</small>
                    </td>
                    <td style="font-weight: 700; color: ${isIncoming ? 'var(--success)' : 'var(--error)'}">
                        ${isIncoming ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                    <td><small>${new Date(t.created_at).toLocaleDateString()} ${new Date(t.created_at).toLocaleTimeString()}</small></td>
                </tr>
            `}).join('');

        } catch (e) {
            console.error(e);
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center">Gagal memuat riwayat</td></tr>';
        }
    }

    // ==========================
    // MODULE: TRANSFER & SCAN HUB
    // ==========================
    static renderTransferScanHub(activeTab = 'scan') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div style="text-align:center; margin-bottom:2rem;">
                    <h2 style="font-weight:800; color:var(--text-main);">💸 Transaksi & Pindai</h2>
                    <p style="color:var(--text-muted);">Kirim poin atau bayar dengan mudah di satu tempat.</p>
                </div>

                <div class="card" style="max-width:800px; margin:0 auto; padding:1.5rem; border-radius:24px; box-shadow:var(--shadow-md);">
                    <div class="filter-tabs tabs-container" style="margin-bottom: 2rem; background: #fff; padding: 0.5rem; border-radius: 12px; border: 1px solid var(--border); width: 100%; box-shadow: var(--shadow-sm); display: flex; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; justify-content: center;">
                        <button class="tab-btn ${activeTab === 'scan' ? 'active' : ''}" onclick="MahasiswaController.renderTransferScanHub('scan')" 
                                style="white-space: nowrap; padding: 0.6rem 2rem; border: none; border-radius: 20px; cursor: pointer; font-weight: ${activeTab === 'scan' ? '700' : '600'}; background: ${activeTab === 'scan' ? 'var(--primary)' : 'transparent'}; color: ${activeTab === 'scan' ? 'white' : 'var(--text-muted)'}; transition: 0.3s;">
                            📸 Pindai QR
                        </button>
                        <button class="tab-btn ${activeTab === 'transfer' ? 'active' : ''}" onclick="MahasiswaController.renderTransferScanHub('transfer')" 
                                style="white-space: nowrap; padding: 0.6rem 2rem; border: none; border-radius: 20px; cursor: pointer; font-weight: ${activeTab === 'transfer' ? '700' : '600'}; background: ${activeTab === 'transfer' ? 'var(--primary)' : 'transparent'}; color: ${activeTab === 'transfer' ? 'white' : 'var(--text-muted)'}; transition: 0.3s;">
                            📤 Transfer Manual
                        </button>
                    </div>


                    <div id="hubContent">
                        <!-- Content injected here -->
                    </div>
                </div>
            </div>
        `;

        if (activeTab === 'scan') {
            this.renderScannerInHub();
        } else {
            this.renderTransferInHub();
        }
    }

    static renderTransfer() {
        this.renderTransferScanHub('transfer');
    }

    static renderScanner() {
        this.renderTransferScanHub('scan');
    }

    static renderScannerInHub() {
        const container = document.getElementById('hubContent');
        container.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto; position: relative;">
                <div id="qr-reader" style="width: 100%; border-radius: 16px; overflow: hidden; background: #000;"></div>
                <div id="qr-feedback" style="margin-top: 1rem; text-align: center; color: var(--text-muted); font-weight: 600;">Mengaktifkan kamera...</div>
                
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 2rem;">
                    <label for="studentQrFileInputHub" class="btn" style="background: rgba(99, 102, 241, 0.05); color: var(--primary); border: 2px dashed var(--primary); padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%;">
                        📁 Upload Gambar QR
                    </label>
                    <input type="file" id="studentQrFileInputHub" accept="image/*" style="display: none;">
                    
                    <button class="btn btn-secondary" onclick="MahasiswaController.showMyQR()" style="width: 100%;">
                        Tampilkan QR Saya 🆔
                    </button>
                </div>
            </div>
        `;
        setTimeout(() => this.startScanner('studentQrFileInputHub'), 100);
    }

    static renderTransferInHub() {
        const container = document.getElementById('hubContent');
        container.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto;">
                <form onsubmit="MahasiswaController.handleTransfer(event)">
                    <div class="form-group">
                        <label style="font-weight: 600;">ID / NIM Penerima</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" name="receiver_id" id="transferReceiverId" placeholder="Contoh: 1001" required style="padding: 1rem; border-radius: 12px;">
                            <button type="button" class="btn btn-secondary" onclick="MahasiswaController.lookupReceiver()" style="border-radius: 12px;">🔍</button>
                        </div>
                        <div id="receiverNameDisplay" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--primary); font-weight: 600; min-height: 1.2em;"></div>
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600;">Jumlah Poin</label>
                        <input type="number" name="amount" placeholder="Min. 100" min="100" required style="padding: 1rem; border-radius: 12px; font-size: 1.2rem; font-weight: 700; color: var(--primary);">
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600;">PIN Keamanan</label>
                        <input type="password" name="pin" placeholder="******" pattern="[0-9]{6}" maxlength="6" required style="padding: 1rem; border-radius: 12px; font-size: 1.2rem; letter-spacing: 0.5em; text-align: center;">
                    </div>

                    <div class="form-group">
                        <label style="font-weight: 600;">Catatan (Opsional)</label>
                        <textarea name="description" placeholder="Contoh: Bayar makan siang..." style="padding: 1rem; border-radius: 12px;"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" id="transferBtn" style="width: 100%; padding: 1rem; border-radius: 16px; font-weight: 800; margin-top: 1rem; font-size: 1.1rem;">
                        Kirim Poin 🚀
                    </button>
                </form>
            </div>
        `;
    }

    // Reuse existing startScanner logic but accept fileInputId
    static startScanner(fileInputId = 'studentQrFileInput') {
        const html5QrCode = new Html5Qrcode("qr-reader");
        const feedback = document.getElementById('qr-feedback');
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                html5QrCode.stop().then(() => {
                    this.handleScanResult(decodedText);
                });
            },
            (errorMessage) => { }
        ).catch(err => {
            feedback.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Kamera tidak aktif. Gunakan opsi unggah file.</span>`;
        });

        // Handle File Scan
        const fileInput = document.getElementById(fileInputId);
        if (fileInput) {
            fileInput.addEventListener('change', async e => {
                if (e.target.files.length === 0) return;
                const file = e.target.files[0];
                feedback.innerHTML = "📸 Memproses file...";

                try { await html5QrCode.stop(); } catch (err) { }

                html5QrCode.scanFile(file, true)
                    .then(decodedText => this.handleScanResult(decodedText))
                    .catch(err => {
                        showToast("Gagal memindai file: " + err, "error");
                        this.renderTransferScanHub('scan'); // Reset
                    });
            });
        }
    }

    static handleScanResult(text) {
        text = text.trim();
        console.log("QR Scanned:", text);

        if (text.startsWith("WPUSER:")) {
            const userId = text.split(":")[1];
            showToast("Pengguna ditemukan! Membuka form transfer...", "success");
            setTimeout(() => {
                handleNavigation('transfer', 'mahasiswa');
                setTimeout(() => this.showTransferForm(userId), 500);
            }, 500);
        } else if (text.startsWith("WPPROD:")) {
            const prodId = text.split(":")[1];
            showToast("Produk ditemukan! Menyiapkan checkout...", "success");
            this.triggerPurchaseFromQR(prodId);
        } else if (text.startsWith("WPT:")) {
            const parts = text.split(":");
            this.handleSelfPayment(parts);
        } else {
            showToast("Format QR tidak dikenali", "warning");
            this.renderScanner(); // Restart
        }
    }

    static async handleSelfPayment(parts) {
        const tokenCode = parts[1];
        const qrAmount = parts[2] ? parseInt(parts[2]) : null;
        const qrMerchant = parts[3] || "Pembayaran QR";

        showToast("Memeriksa detail pembayaran...", "success");
        try {
            const res = await API.checkTokenStatus(tokenCode);
            const token = res.data;

            // Use API data if available, fallback to QR data
            const amount = token && typeof token.amount !== 'undefined' ? token.amount : qrAmount;
            const merchant = token && token.merchant ? token.merchant : qrMerchant;

            if (amount === null) {
                throw new Error("Data pembayaran tidak lengkap. Pastikan server backend sudah direstart.");
            }

            const modalHtml = `
                <div class="modal-overlay" id="selfPayConfirmModal">
                    <div class="modal-card" style="max-width: 450px; border-radius: 28px; padding: 2.5rem; text-align: center; box-shadow: var(--shadow-lg);">
                        <div style="font-size: 3.5rem; margin-bottom: 1.5rem;">💸</div>
                        <h2 style="font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">Konfirmasi Bayar</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Anda akan melakukan pembayaran mandiri.</p>
                        
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 20px; margin-bottom: 2rem; border: 1px solid var(--border); text-align: left;">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 0.75rem;">
                                <span>Tujuan:</span>
                                <span style="font-weight: 700; color: var(--text-main);">${merchant}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                                <span>Total:</span>
                                <span style="font-weight: 900; color: var(--primary); font-size: 1.4rem;">💎 ${amount.toLocaleString()} Pts</span>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem; text-align: left;">
                            <label style="font-weight: 600; font-size: 0.9rem;">PIN Keamanan</label>
                            <input type="password" id="selfPayPin" required placeholder="PIN 6-Digit" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" style="width: 100%; padding: 0.75rem; border-radius: 12px; border: 2px solid #e2e8f0; margin-top: 0.5rem; font-size: 1.2rem; letter-spacing: 0.2rem; text-align: center;">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="document.getElementById('selfPayConfirmModal').remove(); MahasiswaController.renderScanner();" style="padding: 1rem; border-radius: 15px; font-weight: 600; background: #f1f5f9; border: none; color: var(--text-muted);">Batal</button>
                            <button class="btn btn-primary" id="confirmSelfPayBtn" onclick="MahasiswaController.confirmSelfPayment('${tokenCode}')" style="padding: 1rem; border-radius: 15px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #a855f7); border: none; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
                                Bayar Sekarang 🚀
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (e) {
            showToast("Kode tidak valid: " + e.message, "error");
            this.renderScanner();
        }
    }

    static async confirmSelfPayment(tokenCode) {
        const pinInput = document.getElementById('selfPayPin');
        const pin = pinInput ? pinInput.value : '';

        if (!pin || pin.length < 6) {
            showToast("PIN Keamanan wajib diisi (6 digit)", "warning");
            if (pinInput) pinInput.focus();
            return;
        }

        const btn = document.getElementById('confirmSelfPayBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Memproses...';

        try {
            await API.executePayment(tokenCode, pin);
            document.getElementById('selfPayConfirmModal').remove();

            // Show success notification (reuse existing or simple toast)
            showToast("Pembayaran mandiri berhasil!", "success");

            // Redirect to history or dashboard
            setTimeout(() => {
                handleNavigation('dashboard', 'mahasiswa');
            }, 1500);
        } catch (e) {
            showToast("Gagal membayar: " + e.message, "error");
            btn.disabled = false;
            btn.innerHTML = "Bayar Sekarang 🚀";
        }
    }

    static startPaymentPolling(tokenData) {
        if (this.paymentPollingInterval) clearInterval(this.paymentPollingInterval);

        this.renderPaymentIndicator(tokenData);

        this.paymentPollingInterval = setInterval(async () => {
            try {
                const res = await API.checkTokenStatus(tokenData.token);
                const status = res.data.status;

                if (status === 'consumed') {
                    this.handlePaymentComplete(tokenData);
                } else if (status === 'expired') {
                    showToast(`Pembayaran ${tokenData.merchant} telah kadaluarsa.`, "warning");
                    this.stopPaymentBackground();
                }
                // If 'active', just continue polling...
            } catch (e) {
                // Connection error or token deleted
                console.error("Polling error:", e);
            }
        }, 5000);
    }

    static handlePaymentComplete(tokenData) {
        this.stopPaymentBackground();
        showToast(`Pembayaran ${tokenData.merchant} Berhasil!`, "success");

        // Final success modal
        this.showSuccessNotification(tokenData.merchant, tokenData.amount);

        // Refresh profile point on dashboard
        if (document.getElementById('student-balance')) {
            this.renderDashboard();
        }
    }

    static stopPaymentBackground() {
        clearInterval(this.paymentPollingInterval);
        localStorage.removeItem('active_payment_token');
        const indicator = document.getElementById('background-payment-indicator');
        if (indicator) indicator.remove();
    }

    static renderPaymentIndicator(tokenData) {
        const existing = document.getElementById('background-payment-indicator');
        if (existing) existing.remove();

        const indicatorHtml = `
            <div id="background-payment-indicator" onclick="MahasiswaController.showPaymentQR(${JSON.stringify(tokenData).replace(/"/g, '&quot;')})" 
                 style="position: fixed; bottom: 100px; right: 20px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 0.75rem 1.25rem; border-radius: 50px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4); cursor: pointer; display: flex; align-items: center; gap: 0.75rem; z-index: 9999; animation: bounce 2s infinite;">
                <div class="spinner-small" style="width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <div style="font-weight: 700; font-size: 0.85rem;">Pembayaran Aktif: ${tokenData.merchant}</div>
            </div>
            <style>
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', indicatorHtml);
    }

    static async triggerPurchaseFromQR(prodId) {
        try {
            const res = await API.request(`/mahasiswa/marketplace/products/${prodId}`, 'GET');
            const p = res.data;
            this.showCheckoutForm(p);
        } catch (e) {
            showToast("Gagal memuat detail produk", "error");
            this.renderScanner();
        }
    }

    static showMyQR() {
        const user = JSON.parse(localStorage.getItem('user'));
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 400px; text-align: center; padding: 2.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">ID Wallet Saya</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Tunjukkan kode ini untuk menerima transfer</p>
                    <div id="my-qr-container" style="display: flex; justify-content: center; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 16px; border: 1px solid var(--border);"></div>
                    <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary); background: #f1f5f9; padding: 0.5rem; border-radius: 8px;">${user.nim_nip || user.id}</div>
                    <button class="btn btn-primary" onclick="closeModal()" style="width: 100%; margin-top: 2rem;">Tutup</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Use QR Code Library or just QR text (Server-side generated preferred, but let's just make it simple)
        const qrContent = `WPUSER:${user.id}`;
        new QRCode(document.getElementById("my-qr-container"), {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Overriding purchaseProduct to lead to CheckoutForm
    static async purchaseProduct(id, name, price) {
        this.showCheckoutForm({ id, name, price });
    }

    static showCheckoutForm(product) {
        const user = JSON.parse(localStorage.getItem('user'));
        const modalHtml = `
            <div class="modal-overlay" id="checkoutModal" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head">
                        <div>
                            <h3 style="font-weight: 800; color: var(--text-main); margin: 0;">📋 Detail Pembayaran</h3>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Lengkapi data untuk memproses pesanan Anda.</p>
                        </div>
                        <button class="btn-icon" onclick="closeModal()">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 20px; margin-bottom: 2rem; border: 1px dashed var(--border);">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-size: 0.9rem;">Produk:</span>
                                <span style="font-weight: 700; color: var(--text-main);">${product.name}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color: var(--text-muted); font-size: 0.9rem;">Total Harga:</span>
                                <span style="font-weight: 900; color: var(--primary); font-size: 1.2rem;">💎 ${product.price.toLocaleString()} Pts</span>
                            </div>
                        </div>

                        <form id="checkoutForm" onsubmit="MahasiswaController.handleFastCheckout(event, ${product.id}, '${product.name}', ${product.price}, ${product.created_by || 0})">
                            <div class="grid-2-col" style="gap: 1rem; margin-bottom: 1.25rem;">
                                <div class="form-group">
                                    <label style="font-weight: 600; font-size: 0.85rem;">Nama Lengkap</label>
                                    <input type="text" name="student_name" value="${user.full_name || ''}" required style="padding: 0.75rem; border-radius: 12px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight: 600; font-size: 0.85rem;">NPM / NIM</label>
                                    <input type="text" name="student_npm" value="${user.nim_nip || ''}" required style="padding: 0.75rem; border-radius: 12px;">
                                </div>
                            </div>

                            <div style="margin-bottom: 2rem; text-align: left;">
                                <label style="font-weight: 700; margin-bottom: 1rem; display: block; font-size: 0.9rem;">Pilih Metode Pembayaran</label>
                                <div class="grid-2-col" style="gap: 1rem; margin-bottom: 1.5rem;">
                                    <label style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: 0.3s;" class="pay-method-label">
                                        <input type="radio" name="payment_method" value="wallet" checked style="display: none;">
                                        <span style="font-size: 1.5rem;">🪙</span>
                                        <span style="font-weight: 700; font-size: 0.85rem;">Saldo Wallet</span>
                                    </label>
                                    <label style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: 0.3s;" class="pay-method-label">
                                        <input type="radio" name="payment_method" value="qr" style="display: none;">
                                        <span style="font-size: 1.5rem;">📸</span>
                                        <span style="font-weight: 700; font-size: 0.85rem;">Kode QR</span>
                                    </label>
                                </div>

                                <div class="form-group">
                                    <label style="font-weight: 600; font-size: 0.85rem;">PIN Keamanan</label>
                                    <input type="password" name="pin" required placeholder="PIN 6-Digit" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" style="padding: 0.75rem; border-radius: 12px; width: 100%; box-sizing: border-box; border: 2px solid #e2e8f0;">
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-foot">
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="padding: 1rem; border-radius: 14px; font-weight: 600;">Batal</button>
                            <button type="submit" form="checkoutForm" class="btn btn-primary" id="fastPayBtn" style="padding: 1rem; border-radius: 14px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); border: none; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
                                Konfirmasi Pembayaran 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .pay-method-label:has(input:checked) {
                    border-color: var(--primary) !important;
                    background: #eff6ff !important;
                    color: var(--primary) !important;
                }
            </style>

        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleFastCheckout(e, prodId, prodName, price, recipientId) {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form).entries());
        const btn = document.getElementById('fastPayBtn');

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Memproses...';

        try {
            if (formData.payment_method === 'qr') {
                // Generate Payment Token WPT:...
                const tokenRes = await API.generatePaymentToken({
                    amount: price,
                    merchant: prodName,
                    type: 'purchase',
                    recipient_id: parseInt(recipientId) || 0
                });

                document.getElementById('checkoutModal').remove();
                this.showPaymentQR(tokenRes.data);
                return;
            }

            // Direct Wallet Payment
            await API.purchaseProduct({
                product_id: prodId,
                quantity: 1,
                pin: formData.pin,
                payment_method: 'wallet',
                student_name: formData.student_name,
                student_npm: formData.student_npm,
                student_major: '-',
                student_batch: '-'
            });

            document.getElementById('checkoutModal').remove();
            this.showSuccessNotification(prodName, price);

            // Refresh dashboard after payment
            if (document.getElementById('student-balance')) {
                const updatedWallet = await API.getWallet();
                document.getElementById('student-balance').textContent = updatedWallet.data.balance.toLocaleString();
            }

            // Fix: Refresh Shop to update stock
            if (document.getElementById('shopGrid')) {
                this.renderShop();
            }
            // Also refresh ledger if open
            if (document.getElementById('ledgerTable')) {
                this.renderLedger();
            }
        } catch (e) {
            showToast("Pembayaran Gagal: " + e.message, "error");
            btn.disabled = false;
            btn.textContent = "Konfirmasi Pembayaran 🚀";
        }
    }

    static showPaymentQR(tokenData) {
        // Save to background storage
        localStorage.setItem('active_payment_token', JSON.stringify(tokenData));
        this.startPaymentPolling(tokenData);

        const modalHtml = `
            <div class="modal-overlay" id="paymentTokenModal">
                <div class="modal-card" style="max-width: 450px; text-align: center; padding: 2.5rem; border-radius: 28px; box-shadow: var(--shadow-lg);">
                    <div style="background: var(--primary-light); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--primary); font-size: 1.5rem;">🕒</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 800; color: var(--text-main);">QR Pembayaran Aktif</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">Pindai kode ini untuk menyelesaikan pembayaran. Berlaku selama 10 menit.</p>
                    
                    <div id="payment-qr-container" style="display: flex; justify-content: center; margin-bottom: 2rem; background: white; padding: 1.25rem; border-radius: 20px; border: 2px solid var(--primary-light);"></div>
                    
                    <div style="background: #f8fafc; padding: 1.25rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${tokenData.merchant}</div>
                        <div style="color: var(--primary); font-weight: 800; font-size: 1.5rem; margin-top: 0.25rem;">💎 ${tokenData.amount.toLocaleString()} Pts</div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
                        <button class="btn btn-primary" onclick="MahasiswaController.downloadQR('payment-qr-container', 'WP_Payment')" style="padding: 1rem; border-radius: 14px; font-weight: 700; background: var(--primary); border: none;">Simpan QR ke Galeri 💾</button>
                        <button class="btn btn-secondary" onclick="document.getElementById('paymentTokenModal').remove()" style="padding: 1rem; border-radius: 14px; color: var(--text-muted); border: none; font-weight: 600;">Lanjutkan Nanti (Berjalan di Background)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Format is WPT:tokenCode:amount:merchant (from backend service.go)
        const qrContent = `WPT:${tokenData.token}:${tokenData.amount}:${tokenData.merchant}`;
        new QRCode(document.getElementById("payment-qr-container"), {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: "#1a1a1a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }


    static generateItemQR(id, name, price) {
        const modalHtml = `
            <div class="modal-overlay" id="qrItemModal" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 450px;">
                    <div class="modal-head">
                        <h3 style="font-weight: 800; color: var(--text-main); margin: 0;">📸 Kode QR Produk</h3>
                        <button class="btn-icon" onclick="closeModal()">×</button>
                    </div>
                    <div class="modal-body" style="text-align: center;">
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Pilih metode penyelesaian transaksi Anda</p>
                        
                        <div id="product-qr-display" style="display: flex; justify-content: center; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 16px; border: 2px solid var(--primary-light);"></div>
                        
                        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid var(--border);">
                            <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${name}</div>
                            <div style="color: var(--primary); font-weight: 800; font-size: 1.3rem;">💎 ${price.toLocaleString()} Pts</div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-primary" id="directPayBtn" onclick="MahasiswaController.processDirectFromQR(${id}, '${name}', ${price})" style="padding: 1rem; border-radius: 12px;">
                                ⚡ Bayar Instan (Poin)
                            </button>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                <button class="btn btn-secondary" onclick="MahasiswaController.downloadQR('product-qr-display', '${name}')" style="padding: 0.8rem; border-radius: 12px;">
                                    💾 Simpan
                                </button>
                                <button class="btn btn-secondary" onclick="closeModal()" style="padding: 0.8rem; border-radius: 12px; background: #f1f5f9; border: none;">
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const qrContent = `WPPROD:${id}`;
        new QRCode(document.getElementById("product-qr-display"), {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    static async processDirectFromQR(id, name, price) {
        if (!confirm(`Konfirmasi pembayaran instan untuk ${name}?`)) return;

        const btn = document.getElementById('directPayBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Memproses...';

        try {
            await this.handleFastCheckout(id, name, price);
            // close the QR modal if payment is successful
            const qrModal = document.getElementById('qrItemModal');
            if (qrModal) qrModal.remove();
        } catch (e) {
            btn.disabled = false;
            btn.innerHTML = '⚡ Bayar Instan (Poin)';
        }
    }

    static downloadQR(elementId, filename) {
        const canvas = document.querySelector(`#${elementId} canvas`);
        const link = document.createElement('a');
        link.download = `QR-${filename.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showToast("QR Berhasil Disimpan", "success");
    }

    static showSuccessNotification(name, price) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 400px; text-align: center;">
                    <div class="modal-body" style="padding: 3rem;">
                        <div style="width: 80px; height: 80px; background: var(--success); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 2rem; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);">
                            ✓
                        </div>
                        <h2 style="margin-bottom: 1rem; font-weight: 800;">Transaksi Berhasil!</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Anda telah menukarkan <strong>${name}</strong> seharga <strong>${price.toLocaleString()} Pts</strong>.</p>
                        <button class="btn btn-primary btn-block" onclick="MahasiswaController.renderLedger(); closeModal();">
                            Lihat Buku Kas 📜
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof loadStudentStats === 'function') loadStudentStats();
    }
}
