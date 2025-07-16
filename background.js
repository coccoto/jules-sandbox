// This script will handle browser actions triggered by gestures.
const defaultGestures = {
  'L': 'goBack',
  'R': 'goForward',
  'D': 'closeTab',
  'U': 'newTab',
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['gestures', 'enabled'], (data) => {
    if (!data.gestures) {
      chrome.storage.sync.set({ gestures: defaultGestures });
    }
    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.gesture) {
    chrome.storage.sync.get('gestures', (data) => {
      const gestures = data.gestures || defaultGestures;
      const action = gestures[request.gesture];
      if (action) {
        handleAction(action, sender.tab);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

function handleAction(action, tab) {
  switch (action) {
    case 'goBack':
      chrome.tabs.goBack(tab.id);
      break;
    case 'goForward':
      chrome.tabs.goForward(tab.id);
      break;
    case 'closeTab':
      chrome.tabs.remove(tab.id);
      break;
    case 'newTab':
      chrome.tabs.create({ index: tab.index + 1 });
      break;
    case 'reload':
      chrome.tabs.reload(tab.id);
      break;
    case 'scrollTop':
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.scrollTo(0, 0),
      });
      break;
    case 'scrollBottom':
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.scrollTo(0, document.body.scrollHeight),
      });
      break;
    default:
      console.log('Unknown action:', action);
  }
}
