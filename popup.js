document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabled-checkbox');

  // Load the current enabled state
  chrome.storage.sync.get('enabled', (data) => {
    enabledCheckbox.checked = !!data.enabled;
  });

  // Save the enabled state when the checkbox is changed
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enabledCheckbox.checked });
  });
});
