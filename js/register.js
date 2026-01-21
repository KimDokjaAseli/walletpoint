document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset messages
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');
            errorMessage.textContent = '';
            successMessage.textContent = '';

            const fullName = document.getElementById('fullName').value;
            const nimNip = document.getElementById('nimNip').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Simple validation
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Konfirmasi kata sandi tidak cocok.';
                errorMessage.classList.remove('hidden');
                return;
            }

            if (password.length < 6) {
                errorMessage.textContent = 'Kata sandi minimal 6 karakter.';
                errorMessage.classList.remove('hidden');
                return;
            }

            try {
                // Disable button
                const btn = registerForm.querySelector('button');
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.textContent = 'Memproses...';

                const response = await API.register({
                    full_name: fullName,
                    nim_nip: nimNip,
                    email: email,
                    password: password
                });

                // Show success message
                successMessage.textContent = response.message || 'Pendaftaran berhasil! Mengalihkan ke halaman login...';
                successMessage.classList.remove('hidden');

                // Reset form
                registerForm.reset();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                errorMessage.textContent = error.message || 'Terjadi kesalahan saat mendaftar.';
                errorMessage.classList.remove('hidden');

                // Re-enable button
                const btn = registerForm.querySelector('button');
                btn.disabled = false;
                btn.textContent = 'Daftar Sekarang';
            }
        });
    }
});
