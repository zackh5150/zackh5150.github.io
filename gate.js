/* The site is unlisted and kept away from scrapers.
 *
 * In the built site (dist/), index.html holds only a one-click gate; the real
 * page ships base64-encoded in content.js and is rendered only after a genuine
 * click (isTrusted), so crawlers, AI bots, and email harvesters reading the raw
 * HTML get nothing. The email address is assembled here at runtime and never
 * appears in the markup, and the résumés are served from base64 text files, so
 * no plain PDF sits in the public repo for search engines to index.
 *
 * Opened from src/ directly (local preview), there is no gate: this just wires
 * up the email links and starts the ribbon animation.
 */
(function () {
  "use strict";
  var KEY = "zh-site-open";

  function bytes(b64) {
    var bin = atob(b64.trim());
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function wireMail(scope) {
    scope.querySelectorAll("a[data-u][data-d]").forEach(function (a) {
      var addr = a.getAttribute("data-u") + "@" + a.getAttribute("data-d");
      a.href = "mailto:" + addr;
      a.querySelectorAll(".js-addr").forEach(function (t) { t.textContent = addr; });
    });
  }

  function wireResumes(scope) {
    scope.querySelectorAll("a[data-pdf]").forEach(function (a) {
      var ready = fetch("r/" + a.getAttribute("data-pdf") + ".txt")
        .then(function (r) {
          if (!r.ok) throw new Error("résumé " + r.status);
          return r.text();
        })
        .then(function (b64) {
          var blob = new Blob([bytes(b64)], { type: "application/pdf" });
          a.href = URL.createObjectURL(blob);
          a.download = a.getAttribute("data-name");
        });
      a.addEventListener("click", function (e) {
        if (a.href.indexOf("blob:") === 0) return; // ready: the browser downloads it
        e.preventDefault();
        ready.then(function () { a.click(); });
      });
    });
  }

  function open(site) {
    site.innerHTML = new TextDecoder().decode(bytes(window.__SITE__));
    site.hidden = false;
    var gate = document.getElementById("gate");
    if (gate) gate.parentNode.removeChild(gate);
    wireMail(site);
    wireResumes(site);
    if (window.initRibbon) window.initRibbon();
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      // Deferred, and instant: the page's smooth scrolling otherwise loses to
      // the browser's own scroll restoration and the jump never lands. (A timer
      // rather than requestAnimationFrame, which never fires in a background tab.)
      if (target) setTimeout(function () {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }, 0);
    }
    try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* private mode */ }
  }

  var site = document.getElementById("site");
  if (!site || !window.__SITE__) {
    wireMail(document);
    if (window.initRibbon) window.initRibbon();
    return;
  }

  var remembered = false;
  try { remembered = sessionStorage.getItem(KEY) === "1"; } catch (e) { /* private mode */ }
  if (remembered) {
    open(site);
    return;
  }
  document.getElementById("gate-open").addEventListener("click", function (e) {
    if (!e.isTrusted) return; // clicks synthesized by a script don't count
    open(site);
  });
})();
