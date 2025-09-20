export class CustomCursor {
  private cursor: HTMLElement;
  private isHovering = false;

  constructor() {
    this.cursor = this.createCursor();
    this.init();
  }

  private createCursor(): HTMLElement {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    return cursor;
  }

  private init(): void {
    // Hide default cursor
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    // Add mouse move listener
    document.addEventListener('mousemove', (e) => {
      this.cursor.style.left = `${e.clientX}px`;
      this.cursor.style.top = `${e.clientY}px`;
    });

    // Add hover listeners for interactive elements
    this.addHoverListeners();
  }

  private addHoverListeners(): void {
    const interactiveElements = 'a, button, [role="button"], .project-card, .scroll-arrow';
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveElements)) {
        this.setHovering(true);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveElements)) {
        this.setHovering(false);
      }
    });
  }

  private setHovering(hovering: boolean): void {
    this.isHovering = hovering;
    this.cursor.classList.toggle('hovering', hovering);
  }

  public destroy(): void {
    this.cursor.remove();
    document.body.style.cursor = 'auto';
    document.documentElement.style.cursor = 'auto';
  }
}