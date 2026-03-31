window.toggleStudentFields = function() {
    const role = document.getElementById('role').value;
    const studentFields = document.getElementById('studentFields');
    if (!studentFields) return;
    studentFields.style.display = role === 'student' ? 'block' : 'none';
};

document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
        roleSelect.addEventListener('change', window.toggleStudentFields);
        window.toggleStudentFields();
    }
});