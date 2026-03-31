function viewLM(internshipId, userId) {
    fetch(`${window.APP_BASE_URL || ''}/static/uploads/lm_${internshipId}_${userId}.txt`)
        .then(r => {
            if (!r.ok) throw new Error('LM not found');
            return r.text();
        })
        .then(text => alert(text))
        .catch(() => alert('LM not found.'));
}

window.viewLM = viewLM;