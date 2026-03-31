document.addEventListener('DOMContentLoaded', function () {
    const editForm = document.getElementById('internship-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const internshipId = document.getElementById('internship-edit-id').value;
            const fd = new FormData(editForm);
            const body = new URLSearchParams(fd);

            fetch(api('internships/update?id=' + encodeURIComponent(internshipId)), {
                method: 'POST',
                body: body
            }).then(res => {
                if (!res.ok) {
                    return res.text().then(txt => { throw new Error(txt || 'Failed to update internship'); });
                }
                return res.json();
            }).then(data => {
                alert('Internship updated successfully!');
                closeInternshipEditModal();
                window.location.reload();
            }).catch(err => alert('Error: ' + err.message));
        });
    }

    const form = document.getElementById('internship-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const fd = new FormData(form);
            const body = new URLSearchParams(fd);

            fetch(api('internships/create'), {
                method: 'POST',
                body: body
            }).then(res => {
                if (!res.ok) {
                    return res.text().then(txt => { throw new Error(txt || 'Failed to create internship'); });
                }
                return res.json();
            }).then(data => {
                alert('Internship created successfully!');
                closeCreateInternshipModal();
                window.location.reload();
            }).catch(err => alert('Error: ' + err.message));
        });
    }

    const createModal = document.getElementById('internshipCreateModal');
    if (createModal) {
        createModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeCreateInternshipModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeInternshipEditModal();
            closeCreateInternshipModal();
        }
    });
});

window.openInternshipEditModal = function(id) {
    fetch(api('internships/detail?id=' + encodeURIComponent(id)))
        .then(r => { if (!r.ok) throw new Error('Failed to load internship details'); return r.json(); })
        .then(internship => {
            document.getElementById('internship-edit-id').value = internship.IdInternship;
            document.getElementById('internship-edit-title').value = internship.Title;
            document.getElementById('internship-edit-description').value = internship.Description || '';
            document.getElementById('internship-edit-company').value = internship.IdCompany;
            document.getElementById('internship-edit-category').value = internship.Id_Category;
            document.getElementById('internship-edit-date').value = internship.DateOfCreation || '';
            document.getElementById('internship-edit-budget').value = internship.Budget || 0;
            document.getElementById('internship-edit-time').value = internship.Time_ || 1;
            document.getElementById('internshipEditModal').classList.add('show');
        })
        .catch(err => alert('Error loading internship: ' + err.message));
};

window.closeInternshipEditModal = function() {
    document.getElementById('internshipEditModal').classList.remove('show');
};

window.internshipDelete = function(id) {
    if (!confirm('Are you sure you want to delete this internship position?')) return;

    fetch(api('internships/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + encodeURIComponent(id)
    })
    .then(r => {
        if (r.status === 204) {
            alert('Internship deleted successfully');
            window.location.reload();
        } else {
            return r.text().then(txt => { throw new Error(txt); });
        }
    })
    .catch(err => alert('Error: ' + err.message));
};

window.openCreateInternshipModal = function() {
    document.getElementById('internshipCreateModal').classList.add('show');
};

window.closeCreateInternshipModal = function() {
    document.getElementById('internshipCreateModal').classList.remove('show');
};