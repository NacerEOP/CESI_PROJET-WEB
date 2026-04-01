(function() {
    console.log('app-config.js starting');
    const configScript = document.getElementById('app-config-data');
    let baseUrl = '';

    if (configScript && configScript.textContent) {
        try {
            const parsed = JSON.parse(configScript.textContent);
            baseUrl = parsed.baseUrl || '';
            console.log('parsed baseUrl:', baseUrl);
        } catch (e) {
            console.warn('Invalid app config JSON', e);
        }
    }

    window.APP_BASE_URL = baseUrl.replace(/\/+$/, '');
    window.APP_API_URL = (window.APP_BASE_URL.length ? window.APP_BASE_URL : '') + '/api';
    window.api = function (path) {
        const cleaned = (path || '').toString().replace(/^\/+/, '');
        return window.APP_API_URL.replace(/\/+$/, '') + '/' + cleaned;
    };
    console.log('app-config.js done, api defined:', typeof window.api, 'APP_API_URL:', window.APP_API_URL);
})();