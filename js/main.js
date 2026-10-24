
(() => {
  const hero = document.querySelector("[data-cinematic-hero]");
  if (!hero) return;

  const stage = hero.querySelector("[data-hero-stage]");
  const center = hero.querySelector(".tile-center");
  const chrome = hero.querySelectorAll("[data-hero-chrome]");
  const caption = hero.querySelector(".hero-progress-caption");

  if (!stage || !center) return;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  const smooth = (value) => {
    const p = clamp01(value);
    return p * p * (3 - 2 * p);
  };

  let startRect = null;
  let ticking = false;
  let resizeObserver = null;

  function measure() {
    const previousTransform = center.style.transform;
    const previousOrigin = center.style.transformOrigin;

    center.style.transform = "none";
    center.style.transformOrigin = "top left";

    startRect = center.getBoundingClientRect();

    center.style.transform = previousTransform;
    center.style.transformOrigin = previousOrigin;

    update();
  }

  function update() {
    if (!startRect || ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      const heroTop =
        hero.getBoundingClientRect().top + window.scrollY;

      const runway = Math.max(
        1,
        hero.offsetHeight - stage.offsetHeight
      );

      const progress = clamp01(
        (window.scrollY - heroTop) / runway
      );

      const expansion = smooth(
        clamp01(progress / 0.82)
      );

      const dx = -startRect.left * expansion;
      const dy = -startRect.top * expansion;

      const scaleX =
        1 +
        (
          stage.clientWidth / Math.max(1, startRect.width) - 1
        ) * expansion;

      const scaleY =
        1 +
        (
          stage.clientHeight / Math.max(1, startRect.height) - 1
        ) * expansion;

      center.style.transformOrigin = "top left";
      center.style.transform =
        `translate3d(${dx}px, ${dy}px, 0) ` +
        `scale(${scaleX}, ${scaleY})`;

      hero.dataset.heroProgress =
        progress < 0.35 ? "0" :
        progress < 0.78 ? "1" : "2";

      const fade = 1 - smooth(progress / 0.48);

      chrome.forEach((element) => {
        element.style.opacity = String(fade);
        element.style.pointerEvents =
          progress > 0.45 ? "none" : "";
      });

      if (caption) {
        const captionProgress = smooth(
          clamp01((progress - 0.35) / 0.35)
        );

        caption.style.opacity = String(captionProgress);
        caption.style.transform =
          `translate(-50%, ${12 - captionProgress * 12}px)`;
      }

      hero.querySelectorAll(
        ".collage-tile:not(.tile-center)"
      ).forEach((tile, index) => {
        const direction = index % 2 === 0 ? -1 : 1;

        tile.style.opacity = String(
          1 - smooth(clamp01(progress / 0.65))
        );

        tile.style.transform =
          `translate3d(${direction * progress * 20}px, ` +
          `${direction * progress * 12}px, 0)`;
      });

      ticking = false;
    });
  }

  window.addEventListener("scroll", update, {
    passive: true
  });

  window.addEventListener("resize", measure, {
    passive: true
  });

  window.addEventListener("load", measure, {
    once: true
  });

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      measure();
    });

    resizeObserver.observe(stage);
    resizeObserver.observe(center);
  }

  measure();
})();
