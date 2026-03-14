document.addEventListener('DOMContentLoaded', () => {
    const togglePanelBtn = document.getElementById('toggle-panel-btn');
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    const statusEl = document.getElementById('ext-status');
    const formsCountEl = document.getElementById('forms-detected');

    // Ping content script in active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    statusEl.innerText = 'Inactive on this page';
                    statusEl.className = 'status-inactive';
                } else {
                    statusEl.innerText = 'Extension active';
                    statusEl.className = 'status-active';
                    formsCountEl.innerText = response.formsDetected || 0;
                }
            });
        } else {
            statusEl.innerText = 'Restricted page';
            statusEl.className = 'status-inactive';
        }
    });

    togglePanelBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' });
            window.close();
        });
    });

    clearLogsBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_LOGS' });
        });
    });
});
