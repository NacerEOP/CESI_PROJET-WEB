document.addEventListener('DOMContentLoaded', function () {
    window.STUDENTS_DATA = window.STUDENTS_DATA || [];
    window.USER_DATA = window.USER_DATA || null;

    function loadStudentDetailsCount(studentId) {
        fetch(api('students/detail?id=' + encodeURIComponent(studentId)))
            .then(r => r.json())
            .then(data => {
                const element = document.getElementById('students-count-' + studentId);
                if (element) {
                    element.textContent = data.students_count || 0;
                }
            })
            .catch(error => console.error('Error loading student details:', error));
    }

    // no startup load required; details loaded on demand via openStudentModal

    const studentEditForm = document.getElementById('student-edit-form');
    if (studentEditForm) {
        studentEditForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const studentId = formData.get('id');
            fetch(api('students/update?id=' + studentId), { method: 'POST', body: formData })
                .then(r => { if (!r.ok) return r.json().then(data => { throw new Error(data.error || 'Failed to update student'); }); return r.json(); })
                .then(() => { alert('Student updated successfully!'); closeStudentEditModal(); location.reload(); })
                .catch(err => { console.error('Error updating student:', err); alert('Error updating student: ' + err.message); });
        });
    }

    const studentCreateForm = document.getElementById('student-create-form');
    if (studentCreateForm) {
        studentCreateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch(api('students/create'), { method: 'POST', body: formData })
                .then(r => { if (!r.ok) return r.json().then(data => { throw new Error(data.error || 'Failed to create student'); }); return r.json(); })
                .then(() => { alert('Student created successfully!'); closeCreateStudentModal(); location.reload(); })
                .catch(err => { console.error('Error creating student:', err); alert('Error creating student: ' + err.message); });
        });
    }

    document.addEventListener('click', function (e) {
        const target = e.target;
        if (!target) return;

        if (target.classList.contains('view-student')) {
            openStudentModal(target.dataset.studentId, target.dataset.studentName);
        }

        if (target.classList.contains('edit-student')) {
            openStudentEditModal(target.dataset.studentId);
        }

        if (target.classList.contains('btn-delete')) {
            const studentId = target.dataset.studentId;
            if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                const formData = new FormData();
                formData.append('id', studentId);
                fetch(api('students/delete?id=' + studentId), { method: 'POST', body: formData })
                    .then(r => {
                        if (r.status === 204) {
                            alert('Student deleted successfully!'); location.reload();
                        } else {
                            return r.json().then(data => { throw new Error(data.error || 'Failed to delete student'); });
                        }
                    })
                    .catch(err => { console.error('Error deleting student:', err); alert('Error deleting student.'); });
            }
        }
    });

    const studentModal = document.getElementById('studentModal');
    if (studentModal) {
        studentModal.addEventListener('click', function (e) {
            if (e.target === this) closeStudentModal();
        });
    }
});

window.openStudentModal = function(studentId, studentName) {
    window.currentStudentId = studentId;
    const modalTitle = document.getElementById('studentModalTitle');
    if (modalTitle) modalTitle.textContent = studentName;
    document.getElementById('studentModal').classList.add('show');
    loadStudentDetails(studentId);
};

window.closeStudentModal = function() {
    document.getElementById('studentModal').classList.remove('show');
    window.currentStudentId = null;
};

window.loadStudentDetails = function(studentId) {
    fetch(api('students/detail?id=' + encodeURIComponent(studentId)))
        .then(r => { if (!r.ok) throw new Error('Failed to load student details: ' + r.statusText); return r.json(); })
        .then(data => {
            const content = document.getElementById('studentDetailsContent');
            if (content) {
                content.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div><strong>Name:</strong> ${data.LastName}, ${data.FirstName}</div>
                        <div><strong>Email:</strong> ${data.Email}</div>
                        <div><strong>Phone:</strong> ${data.UserPhone || 'N/A'}</div>
                        <div><strong>Date of Birth:</strong> ${data.DoB}</div>
                        <div><strong>School Level:</strong> ${data.SchoolLevel || 'N/A'}</div>
                        <div><strong>School Year:</strong> ${data.SchoolYear || 'N/A'}</div>
                        <div><strong>Major:</strong> ${data.Major || 'N/A'}</div>
                        <div><strong>Pilot:</strong> ${data.PilotFirstName} ${data.PilotLastName}</div>
                        <div><strong>Join Date:</strong> ${data.JoinDate}</div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading student details:', error);
            const content = document.getElementById('studentDetailsContent');
            if (content) content.innerHTML = '<p style="color: red;">Error loading student details.</p>';
        });
};

window.openStudentEditModal = function(studentId) {
    fetch(api('students/detail?id=' + encodeURIComponent(studentId)))
        .then(r => { if (!r.ok) throw new Error('Failed to load student: ' + r.statusText); return r.json(); })
        .then(data => {
            document.getElementById('student-edit-id').value = data.IdUser;
            document.getElementById('student-edit-firstName').value = data.FirstName;
            document.getElementById('student-edit-lastName').value = data.LastName;
            document.getElementById('student-edit-email').value = data.Email;
            document.getElementById('student-edit-phone').value = data.UserPhone || '';
            document.getElementById('student-edit-dob').value = data.DoB;
            document.getElementById('student-edit-schoolLevel').value = data.SchoolLevel || '';
            document.getElementById('student-edit-schoolYear').value = data.SchoolYear || '';
            document.getElementById('student-edit-major').value = data.Major || '';
            if (window.USER_DATA && window.USER_DATA.role === 'admin') {
                document.getElementById('student-edit-pilotId').value = data.PilotId;
            }
            document.getElementById('student-edit-modal-title').textContent = 'Edit Student';
            document.getElementById('studentEditModal').classList.add('show');
        })
        .catch(error => { console.error('Error loading student for edit:', error); alert('Error loading student data.'); });
};

window.closeStudentEditModal = function() { document.getElementById('studentEditModal').classList.remove('show'); };
window.openCreateStudentModal = function() { document.getElementById('student-create-form').reset(); document.getElementById('studentCreateModal').classList.add('show'); };
window.closeCreateStudentModal = function() { document.getElementById('studentCreateModal').classList.remove('show'); };
