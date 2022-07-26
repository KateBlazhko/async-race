export function removeClassName(className: string, ...elements: HTMLElement[]) {
  for (const element of elements) {
    element.classList.remove(className);
  }
}

export function toggleClassName(className: string, ...elements: HTMLElement[]) {
  for (const element of elements) {
    element.classList.toggle(className);
  }
}

export function addClassName(className: string, ...elements: HTMLElement[]) {
  for (const element of elements) {
    element.classList.add(className);
  }
}