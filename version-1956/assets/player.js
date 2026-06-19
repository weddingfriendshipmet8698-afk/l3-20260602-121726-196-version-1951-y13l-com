import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    const trigger = player.querySelector("[data-play-trigger]");
    const video = player.querySelector("video[data-video-url]");
    const status = player.querySelector("[data-player-status]");
    let hlsInstance = null;

    if (!trigger || !video) {
      return;
    }

    prepareHlsPlayback(video, status, function (instance) {
      hlsInstance = instance;
    });

    trigger.addEventListener("click", function () {
      trigger.classList.add("is-hidden");
      playVideo(video, status);
    });

    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});

function prepareHlsPlayback(video, status, onInstanceReady) {
  const sourceUrl = video.dataset.videoUrl;

  if (!sourceUrl) {
    setStatus(status, "当前影片缺少播放源");
    return;
  }

  setStatus(status, "播放源准备中...");

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    onInstanceReady(hls);
    hls.loadSource(sourceUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(status, "点击播放即可观看");
    });

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(status, "网络异常，正在重新加载...");
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(status, "媒体错误，正在恢复...");
        hls.recoverMediaError();
        return;
      }

      setStatus(status, "无法加载当前播放源");
      hls.destroy();
    });

    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = sourceUrl;
    video.addEventListener("loadedmetadata", function () {
      setStatus(status, "点击播放即可观看");
    }, { once: true });
    video.addEventListener("error", function () {
      setStatus(status, "无法加载当前播放源");
    });
    return;
  }

  setStatus(status, "当前浏览器不支持 HLS 播放");
}

function playVideo(video, status) {
  const promise = video.play();

  if (promise && typeof promise.catch === "function") {
    promise.catch(function () {
      setStatus(status, "浏览器已阻止自动播放，请点击视频控制条播放");
    });
  }
}

function setStatus(target, message) {
  if (target) {
    target.textContent = message;
  }
}
