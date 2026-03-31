document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('application-form');
    const messageDiv = document.getElementById('app-message');

    if (!form || !messageDiv) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const file = form.querySelector('input[name="cv"]').files[0];
        if (!file) {
            messageDiv.innerHTML = '<div class="alert error"><p style="margin: 0;">Please select a CV file</p></div>';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            messageDiv.innerHTML = '<div class="alert error"><p style="margin: 0;">File is too large (max 5 MB)</p></div>';
            return;
        }

        const formData = new FormData(form);
        fetch(`${window.APP_BASE_URL || ''}/upload-cv`, { method: 'POST', body: formData })
            .then(res => res.text())
            .then(message => {
                if (message.includes('success') || message.includes('successfully')) {
                    messageDiv.innerHTML = '<div class="alert success"><p style="margin: 0;">✓ Application submitted successfully!</p></div>';
                    form.reset();
                } else {
                    messageDiv.innerHTML = '<div class="alert error"><p style="margin: 0;">❌ ' + message + '</p></div>';
                }
            })
            .catch(err => {
                messageDiv.innerHTML = '<div class="alert error"><p style="margin: 0;">Error: ' + err.message + '</p></div>';
            });
    });
});