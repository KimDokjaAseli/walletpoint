class ProfileController {
    static async renderProfile() {
        const content = document.getElementById('mainContent');
        const user = JSON.parse(localStorage.getItem('user')) || {};

        content.innerHTML = `
            <div class="profile-container" style="padding-bottom: 2rem;">
                <div class="card" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; margin-bottom: 2rem; text-align: center; background: white; border-radius: 24px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin:0; font-size: 1.5rem; font-weight: 800;">${user.full_name || 'User'}</h2>
                        <p style="margin: 0.25rem 0 0 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">${user.role.toUpperCase()} • ${user.nim_nip || 'No ID'}</p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- Basic Info -->
                    <div class="table-wrapper" style="margin:0; height: fit-content;">
                        <div class="table-header">
                            <h3>Edit Profil</h3>
                        </div>
                        <div style="padding: 1.5rem;">
                            <form id="profileForm" onsubmit="ProfileController.handleUpdateProfile(event)">
                                <div class="form-group">
                                    <label>Nama Lengkap</label>
                                    <input type="text" name="full_name" value="${user.full_name}" required>
                                </div>
                                <div class="form-group">
                                    <label>Alamat Email</label>
                                    <input type="email" value="${user.email}" disabled style="opacity: 0.6; cursor: not-allowed;">
                                    <small style="color:var(--text-muted)">Email tidak dapat diubah, hubungi admin.</small>
                                </div>
                                <div class="form-actions" style="margin-top: 1.5rem">
                                    <button type="submit" class="btn btn-primary btn-block">Perbarui Profil</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        <!-- Change Password -->
                        <div class="table-wrapper" style="margin:0">
                            <div class="table-header">
                                <h3>Ubah Kata Sandi</h3>
                            </div>
                            <div style="padding: 1.5rem;">
                                <form id="passwordForm" onsubmit="ProfileController.handleUpdatePassword(event)">
                                    <div class="form-group">
                                        <label>Kata Sandi Saat Ini</label>
                                        <input type="password" name="old_password" required placeholder="••••••••">
                                    </div>
                                    <div class="form-group">
                                        <label>Kata Sandi Baru</label>
                                        <input type="password" name="new_password" required placeholder="••••••••" minlength="6">
                                    </div>
                                    <div class="form-group">
                                        <label>Konfirmasi Kata Sandi Baru</label>
                                        <input type="password" id="confirm_password" required placeholder="••••••••" minlength="6">
                                    </div>
                                    <div class="form-actions" style="margin-top: 1.5rem">
                                        <button type="submit" class="btn btn-primary btn-block" style="background: var(--secondary)">Ubah Kata Sandi</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Change PIN -->
                        ${user.role === 'mahasiswa' ? `
                        <div class="table-wrapper" style="margin:0">
                            <div class="table-header">
                                <h3>PIN Keamanan</h3>
                            </div>
                            <div style="padding: 1.5rem;">
                                <form id="pinForm" onsubmit="ProfileController.handleUpdatePin(event)">
                                    <div class="form-group">
                                        <label>PIN Baru (6 Digit Angka)</label>
                                        <input type="password" name="pin" required placeholder="123456" pattern="[0-9]{6}" maxlength="6" inputmode="numeric">
                                    </div>
                                    <div class="form-actions" style="margin-top: 1.5rem">
                                        <button type="submit" class="btn btn-primary btn-block" style="background: var(--primary)">Perbarui PIN</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                    <button onclick="API.logout()" class="btn btn-block" 
                        style="background: #fee2e2; color: var(--error); padding: 1rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <span>🚪</span> Keluar dari Aplikasi
                    </button>
                    <p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 1rem;">
                        Versi 2.5.0 • WalletPoint Mobile
                    </p>
                </div>
            </div>
        `;
    }

    static async handleUpdateProfile(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.updateProfile(data);
            showToast("Profil berhasil diperbarui");

            // Update local storage
            const user = JSON.parse(localStorage.getItem('user'));
            user.full_name = res.data.full_name;
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI sidebar
            updateUserProfile(user);
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    static async handleUpdatePassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const confirm = document.getElementById('confirm_password').value;

        if (data.new_password !== confirm) {
            showToast("Kata sandi tidak cocok", "error");
            return;
        }

        try {
            await API.updatePassword(data);
            showToast("Kata sandi berhasil diperbarui");
            e.target.reset();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    static async handleUpdatePin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await API.updatePin(data);
            showToast("PIN Keamanan berhasil diperbarui", "success");
            e.target.reset();
        } catch (error) {
            showToast(error.message, "error");
        }
    }
}
