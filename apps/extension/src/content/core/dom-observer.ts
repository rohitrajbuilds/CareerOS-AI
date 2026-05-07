function observeRoot(root: Node, observer: MutationObserver): void {
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'placeholder',
      'value',
      'class',
      'data-automation-id',
    ],
  });
}

export function observeDocument(callback: MutationCallback): MutationObserver {
  const observer = new MutationObserver((mutations, mutationObserver) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof Element && node.shadowRoot) {
          observeRoot(node.shadowRoot, mutationObserver);
        }
      }
    }

    callback(mutations, mutationObserver);
  });

  observeRoot(document.body, observer);
  for (const element of Array.from(document.querySelectorAll('*'))) {
    if (element.shadowRoot) {
      observeRoot(element.shadowRoot, observer);
    }
  }

  return observer;
}
