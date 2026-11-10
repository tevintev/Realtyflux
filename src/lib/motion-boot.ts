// Runs inline in <head> before first paint. The `motion` class on <html> is
// what hides animated elements until GSAP reveals them, so it is only added
// for visitors who haven't asked for reduced motion, and never in /admin.
export const MOTION_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(!location.pathname.startsWith("/admin")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("motion")}}catch(e){}})();`;
