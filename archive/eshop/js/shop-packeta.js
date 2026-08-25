(function () {
  function isReady() {
    return (
      typeof window.Packeta !== "undefined" &&
      window.Packeta.Widget &&
      typeof window.Packeta.Widget.pick === "function"
    );
  }

  function formatBranchLabel(point) {
    if (!point) return "";
    var parts = [];
    if (point.place) parts.push(point.place);
    if (point.street) parts.push(point.street);
    var locality = [point.zip, point.city].filter(Boolean).join(" ");
    if (locality) parts.push(locality);
    if (parts.length) return parts.join(", ");
    return point.name || "";
  }

  function branchFromPoint(point) {
    if (!point || !point.id) return null;
    return {
      id: String(point.id),
      name: point.name || "",
      place: point.place || "",
      street: point.street || "",
      city: point.city || "",
      zip: point.zip || "",
      country: point.country || "",
      label: formatBranchLabel(point),
    };
  }

  function openPicker(apiKey, options, onSelect) {
    if (!apiKey) {
      if (onSelect) onSelect(null, new Error("missing-api-key"));
      return;
    }
    if (!isReady()) {
      if (onSelect) onSelect(null, new Error("widget-not-loaded"));
      return;
    }

    var opts = Object.assign({ country: "cz", language: "cs" }, options || {});

    Packeta.Widget.pick(
      apiKey,
      function (point) {
        if (!point) {
          if (onSelect) onSelect(null);
          return;
        }
        if (point.error) {
          if (onSelect) onSelect(null, new Error("branch-unavailable"));
          return;
        }
        if (onSelect) onSelect(branchFromPoint(point));
      },
      opts
    );
  }

  window.ShopPacketa = {
    isReady: isReady,
    formatBranchLabel: formatBranchLabel,
    branchFromPoint: branchFromPoint,
    openPicker: openPicker,
  };
})();
