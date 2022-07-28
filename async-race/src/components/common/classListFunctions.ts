export function removeClassName<NodeType extends HTMLElement = HTMLElement>(className: string, ...elements: NodeType[]) {
  for (const element of elements) {
    element.classList.remove(className);
  }
}

export function toggleClassName<NodeType extends HTMLElement = HTMLElement>(className: string, ...elements: NodeType[]) {
  for (const element of elements) {
    element.classList.toggle(className);
  }
}

export function addClassName<NodeType extends HTMLElement = HTMLElement>(className: string, ...elements: NodeType[]) {
  for (const element of elements) {
    element.classList.add(className);
  }
}