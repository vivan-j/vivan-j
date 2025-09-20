export class PageAnimations {
  private mainContent: HTMLElement | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    gsap.registerPlugin(ScrollTrigger);

    this.mainContent = document.querySelector('.container');
    if (!this.mainContent) return;

    // Make content visible and animate on scroll
    gsap.set(this.mainContent, { opacity: 1 });
    gsap.set(this.mainContent.children, { opacity: 0, y: 50 });
    
    gsap.to(this.mainContent.children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: this.mainContent,
        start: 'top 90%',
        once: true
      }
    });
  }
}