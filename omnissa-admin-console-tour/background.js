// Toolbar button: clicking it turns explain mode (hover descriptions) on or off on the active console tab.
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { type: "toggle-explain" }).catch(() => {});
  }
});
