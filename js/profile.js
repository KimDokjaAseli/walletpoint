class ProfileController {
    static async renderProfile() {
        const content = document.getElementById('mainContent');
        const user = JSON.parse(localStorage.getItem('user')) || {};

        content.innerHTML = `
            <div class="profile-container" style="max-width: 800px; margin: 0 auto;">
                <div class="stat-card card-gradient-1 hero-flex" style="padding: 2.5rem; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; background: rgba(255,255,255,0.2);">
                            ${(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style="color: white">
                            <h2 style="margin:0; font-size: 1.75rem;">${user.full_name || 'User'}</h2>
                            <p style="margin:0; opacity: 0.8; font-size: 1rem;">${user.role.toUpperCase()} • ${user.nim_nip || 'No ID'}</p>
                        </div>
                    </div>
                </div>

                <div class="grid-2-col">
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
                    </div>
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
