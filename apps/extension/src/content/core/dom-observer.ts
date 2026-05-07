export function observeDocument(callback: MutationCallback): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
  return observer;
}
