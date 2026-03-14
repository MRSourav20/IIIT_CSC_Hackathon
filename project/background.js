chrome.runtime.onInstalled.addListener(() => {
  console.log('AntiGravity AI Co-Pilot Extension Installed.');
});

// Central message hub for extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOG_FORM_FIELD') {
    console.log('Form field logged in background:', message.data);
    // Future integrations (e.g cloud backup) will go here.
    sendResponse({ status: 'success' });
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ status: 'active' });
  } else if (message.type === 'OPEN_LINK') {
    chrome.tabs.create({ url: message.url });
  }
});
