/* Reveal the co-op ribbon bars once, left to right.
   The bars are the page's signature; everything else stays still.
   gate.js calls this after the page content is on screen. */
window.initRibbon = function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  var segs = document.querySelectorAll(".seg__bar");
  if (!segs.length) return;

  segs.forEach(function (bar, i) {
    bar.style.transform = "scaleX(0)";
    bar.style.transition = "transform .55s cubic-bezier(.22,.61,.36,1)";
    window.setTimeout(function () {
      bar.style.transform = "scaleX(1)";
    }, 220 + i * 130);
  });

  // Hand control back to the stylesheet's hover rules once the intro is done.
  window.setTimeout(function () {
    segs.forEach(function (bar) {
      bar.style.transition = "";
      bar.style.transform = "";
    });
  }, 220 + segs.length * 130 + 600);
};
