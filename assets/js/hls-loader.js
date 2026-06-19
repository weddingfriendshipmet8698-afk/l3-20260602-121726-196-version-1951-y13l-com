(function () {
  if (window.Hls || window.HlsLoading) {
    return;
  }
  window.HlsLoading = new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = "./assets/js/hls.js";
    script.async = true;
    script.onload = function () {
      resolve(window.Hls);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
})();
