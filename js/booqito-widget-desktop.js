(function () {
  var DESKTOP_BREAKPOINT = 900;
  var FIXED_HEIGHT = "2200px";
  var widgetSelector = ".booqito-widget-wrap .sccz-widget";

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function getWidget() {
    return document.querySelector(widgetSelector);
  }

  function applyFixedHeight() {
    if (!isDesktop()) return;

    var widget = getWidget();
    if (!widget) return;
    var iframe = widget.querySelector("iframe");
    if (!iframe) return;

    widget.style.setProperty("height", FIXED_HEIGHT, "important");
    widget.style.setProperty("min-height", FIXED_HEIGHT, "important");
    iframe.style.setProperty("height", FIXED_HEIGHT, "important");
    iframe.style.setProperty("min-height", FIXED_HEIGHT, "important");
  }

  function clearFixedHeight() {
    var widget = getWidget();
    if (!widget) return;
    var iframe = widget.querySelector("iframe");

    widget.style.removeProperty("height");
    widget.style.removeProperty("min-height");
    if (iframe) {
      iframe.style.removeProperty("height");
      iframe.style.removeProperty("min-height");
    }
  }

  function watchIframe() {
    var widget = getWidget();
    if (!widget) return;

    if (widget.querySelector("iframe")) applyFixedHeight();

    new MutationObserver(function () {
      if (widget.querySelector("iframe")) applyFixedHeight();
    }).observe(widget, { childList: true, subtree: true });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var iframe = getWidget() && getWidget().querySelector("iframe");
    if (iframe && iframe.contentWindow !== event.source) return;

    if (data.fullscreen) {
      clearFixedHeight();
    } else {
      applyFixedHeight();
    }
  });

  window.addEventListener("resize", applyFixedHeight);
  watchIframe();
})();
