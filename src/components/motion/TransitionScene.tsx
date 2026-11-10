import { gsap } from "@/lib/motion";

/*
 * The page-transition backdrop, cut from one 1376×768 render into layers
 * (see public/images/transition/): a clean background plate plus separate
 * cut-outs for the house, the apartment block, foreground trees and leaves,
 * so each can move on its own.
 */

const SCENE_W = 1376;
const SCENE_H = 768;

type Layer = { name: string; x: number; y: number; w: number; h: number };

// Positions in source pixels (from the cut-out script's manifest).
const DIORAMAS: Layer[] = [
  { name: "house", x: 0, y: 73, w: 567, h: 570 },
  { name: "city", x: 877, y: 58, w: 499, h: 608 },
];
const LEAVES: Layer[] = [
  { name: "leaf-1", x: 378, y: 144, w: 25, h: 26 },
  { name: "leaf-2", x: 470, y: 149, w: 35, h: 32 },
  { name: "leaf-3", x: 898, y: 115, w: 25, h: 20 },
  { name: "leaf-4", x: 968, y: 160, w: 21, h: 22 },
  { name: "leaf-5", x: 904, y: 202, w: 34, h: 38 },
];
const FOREGROUND: Layer[] = [
  { name: "fg-left", x: 0, y: 500, w: 275, h: 268 },
  { name: "fg-center", x: 397, y: 472, w: 509, h: 296 },
  { name: "fg-mid", x: 902, y: 628, w: 149, h: 140 },
  { name: "fg-right", x: 1261, y: 576, w: 115, h: 192 },
];

function LayerImg({ layer, className }: { layer: Layer; className: string }) {
  return (
    // Plain <img>: the curtain is visibility:hidden (not display:none) while
    // idle, so these are already loaded by the first navigation.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/transition/${layer.name}.webp`}
      alt=""
      decoding="async"
      fetchPriority="low"
      draggable={false}
      className={`scene__layer ${className}`}
      data-layer={layer.name}
      style={{
        left: `${(layer.x / SCENE_W) * 100}%`,
        top: `${(layer.y / SCENE_H) * 100}%`,
        width: `${(layer.w / SCENE_W) * 100}%`,
      }}
    />
  );
}

export function TransitionScene() {
  return (
    <div className="scene">
      {/* Depth groups move at different rates with the pointer. */}
      <div className="scene__depth" data-depth="6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="scene__plate" src="/images/transition/plate.webp" alt="" decoding="async" fetchPriority="low" />
        <div className="scene__rays" />
      </div>
      <div className="scene__depth" data-depth="20">
        {DIORAMAS.map((l) => (
          <LayerImg key={l.name} layer={l} className={`scene__diorama scene__${l.name}`} />
        ))}
        {LEAVES.map((l) => (
          <LayerImg key={l.name} layer={l} className="scene__leaf" />
        ))}
      </div>
      <div className="scene__depth" data-depth="40">
        {FOREGROUND.map((l) => (
          <LayerImg key={l.name} layer={l} className="scene__fg" />
        ))}
      </div>
    </div>
  );
}

function parts(root: Element) {
  return {
    scene: root.querySelector(".scene"),
    house: root.querySelector(".scene__house"),
    city: root.querySelector(".scene__city"),
    leaves: root.querySelectorAll(".scene__leaf"),
    fg: root.querySelectorAll(".scene__fg"),
    rays: root.querySelector(".scene__rays"),
    depths: root.querySelectorAll<HTMLElement>(".scene__depth"),
  };
}

/** Builds rise in from either side while the curtain covers the page. */
export function sceneEnter(root: Element) {
  const { scene, house, city, leaves, fg, depths } = parts(root);
  // Clear whatever the previous idle loop left behind.
  gsap.set([house, city, ...leaves, ...fg, ...depths], { x: 0, y: 0, rotation: 0 });

  return gsap
    .timeline()
    .fromTo(
      scene,
      { yPercent: -30, scale: 1.2 },
      { yPercent: 0, scale: 1.04, duration: 1.1, ease: "expo.out" },
      0
    )
    .fromTo(
      house,
      { xPercent: -28, yPercent: 18, opacity: 0 },
      { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.1, ease: "back.out(1.4)" },
      0.25
    )
    .fromTo(
      city,
      { xPercent: 28, yPercent: 18, opacity: 0 },
      { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.1, ease: "back.out(1.4)" },
      0.3
    )
    .fromTo(
      fg,
      { yPercent: 55, scale: 1.15, opacity: 0 },
      { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06 },
      0.35
    )
    .fromTo(
      leaves,
      { scale: 0, rotation: -120, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.9, ease: "back.out(2)", stagger: 0.07 },
      0.55
    );
}

/**
 * Keeps the scene alive while the next page loads: dioramas bob, trees sway,
 * leaves drift, the light rays breathe and layers follow the pointer.
 * Returns a function that stops everything.
 */
export function sceneIdle(root: Element) {
  const { house, city, leaves, fg, rays, depths } = parts(root);
  const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" } as const;

  const tweens: gsap.core.Animation[] = [
    gsap.to(house, { y: -12, rotation: -0.6, duration: 2.6, ...loop }),
    gsap.to(city, { y: -16, rotation: 0.5, duration: 3.1, delay: 0.4, ...loop }),
    gsap.to(rays, { opacity: 1, xPercent: 4, duration: 2.2, ...loop }),
    ...[...fg].map((el, i) =>
      gsap.to(el, {
        rotation: i % 2 ? -1.8 : 1.8,
        duration: 2.2 + i * 0.35,
        transformOrigin: "50% 100%",
        ...loop,
      })
    ),
    ...[...leaves].map((el, i) =>
      gsap.to(el, {
        x: gsap.utils.random(18, 46),
        y: gsap.utils.random(26, 60),
        rotation: gsap.utils.random(-160, 160),
        duration: gsap.utils.random(2.4, 3.6),
        delay: i * 0.15,
        ...loop,
      })
    ),
  ];

  const movers = [...depths].map((el) => ({
    depth: Number(el.dataset.depth) || 0,
    x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
  }));
  const onPointer = (e: PointerEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    movers.forEach((m) => {
      m.x(-nx * m.depth);
      m.y(-ny * m.depth);
    });
  };
  window.addEventListener("pointermove", onPointer);

  return () => {
    window.removeEventListener("pointermove", onPointer);
    tweens.forEach((t) => t.kill());
  };
}

/** The scene splits apart and zooms as the curtain lifts off the new page. */
export function sceneExit(root: Element) {
  const { scene, house, city, fg, leaves } = parts(root);
  const ease = "expo.inOut";
  return gsap
    .timeline()
    .to(scene, { yPercent: 30, scale: 1.15, duration: 0.85, ease }, 0)
    .to(house, { xPercent: -35, duration: 0.85, ease }, 0)
    .to(city, { xPercent: 35, duration: 0.85, ease }, 0)
    .to(fg, { yPercent: 40, duration: 0.85, ease }, 0)
    .to(leaves, { opacity: 0, scale: 0.4, duration: 0.4, ease: "power2.in" }, 0);
}
