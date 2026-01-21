class DosenController {
    static init() {
        console.log("Dosen module initialized");
    }

    static async loadDosenStats() {
        try {
            const res = await API.request('/dosen/stats', 'GET');
            const stats = res.data;

            const mElem = document.getElementById('stats-missions');
            const pElem = document.getElementById('stats-pending');
            const vElem = document.getElementById('stats-validated');

            if (mElem) mElem.textContent = stats.total_missions || 0;
            if (pElem) pElem.textContent = stats.pending_reviews || 0;
            if (vElem) vElem.textContent = stats.validated_tasks || 0;
        } catch (e) {
            console.error("Failed to load dosen stats", e);
        }
    }

    // ==========================
    // MODULE: QUIZZES
    // ==========================
    static async renderQuizzes() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-weight: 700; color: var(--text-main);">Manajemen Kuis</h2>
                        <p style="color: var(--text-muted);">Buat dan kelola kuis interaktif untuk siswa</p>
                    </div>
                    <button class="btn btn-primary" onclick="DosenController.showQuizModal()">
                        <span style="font-size: 1.2rem;">+</span> Buat Kuis Baru
                    </button>
                </div>

                <div class="table-wrapper">
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="quizzesTable">
                            <thead>
                                <tr>
                                    <th>Detail Kuis</th>
                                    <th>Kompleksitas</th>
                                    <th>Hadiah</th>
                                    <th>Jadwal</th>
                                    <th>Status</th>
                                    <th class="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody><tr><td colspan="6" class="text-center">Memuat Kuis...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        try {
            const result = await API.getDosenMissions({ type: 'quiz' });
            const quizzes = (result.data.missions || []).filter(m => m.type === 'quiz');
            const tbody = document.querySelector('#quizzesTable tbody');

            if (quizzes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center" style="padding: 4rem 1rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📝</div>
                            <h3 style="color: var(--text-muted);">Tidak ada kuis ditemukan</h3>
                            <p style="opacity: 0.6;">Mulai dengan membuat kuis interaktif pertama Anda.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = quizzes.map(q => `
                <tr class="fade-in-item">
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                💡
                            </div>
                            <div>
                                <strong style="font-size: 1rem; color: var(--text-main);">${q.title}</strong><br>
                                <small style="color: var(--text-muted); display: block; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${q.description || 'Tidak ada instruksi yang diberikan'}
                                </small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2);">
                            ${q.questions?.length || 0} Pertanyaan
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span style="color: #fbbf24; font-size: 1.1rem;">💎</span>
                            <span style="font-weight: 700; color: var(--text-main);">${q.points.toLocaleString()}</span>
                            <small style="color: var(--text-muted);">pts</small>
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem;">
                            <div style="color: var(--text-main);">${q.deadline ? new Date(q.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak Ada Batas'}</div>
                            <small style="color: var(--text-muted);">${q.deadline ? new Date(q.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${q.status === 'active' ? 'badge-success' : 'badge-warning'}">
                            ${q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                            <button class="btn btn-sm" style="background: var(--primary); color: white; border-radius: 12px; font-size: 0.75rem; padding: 0.4rem 0.8rem;" 
                                    onclick="DosenController.renderSubmissions('pending', ${q.id})" title="Lihat Pengiriman">
                                📊 Hasil
                            </button>
                            <button class="btn-icon" style="background: #f1f5f9;" onclick="DosenController.showQuizModal(${q.id})" title="Sempurnakan Kuis">
                                <span style="font-size: 0.9rem;">✏️</span>
                            </button>
                            <button class="btn-icon" style="background: rgba(239, 68, 68, 0.05); color: var(--error);" onclick="DosenController.deleteMission(${q.id})" title="Hapus Kuis">
                                <span style="font-size: 0.9rem;">🗑️</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat kuis", "error");
        }
    }

    static async showQuizModal(id = null) {
        let quiz = null;
        if (id) {
            try {
                const res = await API.getDosenMissions();
                quiz = res.data.missions.find(m => m.id === id);
            } catch (e) { console.error(e); }
        }

        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 1000px; width: 95%; height: 90vh; display: flex; flex-direction: column;">
                    <div class="modal-head" style="background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 1.5rem 2rem;">
                        <div>
                            <h3 style="margin:0; font-weight: 700;">${id ? '📝 Edit Penilaian' : '✨ Desain Kuis Baru'}</h3>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; opacity: 0.9;">Konfigurasikan pertanyaan dan hadiah untuk siswa Anda</p>
                        </div>
                        <button class="btn-icon" onclick="closeModal()" style="color: white; font-size: 1.5rem;">×</button>
                    </div>
                    
                    <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 2rem; background: #fdfcfd;">
                        <form id="quizForm" onsubmit="DosenController.handleQuizSubmit(event, ${id})">
                            <!-- Basic Config Card -->
                            <div class="card" style="margin-bottom: 2rem; border-left: 4px solid var(--primary); padding: 1.5rem;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                    <div>
                                        <div class="form-group">
                                            <label style="font-weight: 600; color: var(--text-main);">Judul Kuis</label>
                                            <input type="text" name="title" value="${quiz?.title || ''}" required placeholder="misal, Matematika - Dasar Aljabar" style="border-radius: 10px;">
                                        </div>
                                        <div class="form-group">
                                            <label style="font-weight: 600; color: var(--text-main);">Panduan & Deskripsi</label>
                                            <textarea name="description" placeholder="Sebutkan aturan atau konteks kuis..." style="min-height: 100px; border-radius: 10px;">${quiz?.description || ''}</textarea>
                                        </div>
                                    </div>
                                    <div>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                            <div class="form-group">
                                                <label style="font-weight: 600; color: var(--text-main);">Alokasi Poin</label>
                                                <div style="position: relative;">
                                                    <input type="number" name="points" value="${quiz?.points || 100}" required min="1" style="padding-left: 2.5rem; border-radius: 10px;">
                                                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5;">💎</span>
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label style="font-weight: 600; color: var(--text-main);">Batas Waktu / Tenggat</label>
                                                <input type="datetime-local" name="deadline" value="${quiz?.deadline ? new Date(quiz.deadline).toISOString().slice(0, 16) : ''}" style="border-radius: 10px;">
                                            </div>
                                        </div>
                                        <div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--primary); border: 1px dashed var(--primary-light);">
                                            <strong>Tip Pro:</strong> Kuis dengan poin lebih tinggi cenderung memiliki keterlibatan siswa yang lebih baik. Pastikan tenggat waktu masuk akal!
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Questions Sections -->
                            <div id="questionsContainer">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: #fff; position: sticky; top: 0; z-index: 10; padding: 0.5rem 0;">
                                    <h3 style="margin:0; color: var(--text-main); display: flex; align-items: center; gap: 0.75rem;">
                                        <span style="background: var(--secondary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">?</span>
                                        Quiz Questions (<span id="qCount">0</span>/20)
                                    </h3>
                                    <button type="button" id="btnAddQuestion" class="btn btn-primary" onclick="DosenController.addQuestionField()" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 2rem;">
                                        + Tambah Pertanyaan Baru
                                    </button>
                                </div>
                                <div id="questionsList">
                                    <!-- Dynamic fields -->
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-foot" style="padding: 1.5rem 2rem; border-top: 1px solid var(--border); background: white; border-bottom-left-radius: var(--radius-xl); border-bottom-right-radius: var(--radius-xl);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: var(--text-muted); font-size: 0.9rem;">
                                ✨ Total Poin: <span id="pointsPreview" style="font-weight: 700; color: var(--primary);">${quiz?.points || 100}</span>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="background: transparent; color: var(--text-muted);">Buang</button>
                                <button type="submit" form="quizForm" class="btn btn-primary" style="padding: 0.8rem 2.5rem; border-radius: 2rem;">
                                    ${id ? 'Perbarui Penilaian' : 'Luncurkan Kuis 🚀'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Point preview sync
        document.querySelector('input[name="points"]').addEventListener('input', (e) => {
            document.getElementById('pointsPreview').textContent = e.target.value;
        });

        // Pre-fill questions
        if (quiz?.questions && quiz.questions.length > 0) {
            quiz.questions.forEach((q, idx) => this.addQuestionField(q, idx + 1));
        } else {
            this.addQuestionField(null, 1);
        }
    }

    static addQuestionField(data = null, index = null) {
        const container = document.getElementById('questionsList');
        const count = container.children.length;

        if (count >= 20 && !data) {
            showToast("Maksimum 20 pertanyaan tercapai", "warning");
            return;
        }

        if (!index) {
            index = count + 1;
        }

        const qId = Date.now() + Math.random().toString(16).slice(2);
        const html = `
            <div class="question-item card fade-in" style="padding: 1.5rem; margin-bottom: 2rem; border: 1px solid var(--border); border-left: 5px solid var(--primary); box-shadow: var(--shadow-md); position: relative; border-radius: var(--radius-lg);" id="q-${qId}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                    <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1;">
                        <span class="q-number" style="background: var(--primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">${index}</span>
                        <input type="text" class="question-text" placeholder="Ketik pertanyaan Anda di sini..." value="${data?.question || ''}" required 
                               style="font-size: 1.1rem; font-weight: 600; border: none; border-bottom: 2px solid #f1f5f9; padding: 0.5rem 0; border-radius: 0; width: 100%;">
                    </div>
                    <button type="button" class="btn-icon" style="color: var(--error); border: none; background: rgba(239, 68, 68, 0.05); margin-left: 1rem;" 
                            onclick="document.getElementById('q-${qId}').remove(); DosenController.reindexQuestions();" title="Hapus Pertanyaan">
                        <span style="font-size: 1.2rem;">&times;</span>
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    ${['A', 'B', 'C', 'D'].map((letter, i) => {
            const optionValue = data?.options ? (data.options[i] || '') : '';
            const isCorrect = data?.answer === optionValue && optionValue !== '';
            return `
                        <div style="display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; transition: all 0.2s;">
                            <input type="radio" name="correct-${qId}" value="${i}" ${isCorrect ? 'checked' : (i === 0 && !data ? 'checked' : '')} 
                                   style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);">
                            <div style="flex: 1; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-weight: 800; color: #64748b; min-width: 15px;">${letter}</span>
                                <input type="text" class="question-option" placeholder="Option ${letter}" value="${optionValue}" required 
                                       style="background: transparent; border: none; padding: 0.25rem 0; font-size: 0.95rem; width: 100%;"
                                       oninput="this.closest('div').parentElement.querySelector('input[type=radio]').value = ${i};">
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
                
                <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--success);">●</span> Pilih tombol radio di sebelah jawaban yang benar.
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        this.reindexQuestions();
    }

    static reindexQuestions() {
        const questions = document.querySelectorAll('.question-item');
        const counterElem = document.getElementById('qCount');
        const btnAdd = document.getElementById('btnAddQuestion');

        if (counterElem) counterElem.textContent = questions.length;

        if (btnAdd) {
            if (questions.length >= 20) {
                btnAdd.disabled = true;
                btnAdd.style.opacity = '0.5';
                btnAdd.style.cursor = 'not-allowed';
            } else {
                btnAdd.disabled = false;
                btnAdd.style.opacity = '1';
                btnAdd.style.cursor = 'pointer';
            }
        }

        questions.forEach((el, idx) => {
            const span = el.querySelector('.q-number');
            if (span) span.textContent = idx + 1;
        });
    }

    static async handleQuizSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.type = 'quiz';
        data.points = parseInt(data.points);

        // Collect questions
        const questionsList = [];
        document.querySelectorAll('.question-item').forEach(el => {
            const question = el.querySelector('.question-text').value;
            const optionInputs = el.querySelectorAll('.question-option');
            const options = Array.from(optionInputs).map(o => o.value).filter(v => v.trim() !== "");

            // Get selected radio button index
            const qId = el.id.replace('q-', '');
            const selectedRadio = el.querySelector(`input[name="correct-${qId}"]:checked`);
            const selectedIdx = selectedRadio ? parseInt(selectedRadio.value) : 0;

            // The answer is the text of the selected option
            const answer = optionInputs[selectedIdx] ? optionInputs[selectedIdx].value : "";

            questionsList.push({ question, options, answer });
        });

        if (questionsList.length === 0) {
            showToast("Setidaknya satu pertanyaan diperlukan", "error");
            return;
        }

        data.questions = questionsList;

        if (data.deadline) {
            data.deadline = new Date(data.deadline).toISOString();
        } else {
            delete data.deadline;
        }

        try {
            if (id) {
                await API.updateMission(id, data);
            } else {
                await API.createMission(data);
            }
            showToast("Kuis berhasil diterbitkan");
            closeModal();
            DosenController.renderQuizzes();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    // ==========================
    // MODULE: MISSIONS
    // ==========================
    static async renderMissions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-weight: 700; color: var(--text-main);">Lokakarya Misi</h2>
                        <p style="color: var(--text-muted);">Koordinasikan tugas dan penugasan untuk pengembangan siswa</p>
                    </div>
                    <button class="btn btn-primary" onclick="DosenController.showMissionModal()">
                        <span style="font-size: 1.2rem;">+</span> Tugas Baru
                    </button>
                </div>

                <div class="table-wrapper">
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="missionsTable">
                            <thead>
                                <tr>
                                    <th>Pengenal Tugas</th>
                                    <th>Kategori</th>
                                    <th>Hadiah</th>
                                    <th>Linimasa</th>
                                    <th>Status</th>
                                    <th class="text-right">Kelola</th>
                                </tr>
                            </thead>
                            <tbody><tr><td colspan="6" class="text-center">Menyelaraskan misi...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        try {
            const result = await API.getDosenMissions();
            const missions = (result.data.missions || []).filter(m => m.type !== 'quiz');
            const tbody = document.querySelector('#missionsTable tbody');

            if (missions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center" style="padding: 4rem 1rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">🛠️</div>
                            <h3 style="color: var(--text-muted);">Tidak ada misi aktif</h3>
                            <p style="opacity: 0.6;">Laboratorium misi Anda saat ini kosong.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = missions.map(m => `
                <tr class="fade-in-item">
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                ${m.type === 'assignment' ? '📄' : '✅'}
                            </div>
                            <div>
                                <strong style="font-size: 1rem; color: var(--text-main);">${m.title}</strong><br>
                                <small style="color: var(--text-muted); display: block; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${m.description || 'Tidak ada detail instruksi'}
                                </small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); text-transform: capitalize; border: 1px solid rgba(16, 185, 129, 0.2);">
                            ${m.type}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span style="color: #fbbf24; font-size: 1.1rem;">💎</span>
                            <span style="font-weight: 700; color: var(--text-main);">${m.points.toLocaleString()}</span>
                            <small style="color: var(--text-muted);">pts</small>
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem;">
                            <div style="color: var(--text-main);">${m.deadline ? new Date(m.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Buka Selamanya'}</div>
                            <small style="color: var(--text-muted);">${m.deadline ? new Date(m.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'Tidak Ada Kadaluwarsa'}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${m.status === 'active' ? 'badge-success' : 'badge-warning'}" style="border-radius: 20px;">
                            ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                            <button class="btn btn-sm" style="background: var(--primary); color: white; border-radius: 12px; font-size: 0.75rem; padding: 0.4rem 0.8rem;" 
                                    onclick="DosenController.renderSubmissions('pending', ${m.id})" title="Lihat Pengiriman">
                                📊 Pengiriman
                            </button>
                            <button class="btn-icon" style="background: #f1f5f9;" onclick="DosenController.showMissionModal(${m.id})" title="Sempurnakan Tugas">
                                <span style="font-size: 0.9rem;">✏️</span>
                            </button>
                            <button class="btn-icon" style="background: rgba(239, 68, 68, 0.05); color: var(--error);" onclick="DosenController.deleteMission(${m.id})" title="Hapus Tugas">
                                <span style="font-size: 0.9rem;">🗑️</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat misi lokakarya", "error");
        }
    }

    static async showMissionModal(id = null) {
        let mission = null;
        if (id) {
            try {
                const res = await API.getDosenMissions();
                mission = res.data.missions.find(m => m.id === id);
            } catch (e) { console.error(e); }
        }

        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card" style="max-width: 650px; width: 95%; overflow: hidden; border-radius: var(--radius-xl);">
                    <div class="modal-head" style="background: var(--primary); color: white; padding: 1.5rem 2rem;">
                        <div>
                            <h3 style="margin:0; font-weight: 700;">${id ? '🛠️ Sempurnakan Misi' : '✨ Arsiteki Misi Baru'}</h3>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; opacity: 0.9;">Desain tugas untuk menantang siswa Anda</p>
                        </div>
                        <button class="btn-icon" onclick="closeModal()" style="color: white; font-size: 1.5rem;">×</button>
                    </div>

                    <div class="modal-body" style="padding: 2rem;">
                        <form id="missionForm" onsubmit="DosenController.handleMissionSubmit(event, ${id})">
                            <div class="form-group">
                                <label style="font-weight: 600; color: var(--text-main);">Nama Proyek / Judul Misi</label>
                                <input type="text" name="title" value="${mission?.title || ''}" required placeholder="misal, Analisis Sistem Keuangan" style="border-radius: 10px;">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: 600; color: var(--text-main);">Instruksi Komprehensif</label>
                                <textarea name="description" placeholder="Berikan langkah-langkah yang jelas untuk penyelesaian..." style="min-height: 120px; border-radius: 10px;">${mission?.description || ''}</textarea>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="form-group">
                                    <label style="font-weight: 600; color: var(--text-main);">Kategori Tugas</label>
                                    <select name="type" style="border-radius: 10px; background-color: #f8fafc;">
                                        <option value="task" ${mission?.type === 'task' ? 'selected' : ''}>Tugas Standar</option>
                                        <option value="assignment" ${mission?.type === 'assignment' ? 'selected' : ''}>Penugasan Laboratorium</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="font-weight: 600; color: var(--text-main);">Hadiah Dompet (poin)</label>
                                    <div style="position: relative;">
                                        <input type="number" name="points" value="${mission?.points || 100}" required min="1" style="padding-left: 2.5rem; border-radius: 10px;">
                                        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);">💎</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label style="font-weight: 600; color: var(--text-main);">Tenggat Penyelesaian</label>
                                <input type="datetime-local" name="deadline" value="${mission?.deadline ? new Date(mission.deadline).toISOString().slice(0, 16) : ''}" style="border-radius: 10px;">
                            </div>

                            <div class="form-actions" style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                                <button type="button" class="btn" onclick="closeModal()" style="background: transparent; color: var(--text-muted);">Buang Perubahan</button>
                                <button type="submit" class="btn btn-primary" style="padding: 0.8rem 2rem; border-radius: 2rem; box-shadow: var(--shadow-md);">
                                    ${id ? 'Eksekusi Pembaruan' : 'Luncurkan Misi 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleMissionSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Ensure points is a valid positive number
        const points = parseInt(data.points, 10);
        if (isNaN(points) || points <= 0) {
            showToast("Poin hadiah harus berupa angka positif", "error");
            return;
        }
        data.points = points;

        if (data.deadline) {
            try {
                data.deadline = new Date(data.deadline).toISOString();
            } catch (err) {
                delete data.deadline;
            }
        } else {
            delete data.deadline;
        }

        try {
            if (id) {
                await API.updateMission(id, data);
                showToast("Misi berhasil diperbarui");
            } else {
                await API.createMission(data);
                showToast("Misi berhasil dibuat");
            }
            closeModal();
            DosenController.renderMissions();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    static async deleteMission(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus misi ini?")) return;
        try {
            await API.deleteMission(id);
            showToast("Misi dihapus");
            DosenController.renderMissions();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    // ==========================
    // MODULE: SUBMISSIONS
    // ==========================
    static async renderSubmissions(statusFilter = 'pending', missionId = null) {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem;">
                    <h2 style="font-weight: 700; color: var(--text-main);">Terminal Validasi</h2>
                    <p style="color: var(--text-muted);">Tinjau pengiriman siswa dan berikan poin</p>
                </div>

                <div class="tabs" style="margin-bottom: 1.5rem; display:flex; gap: 1rem; border-bottom: 2px solid var(--border);">
                    <button class="tab-btn ${statusFilter === 'pending' ? 'active' : ''}" 
                            onclick="DosenController.renderSubmissions('pending', ${missionId})"
                            style="padding: 0.8rem 1.5rem; background:none; border:none; border-bottom: 3px solid ${statusFilter === 'pending' ? 'var(--primary)' : 'transparent'}; font-weight: 600; color: ${statusFilter === 'pending' ? 'var(--primary)' : 'var(--text-muted)'}; cursor: pointer;">
                        ⏳ Menunggu Peninjauan
                    </button>
                    <button class="tab-btn ${statusFilter !== 'pending' ? 'active' : ''}" 
                            onclick="DosenController.renderSubmissions('approved', ${missionId})"
                            style="padding: 0.8rem 1.5rem; background:none; border:none; border-bottom: 3px solid ${statusFilter !== 'pending' ? 'var(--primary)' : 'transparent'}; font-weight: 600; color: ${statusFilter !== 'pending' ? 'var(--primary)' : 'var(--text-muted)'}; cursor: pointer;">
                        ✅ Riwayat / Ditinjau
                    </button>
                </div>

                <div class="table-wrapper">
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="submissionsTable">
                            <thead>
                                <tr>
                                    <th>Info Kandidat</th>
                                    <th>Asal Misi</th>
                                    <th>Waktu</th>
                                    <th>Status & Skor</th>
                                    <th class="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody><tr><td colspan="5" class="text-center">Menunggu aliran data...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        try {
            // Note: If 'approved', we might want to also see 'rejected'. Backend filter currently implies exact match.
            // For simplicity, let's carry the filter string. If user clicks History, we might defaulting to 'approved' but strictly we want completed.
            // But API might support status filter.

            let queryStatus = statusFilter;
            if (statusFilter !== 'pending') {
                // If viewing history, maybe we fetch all non-pending? 
                // Currently API implementation usually filters by exact status. 
                // Let's stick to the requested status for now.
            }

            const result = await API.getDosenSubmissions({ status: queryStatus, limit: 100 });
            let submissions = result.data.submissions || [];

            if (missionId) {
                submissions = submissions.filter(s => s.mission_id === missionId);
            }

            // If tab is history, we might want to merge approved & rejected if backend doesn't support generic 'completed' status
            // Assuming for now simple filter.

            const tbody = document.querySelector('#submissionsTable tbody');

            if (submissions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center" style="padding: 4rem 1rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📭</div>
                            <h3 style="color: var(--text-muted);">Tidak ada pengiriman ${statusFilter}</h3>
                            <p style="opacity: 0.6;">Kotak masuk Anda untuk kategori ini kosong.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = submissions.map(s => `
                <tr class="fade-in-item">
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                                ${s.student_name ? s.student_name.charAt(0) : 'S'}
                            </div>
                            <div>
                                <strong style="color: var(--text-main);">${s.student_name}</strong><br>
                                <small style="color: var(--text-muted);">${s.student_nim}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: var(--primary);">${s.mission_title}</div>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem;">
                            <div style="color: var(--text-main);">${new Date(s.created_at).toLocaleDateString()}</div>
                            <small style="color: var(--text-muted);">${new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${s.status === 'pending' ? 'badge-warning' : (s.status === 'approved' ? 'badge-success' : 'badge-error')}" 
                              style="text-transform: capitalize;">
                            ${s.status}
                        </span>
                        ${s.status !== 'pending' ? `<span style="font-weight: 700; margin-left: 0.5rem; color: var(--text-main);">${s.score}/100</span>` : ''}
                    </td>
                            <td class="text-right">
                        ${s.status === 'pending'
                    ? `<button class="btn btn-primary" onclick="DosenController.showReviewModal(${s.id})" style="padding: 0.4rem 1.2rem; font-size: 0.85rem; border-radius: 20px;">Tinjau Sekarang</button>`
                    : `<button class="btn" onclick="DosenController.showReviewModal(${s.id})" style="padding: 0.4rem 1.2rem; font-size: 0.85rem; background: #f1f5f9; color: var(--text-muted);">Lihat Detail</button>`
                }
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil pengiriman", "error");
        }
    }

    static async showReviewModal(id) {
        try {
            const resSub = await API.getDosenSubmissions();
            const submission = resSub.data.submissions.find(s => s.id === id);

            // Get Mission details for correct answers
            const resMission = await API.getMissionByID(submission.mission_id);
            const mission = resMission.data;

            let artifactContent = '';
            if (mission.type === 'quiz') {
                let answers = [];
                try {
                    answers = JSON.parse(submission.content);
                } catch (e) {
                    console.error("Failed to parse quiz answers", e);
                }

                artifactContent = `
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
                        <div style="padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: var(--primary);">
                            HASIL JAWABAN KUIS 💡
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #f1f5f9;">
                                    <tr>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; color: #64748b; width: 50%;">PERTANYAAN</th>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; color: #64748b;">JAWABAN SISWA</th>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; color: #64748b;">KUNCI</th>
                                        <th style="padding: 1rem; text-align: center; font-size: 0.8rem; color: #64748b;">SKOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(mission.questions || []).map(q => {
                    const studentAns = answers.find(a => a.question_id === q.id)?.answer || '-';
                    const isCorrect = studentAns === q.answer;
                    return `
                                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                                <td style="padding: 1rem; font-size: 0.85rem; color: #1e293b; font-weight: 500;">${q.question}</td>
                                                <td style="padding: 1rem; font-size: 0.85rem; color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 700;">${studentAns}</td>
                                                <td style="padding: 1rem; font-size: 0.85rem; color: var(--primary); font-weight: 600;">${q.answer}</td>
                                                <td style="padding: 1rem; text-align: center;">
                                                    <span style="font-size: 1.1rem;">${isCorrect ? '✅' : '❌'}</span>
                                                </td>
                                            </tr>
                                        `;
                }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                artifactContent = `
                    <div style="background: #f1f5f9; padding: 1.5rem; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.6; color: #1e293b; white-space: pre-wrap; border: 1px solid #e2e8f0;">
                        ${submission.content || 'Tidak ada konten teks yang disediakan.'}
                    </div>
                `;
            }

            const modalHtml = `
                <div class="modal-overlay" onclick="closeModal(event)">
                    <div class="modal-card" style="max-width: 850px; border-radius: var(--radius-xl); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
                        <div class="modal-head" style="background: #0f172a; color: white; padding: 1.5rem 2rem;">
                            <div>
                                <h3 style="margin:0;">Pemeriksaan Tugas: ${submission.student_name}</h3>
                                <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; opacity: 0.7;">${submission.mission_title} (${mission.type.toUpperCase()})</p>
                            </div>
                            <button class="btn-icon" onclick="closeModal()" style="color: white; font-size: 1.5rem;">×</button>
                        </div>
                        <div class="modal-body" style="padding: 2rem; background: #f8fafc; overflow-y: auto;">
                            <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 800; display: block; margin-bottom: 0.75rem;">ARTEFAK PENGIRIMAN SISWA</label>
                            
                            ${artifactContent}

                            ${submission.file_url ? (() => {
                    let viewUrl = submission.file_url;
                    if (!viewUrl.startsWith('http')) {
                        viewUrl = `${CONFIG.API_BASE_URL.replace('/api/v1', '')}${viewUrl.startsWith('/') ? '' : '/'}${viewUrl}`;
                    }
                    return `
                                <div style="margin-top: 1rem;">
                                    <a href="${viewUrl}" target="_blank" class="btn" style="background: white; color: var(--primary); border: 1px solid var(--primary); font-size: 0.85rem; width: 100%; font-weight: 600; text-align: center; display: block; text-decoration: none;">
                                        Lihat Dokumentasi Pendukung 🖇️
                                    </a>
                                </div>`;
                })() : ''}

                            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px dashed #e2e8f0;">
                                <form id="reviewForm" onsubmit="DosenController.handleReviewSubmit(event, ${id}, ${mission.points})">
                                    <div style="text-align:center; margin-bottom:1.5rem;">
                                        <h4 style="margin-bottom:0.5rem; color:var(--text-main);">Keputusan Validasi</h4>
                                        <p style="color:var(--text-muted); font-size:0.9rem;">Tentukan apakah siswa lulus misi ini. Poin akan otomatis diberikan jika lulus.</p>
                                    </div>

                                    <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
                                        <label style="cursor: pointer; flex: 1;">
                                            <input type="radio" name="status" value="rejected" style="display:none;" onchange="document.getElementById('scoreInput').value = 0; document.querySelectorAll('.review-opt').forEach(e=>e.classList.remove('active')); this.parentElement.querySelector('div').classList.add('active');">
                                            <div class="review-opt" style="padding: 1.5rem; border: 2px solid #e2e8f0; border-radius: 16px; text-align: center; transition:all 0.2s;">
                                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">❌</div>
                                                <div style="font-weight: 700; color:var(--text-muted);">Perlu Perbaikan</div>
                                                <small>0 Poin</small>
                                            </div>
                                        </label>
                                        <label style="cursor: pointer; flex: 1;">
                                            <input type="radio" name="status" value="approved" checked style="display:none;" onchange="document.getElementById('scoreInput').value = ${mission.points}; document.querySelectorAll('.review-opt').forEach(e=>e.classList.remove('active')); this.parentElement.querySelector('div').classList.add('active');">
                                            <div class="review-opt active" style="padding: 1.5rem; border: 2px solid var(--success); background:rgba(16, 185, 129, 0.05); border-radius: 16px; text-align: center; transition:all 0.2s;">
                                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                                                <div style="font-weight: 700; color:var(--success);">Lulus & Valid</div>
                                                <small>${mission.points} Poin</small>
                                            </div>
                                        </label>
                                    </div>

                                    <input type="hidden" name="score" id="scoreInput" value="${mission.points}">

                                    <div class="form-group">
                                        <label style="font-weight: 700; color: #1e293b;">Catatan Evaluasi / Feedback (Opsional)</label>
                                        <textarea name="review_note" placeholder="Berikan semangat atau saran perbaikan..." style="min-height: 80px; border-radius: 12px; border: 2px solid #e2e8f0; padding: 1rem; width:100%;"></textarea>
                                    </div>

                                    <div class="form-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                                        <button type="button" class="btn" onclick="closeModal()" style="background: transparent; color: var(--text-muted); font-weight: 600;">Kembali</button>
                                        <button type="submit" class="btn btn-primary" style="padding: 1rem 3rem; border-radius: 15px; font-weight: 700; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">Kirim Keputusan ✨</button>
                                    </div>
                                </form>
                            </div>
                            <style>
                                .review-opt.active { border-color: var(--primary) !important; background: rgba(99, 102, 241, 0.05) !important; color: var(--primary) !important; transform: translateY(-2px); box-shadow: var(--shadow-sm); }
                                .review-opt:hover { border-color: #cbd5e1; }
                            </style>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat detail pemeriksaan", "error");
        }
    }

    static async handleReviewSubmit(e, id, missionPoints) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.score = parseInt(data.score);

        try {
            await API.reviewSubmission(id, data);
            showToast("Ulasan berhasil dikirim ✨");
            closeModal();
            DosenController.renderSubmissions();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    // ==========================
    // MODULE: STUDENT MONITORING
    // ==========================
    // ==========================
    // MODULE: MARKETPLACE MANAGEMENT (Moved from Admin)
    // ==========================
    static async renderProducts(activeTab = 'catalog') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="tab-header" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
                    <button class="tab-btn ${activeTab === 'catalog' ? 'active' : ''}" onclick="DosenController.renderProducts('catalog')">Katalog Produk</button>
                    <button class="tab-btn ${activeTab === 'sales' ? 'active' : ''}" onclick="DosenController.renderProducts('sales')">Riwayat Penjualan</button>
                </div>
                <div id="tabContent"></div>
            </div>
            <style>
                .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 8px; transition: 0.3s; }
                .tab-btn.active { background: var(--primary-bg); color: var(--primary); }
                .tab-btn:hover:not(.active) { background: #f8fafc; color: var(--text-main); }
            </style>
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
                <button class="btn btn-primary" onclick="DosenController.showProductModal()">+ Tambah Produk</button>
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
                        <button class="btn btn-sm" onclick="DosenController.showProductModal(${p.id})" style="margin-right:0.5rem;">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="DosenController.deleteProduct(${p.id})">🗑️</button>
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

    static async showProductModal(id = null) {
        let product = null;
        if (id) {
            try {
                const res = await API.request(`/dosen/products/${id}`, 'GET');
                product = res.data;
            } catch (e) { console.error(e); }
        }
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>${id ? '🛠️ Edit' : '🎁 Baru'}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="productForm" onsubmit="DosenController.handleProductSubmit(event, ${id})">
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
        const endpoint = id ? `/dosen/products/${id}` : '/dosen/products';
        const method = id ? 'PUT' : 'POST';

        try {
            await API.request(endpoint, method, formData);
            closeModal(); DosenController.renderProducts('catalog'); showToast("Selesai");
        } catch (e) { showToast(e.message, "error"); }
    }

    static async deleteProduct(id) {
        if (!confirm('Hapus?')) return;
        try { await API.deleteProduct(id); DosenController.renderProducts('catalog'); } catch (e) { showToast(e.message, 'error'); }
    }

    // ==========================
    // MODULE: STUDENT MONITORING
    // ==========================
    static async renderStudents() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem;">
                    <h2 style="font-weight: 700; color: var(--text-main);">Pemantauan Mahasiswa</h2>
                    <p style="color: var(--text-muted);">Pantau keaktifan dan saldo poin mahasiswa</p>
                </div>

                <div class="table-wrapper">
                    <table class="premium-table" id="studentsTable">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>NIM/NIP</th>
                                <th>Saldo Point</th>
                                <th>Status</th>
                                <th class="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Mengumpulkan data mahasiswa...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const res = await API.getStudents({ role: 'mahasiswa' });
            const students = res.data.users || [];
            const tbody = document.querySelector('#studentsTable tbody');

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada data mahasiswa.</td></tr>';
                return;
            }

            tbody.innerHTML = students.map(s => `
                <tr class="fade-in-item">
                    <td>
                        <div style="font-weight: 700; color: var(--text-main);">${s.full_name}</div>
                        <small style="color: var(--text-muted);">${s.email}</small>
                    </td>
                    <td><code>${s.nim_nip}</code></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary);">
                            💎 ${s.balance?.toLocaleString() || 0}
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-success">${s.status}</span>
                    </td>
                    <td class="text-right">
                        <small style="color: var(--text-muted);">Monitoring Saja</small>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            showToast("Gagal memuat data mahasiswa", "error");
        }
    }

}
