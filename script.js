(() => {
  "use strict";

  const REPOSITORY = "ThisWasAryan/MotoBudsDesktopUtility";
  const REPO_URL = `https://github.com/${REPOSITORY}`;
  const RELEASES_URL = `${REPO_URL}/releases/latest`;
  const API_ROOT = `https://api.github.com/repos/${REPOSITORY}`;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const header = $("[data-header]");
  const navToggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");

  const setHeaderState = () => header?.classList.toggle("scrolled", window.scrollY > 12);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    $(".sr-only", navToggle).textContent = "Open navigation";
  };

  navToggle?.addEventListener("click", () => {
    const shouldOpen = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(shouldOpen));
    nav?.classList.toggle("open", shouldOpen);
    $(".sr-only", navToggle).textContent = shouldOpen ? "Close navigation" : "Open navigation";
  });

  if (nav) $$('a[href^="#"]', nav).forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("click", (event) => {
    if (nav?.classList.contains("open") && !nav.contains(event.target) && !navToggle?.contains(event.target)) closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      closeNav();
      navToggle?.focus();
    }
  });

  const platformString = `${navigator.userAgentData?.platform || ""} ${navigator.platform || ""} ${navigator.userAgent || ""}`.toLowerCase();
  const detectedPlatform = platformString.includes("win") ? "windows" : platformString.includes("linux") ? "linux" : "other";
  const detectedText = $("[data-detected-platform] span");
  const allGroups = $$(".package-platform");
  
  if (detectedPlatform !== "other") {
    let hasHidden = false;
    if (allGroups.length > 0) {
      const container = allGroups[0].parentNode;
      container.style.display = "flex";
      container.style.flexDirection = "column";
      const heading = container.querySelector(".package-heading");
      if (heading) heading.style.order = "0";

      allGroups.forEach(group => {
        if (group.dataset.platform === detectedPlatform) {
          group.classList.add("recommended");
          group.style.order = "1";
        } else {
          group.style.display = "none";
          group.classList.add("hidden-platform");
          group.style.order = "2";
          hasHidden = true;
        }
      });
    }

    if (hasHidden) {
      const showOthersBtn = document.createElement("button");
      showOthersBtn.className = "button button-secondary show-others-btn";
      showOthersBtn.innerHTML = "Show downloads for other platforms <span>↓</span>";
      showOthersBtn.style.margin = "20px auto 0";
      showOthersBtn.style.display = "flex";
      showOthersBtn.style.order = "3";
      
      showOthersBtn.addEventListener("click", () => {
        $$(".hidden-platform").forEach(g => {
          g.style.display = "block";
          g.style.animation = "dialog-in 0.3s ease";
        });
        showOthersBtn.style.display = "none";
      });
      
      const packageSection = $(".package-section .shell");
      if (packageSection) packageSection.appendChild(showOthersBtn);
    }
  } else {
    allGroups.forEach(group => group.classList.add("recommended"));
  }

  if (detectedText) {
    detectedText.textContent = detectedPlatform === "windows"
      ? "Windows detected. The installer is highlighted."
      : detectedPlatform === "linux"
        ? "Linux detected. Choose your preferred package."
        : "All available desktop packages";
  }

  const screenshotData = {
    overview: {
      file: "overview", width: 1252, height: 923, label: "Device overview", index: "01 / 07",
      title: "Device status at a glance",
      copy: "Check each battery, current noise control mode, charging state, and enabled sound features from the main dashboard.",
      alt: "Moto Buds dashboard with battery and noise control information"
    },
    sound: {
      file: "sound", width: 1252, height: 924, label: "Sound controls", index: "01 / 06",
      title: "Sound controls at a glance",
      copy: "Noise control, Hi Res Audio, Game Mode, and Volume Booster are available from one screen.",
      alt: "Sound controls in Moto Buds Desktop Utility"
    },
    equalizer: {
      file: "equalizer", width: 1249, height: 920, label: "10-band equalizer", index: "02 / 06",
      title: "Tune the details",
      copy: "Start with a preset or shape ten frequency bands individually, then hear the change directly on your earbuds.",
      alt: "Custom equalizer controls in Moto Buds Desktop Utility"
    },
    gestures: {
      file: "gestures", width: 1249, height: 923, label: "Gesture configuration", index: "03 / 06",
      title: "Every tap, reassigned",
      copy: "Set double tap, triple tap, and press and hold actions independently for the left and right earbuds.",
      alt: "Earbud gesture configuration in Moto Buds Desktop Utility"
    },
    find: {
      file: "find-device", width: 1249, height: 925, label: "Find My Device", index: "04 / 06",
      title: "Find a missing earbud",
      copy: "Ring either side independently. The in ear safety check helps protect your hearing.",
      alt: "Find My Device controls in Moto Buds Desktop Utility"
    },
    fit: {
      file: "fit-test", width: 1249, height: 924, label: "Ear Tip Fit Test", index: "05 / 06",
      title: "Know when the seal is right",
      copy: "Run a guided acoustic check and get a separate fit result for each earbud.",
      alt: "Ear tip fit test in Moto Buds Desktop Utility"
    },
    settings: {
      file: "settings", width: 1249, height: 926, label: "Device settings", index: "06 / 06",
      title: "The useful extras",
      copy: "Manage in ear detection, background operation, device information, and advanced preferences in one place.",
      alt: "Additional settings in Moto Buds Desktop Utility"
    }
  };

  const tabs = $$('[role="tab"][data-shot]');
  const shotWindow = $(".showcase-window");
  const shotPanel = $("#showcase-panel");
  const updateScreenshot = (tab, moveFocus = false) => {
    const data = screenshotData[tab.dataset.shot];
    if (!data) return;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    shotPanel?.setAttribute("aria-labelledby", tab.id);
    shotWindow?.classList.add("changing");
    window.setTimeout(() => {
      const source = $("[data-shot-source]");
      const image = $("[data-shot-image]");
      if (source) source.srcset = `assets/screenshots/${data.file}.webp`;
      if (image) {
        image.src = `assets/screenshots/${data.file}.png`;
        image.width = data.width;
        image.height = data.height;
        image.alt = data.alt;
      }
      $("[data-shot-label]").textContent = data.label;
      $("[data-shot-index]").textContent = data.index;
      $("[data-shot-title]").textContent = data.title;
      $("[data-shot-copy]").textContent = data.copy;
      shotWindow?.classList.remove("changing");
    }, reduceMotion.matches ? 0 : 170);
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => updateScreenshot(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      updateScreenshot(tabs[next], true);
    });
  });

  const featureCards = $$(".feature-card[data-feature-link]");
  featureCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card.dataset.featureSection) {
        const section = $("#" + card.dataset.featureSection);
        if (section) section.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const showcase = $("#showcase");
      if (showcase) showcase.scrollIntoView({ behavior: "smooth" });
      const targetShot = card.dataset.featureShot || "overview";
      const tab = tabs.find(t => t.dataset.shot === targetShot);
      if (tab) updateScreenshot(tab, true);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });

  

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });
    $$(".reveal").forEach((item) => revealObserver.observe(item));
  } else {
    $$(".reveal").forEach((item) => item.classList.add("visible"));
  }

  const parallax = $("[data-parallax]");
  if (parallax && !reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 7;
      const y = (event.clientY / window.innerHeight - 0.5) * 5;
      parallax.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, { passive: true });
  }

  const compactNumber = (value) => {
    if (value < 1000) return String(value);
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  };
  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const updateVersion = (version) => {
    if (!version) return;
    $$('[data-version]').forEach((item) => { item.textContent = version; });
  };
  const applyAsset = (kind, asset, fallbackMeta) => {
    const link = $(`[data-asset="${kind}"]`);
    if (!link) return;
    link.href = asset?.browser_download_url || RELEASES_URL;
    link.target = "_blank";
    link.rel = "noreferrer";
    const meta = $("[data-asset-meta]", link);
    if (meta && asset) meta.textContent = `${formatBytes(asset.size)} · ${asset.name}`;
    else if (meta) meta.textContent = fallbackMeta;
  };

  const loadGitHubData = async () => {
    try {
      const [releaseResponse, repoResponse] = await Promise.all([
        fetch(`${API_ROOT}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } }),
        fetch(API_ROOT, { headers: { Accept: "application/vnd.github+json" } })
      ]);

      if (repoResponse.ok) {
        const repository = await repoResponse.json();
        const count = repository.stargazers_count;
        const starElement = $("[data-star-count]");
        if (starElement && Number.isFinite(count)) {
          starElement.textContent = compactNumber(count);
          starElement.setAttribute("aria-label", `${count} GitHub ${count === 1 ? "star" : "stars"}`);
        }
      }

      if (!releaseResponse.ok) throw new Error("Release information unavailable");
      const release = await releaseResponse.json();
      updateVersion(release.tag_name);
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const find = (predicate) => assets.find((asset) => predicate(asset.name || ""));
      applyAsset("windows-setup", find((name) => /\.exe$/i.test(name) && /setup/i.test(name)), "EXE · Guided installation");
      applyAsset("windows-portable", find((name) => /\.exe$/i.test(name) && !/setup/i.test(name)), "EXE · No installation");
      applyAsset("linux-deb", find((name) => /\.deb$/i.test(name)), "DEB · Ubuntu, Mint, Debian");
      applyAsset("linux-appimage", find((name) => /\.appimage$/i.test(name)), "Portable · Most distributions");
    } catch (error) {
      console.info("Using static GitHub release fallbacks.", error);
      [
        ["windows-setup", "EXE · Open the latest release"],
        ["windows-portable", "EXE · Open the latest release"],
        ["linux-deb", "DEB · Open the latest release"],
        ["linux-appimage", "Portable · Open the latest release"]
      ].forEach(([kind, meta]) => applyAsset(kind, null, meta));
    }
  };

  $$('[data-asset]').forEach((link) => {
    link.target = "_blank";
    link.rel = "noreferrer";
  });
  $("[data-year]").textContent = new Date().getFullYear();
  loadGitHubData();
})();
