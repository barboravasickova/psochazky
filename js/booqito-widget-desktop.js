(function () {
  var DESKTOP_BREAKPOINT = 900;
  var widgetSelector = ".booqito-widget-wrap .sccz-widget";
  var targetHeight = null;
  var isFullscreen = false;
  var styleObserver = null;
  var applyTimer = null;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function getWidget() {
    return document.querySelector(widgetSelector);
  }

  function getIframe(widget) {
    return widget ? widget.querySelector("iframe") : null;
  }

  function shouldApply() {
    return isDesktop() && !isFullscreen && targetHeight !== null;
  }

  function clearAppliedHeight() {
    var widget = getWidget();
    var iframe = getIframe(widget);
    if (!widget) return;

    ["height", "min-height", "max-height", "overflow"].forEach(function (prop) {
      widget.style.removeProperty(prop);
    });

    if (iframe) {
      ["height", "min-height", "max-height", "overflow"].forEach(function (prop) {
        iframe.style.removeProperty(prop);
      });
    }
  }

  function applyHeight() {
    if (!shouldApply()) return;

    var widget = getWidget();
    var iframe = getIframe(widget);
    if (!widget || !iframe) return;

    var height = Math.ceil(targetHeight) + 4 + "px";
    iframe.setAttribute("scrolling", "no");

    iframe.style.setProperty("height", height, "important");
    iframe.style.setProperty("min-height", height, "important");
    iframe.style.setProperty("max-height", height, "important");
    iframe.style.setProperty("overflow", "hidden", "important");

    widget.style.setProperty("height", height, "important");
    widget.style.setProperty("min-height", height, "important");
    widget.style.setProperty("overflow", "hidden", "important");
  }

  function scheduleApply() {
    applyHeight();
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyHeight, 50);
    requestAnimationFrame(function () {
      requestAnimationFrame(applyHeight);
    });
  }

  function ensureStyleObserver() {
    var iframe = getIframe(getWidget());
    if (!iframe || styleObserver) return;

    styleObserver = new MutationObserver(scheduleApply);
    styleObserver.observe(iframe, { attributes: true, attributeFilter: ["style"] });
  }

  function onIframeInserted() {
    var iframe = getIframe(getWidget());
    if (!iframe) return;
    iframe.setAttribute("scrolling", "no");
    ensureStyleObserver();
    scheduleApply();
  }

  function watchIframe() {
    var widget = getWidget();
    if (!widget) return;

    if (getIframe(widget)) onIframeInserted();

    new MutationObserver(function () {
      if (getIframe(widget)) onIframeInserted();
    }).observe(widget, { childList: true, subtree: true });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var iframe = getIframe(getWidget());
    if (iframe && iframe.contentWindow !== event.source) return;

    targetHeight = data.height;
    isFullscreen = !!data.fullscreen;

    if (isFullscreen) {
      clearAppliedHeight();
      return;
    }

    ensureStyleObserver();
    scheduleApply();
  });

  window.addEventListener("resize", function () {
    if (shouldApply()) scheduleApply();
  });

  watchIframe();
})();
