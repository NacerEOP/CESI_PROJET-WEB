document.addEventListener('DOMContentLoaded', function () {
    const bugForm = document.getElementById('bug-report-form');
    if (!bugForm) return;

    bugForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        alert('Thank you for your bug report! We will investigate and get back to you soon.');
        this.reset();
    });
});