(function () {
  var C = window.SiteContent;
  var slug = document.body.getAttribute('data-project');
  if (!slug) return;

  function renderHeader(root, p) {
    var title = root.querySelector('[data-cs-title]');
    if (title) {
      title.innerHTML =
        '<span class="eyebrow">' + p.eyebrow + '</span><br>' +
        '<span class="headline">' + p.headline + '</span>';
    }
    var keywordsLabel = root.querySelector('[data-keywords-label]');
    if (keywordsLabel) keywordsLabel.textContent = p.keywordsLabel;
    var keywordsList = root.querySelector('[data-keywords-list]');
    if (keywordsList) {
      keywordsList.innerHTML = '';
      (p.keywords || []).forEach(function (k) {
        var tag = C.el('span', 'tag');
        tag.textContent = k;
        keywordsList.appendChild(tag);
      });
    }
    var specsLabel = root.querySelector('[data-specs-label]');
    if (specsLabel) specsLabel.textContent = p.specsLabel;
    var specsList = root.querySelector('[data-specs-list]');
    if (specsList) {
      specsList.innerHTML = '';
      (p.specs || []).forEach(function (s) {
        var tag = C.el('span', 'tag');
        tag.textContent = s;
        specsList.appendChild(tag);
      });
    }
    var hero = root.querySelector('[data-cs-hero]');
    if (hero) {
      var media = C.mediaEl(p.heroImage, 'cs-hero-img', p.eyebrow, { width: 1600, lazy: false });
      hero.replaceWith(media);
      media.setAttribute('data-cs-hero', '');
    }
  }

  function renderSplitCopy(root, selector, data) {
    var block = root.querySelector(selector);
    if (!block) return;
    var heading = block.querySelector('[data-heading]');
    if (heading) heading.textContent = data.heading;
    var body = block.querySelector('[data-body]');
    if (body) body.innerHTML = data.body;
  }

  // People naturally paste whatever a video's "Share" button gives them
  // (vimeo.com/123, youtube.com/watch?v=..., youtu.be/...), but only each
  // site's dedicated *player* URL is actually allowed to be shown inside
  // an iframe on another domain -- everything else gets silently blocked
  // by the browser. Normalize to that player URL regardless of what was
  // pasted, so the CMS field just works, and set it up to autoplay
  // muted on a silent loop with no UI chrome -- like an animated photo,
  // matching the gallery images around it, no click required.
  function toEmbedUrl(url) {
    var vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return 'https://player.vimeo.com/video/' + vimeo[1] + '?background=1&autoplay=1&loop=1&muted=1';
    var youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (youtube) {
      var id = youtube[1];
      return 'https://www.youtube.com/embed/' + id +
        '?autoplay=1&mute=1&loop=1&playlist=' + id + '&controls=0&modestbranding=1&rel=0';
    }
    return url;
  }

  // The gallery video slot is a fixed 16:9 "mask". A blind fixed oversize
  // (e.g. always +15%) only ever covers that mask for a video that's
  // already roughly landscape -- a portrait clip (common for phone
  // footage) is far too narrow to fill a 16:9 box that way and leaves
  // big white bars on the sides. So instead: ask Vimeo/YouTube's public
  // oEmbed endpoint for the clip's *real* width/height, then compute
  // exactly how much to zoom the embed so it covers the mask completely
  // (same math as CSS object-fit: cover), whatever its native shape.
  function fetchAspectRatio(url) {
    var vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var oembedUrl = null;
    if (vimeo) {
      oembedUrl = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent('https://vimeo.com/' + vimeo[1]);
    } else {
      var youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
      if (youtube) {
        oembedUrl = 'https://www.youtube.com/oembed?format=json&url=' +
          encodeURIComponent('https://www.youtube.com/watch?v=' + youtube[1]);
      }
    }
    if (!oembedUrl) return Promise.resolve(null);
    return fetch(oembedUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        return (data && data.width && data.height) ? data.width / data.height : null;
      })
      .catch(function () { return null; });
  }

  // Loads Vimeo's official Player SDK once (only pages with a Vimeo embed
  // pay for the extra script at all), so we can actually pause/play a clip
  // rather than just leaving every autoplaying embed running forever.
  var vimeoSdkPromise = null;
  function loadVimeoSdk() {
    if (window.Vimeo && window.Vimeo.Player) return Promise.resolve(window.Vimeo);
    if (!vimeoSdkPromise) {
      vimeoSdkPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.onload = function () { resolve(window.Vimeo); };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return vimeoSdkPromise;
  }

  // A page can end up with a handful of looping, autoplaying clips on it.
  // Left alone, every one of them keeps streaming even once scrolled
  // completely out of view, which both wastes bandwidth and means several
  // clips fight over the visitor's connection at once -- exactly the kind
  // of contention that makes Vimeo's adaptive streaming drop quality on
  // whichever one loses out. Pause a clip the moment it leaves the
  // viewport and resume it once it's back, so only what's actually on
  // screen is ever actively streaming.
  function pauseWhenOffscreen(frame, iframe, url) {
    if (!/vimeo\.com/.test(url)) return; // no SDK for YouTube here (unused today)
    loadVimeoSdk().then(function (Vimeo) {
      var player = new Vimeo.Player(iframe);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var action = entry.isIntersecting ? player.play() : player.pause();
          action.catch(function () {});
        });
      }, { threshold: 0.25 });
      observer.observe(frame);
    }).catch(function () {});
  }

  // Zooms/crops an absolutely-centered embed (see .video-embed-frame /
  // .video-embed in site.css) so it exactly covers a container of the
  // given aspect ratio, given the embedded content's real aspect ratio.
  function applyCoverFit(iframe, containerRatio, sourceRatio) {
    var margin = 1.01; // guards against sub-pixel gaps at the crop edge
    if (sourceRatio >= containerRatio) {
      iframe.style.height = (100 * margin) + '%';
      iframe.style.width = (100 * margin * (sourceRatio / containerRatio)) + '%';
    } else {
      iframe.style.width = (100 * margin) + '%';
      iframe.style.height = (100 * margin * (containerRatio / sourceRatio)) + '%';
    }
  }

  // Shifts which part of the (already cover-cropped) video is visible,
  // vertically -- e.g. a portrait clip covering a wide mask crops most
  // of its height away, and the centered default may cut off the actual
  // subject. offsetY is "percent shifted up" as entered in the CMS (0 =
  // centered/default, positive = show more of the top of the clip).
  function applyVerticalBias(iframe, offsetY) {
    var y = 50 - (Number(offsetY) || 0);
    if (y < 0) y = 0;
    if (y > 100) y = 100;
    iframe.style.top = y + '%';
    iframe.style.left = '50%';
    iframe.style.transform = 'translate(-50%, -' + y + '%)';
  }

  // The mask's own ratio isn't always 16:9 -- a video-pair/photo-video
  // cell in the gallery grid is square-ish (matching the photo pairs) on
  // desktop but 16:9 again once .gallery collapses to one column on
  // mobile (see site.css). Read whatever CSS actually resolved to,
  // rather than hardcoding it, so the crop math (applyCoverFit) always
  // matches the mask it's covering.
  function getFrameAspectRatio(frameEl) {
    var parts = String(getComputedStyle(frameEl).aspectRatio).split('/').map(parseFloat);
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1];
    return 16 / 9;
  }

  // Builds either a live, autoplaying embed (URL given) or a placeholder
  // tile (no URL yet) -- shared by single-video and side-by-side blocks.
  function buildVideoFrame(url, label, offsetY) {
    if (url) {
      var frame = C.el('div', 'video-embed-frame');
      // Wait for the real aspect ratio before creating the <iframe> at
      // all, rather than building it immediately and resizing it once the
      // ratio arrives. Vimeo/YouTube pick their streaming quality once,
      // based on the player's size at that moment -- resizing the iframe
      // afterward doesn't make it re-request a sharper stream, so a
      // heavily-cropped clip (small at first, then zoomed way in) ended up
      // visibly soft even though the source was high-res. Building the
      // iframe already at its final size avoids that entirely; the frame
      // just shows empty (background color) for the one network round-trip
      // this takes.
      fetchAspectRatio(url).then(function (ratio) {
        var iframe = document.createElement('iframe');
        iframe.className = 'video-embed';
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        if (offsetY) applyVerticalBias(iframe, offsetY);
        if (ratio) applyCoverFit(iframe, getFrameAspectRatio(frame), ratio);
        iframe.src = toEmbedUrl(url);
        frame.appendChild(iframe);
        pauseWhenOffscreen(frame, iframe, url);
      });
      return frame;
    }
    var ph = C.el('div', 'video-placeholder checker');
    var labelEl = document.createElement('span');
    labelEl.textContent = label || 'Video';
    ph.appendChild(labelEl);
    return ph;
  }

  function buildGalleryItem(item) {
    if (item.type === 'video') {
      var vb = C.el('div', 'video-block');
      vb.appendChild(buildVideoFrame(item.videoUrl, item.videoLabel, item.videoOffsetY));
      if (item.image) {
        vb.appendChild(C.mediaEl(item.image, 'cs-hero-img', '', { width: 1600 }));
      }
      if (item.caption) {
        var vbcaption = C.el('span', 'gallery-caption');
        vbcaption.textContent = item.caption;
        vb.appendChild(vbcaption);
      }
      return vb;
    }

    if (item.type === 'video-pair') {
      var vwrap = C.el('div', 'gallery-block');
      var vgallery = C.el('div', 'gallery');
      vgallery.appendChild(buildVideoFrame(item.videoUrl, item.videoLabel, item.videoOffsetY));
      vgallery.appendChild(buildVideoFrame(item.videoUrl2, item.videoLabel2, item.videoOffsetY2));
      vwrap.appendChild(vgallery);
      if (item.caption) {
        var vcaption = C.el('span', 'gallery-caption');
        vcaption.textContent = item.caption;
        vwrap.appendChild(vcaption);
      }
      return vwrap;
    }

    if (item.type === 'photo-video') {
      var pvwrap = C.el('div', 'gallery-block');
      var pvgallery = C.el('div', 'gallery');
      pvgallery.appendChild(C.mediaEl(item.image, '', '', { width: 800 }));
      // The 'Video URL' field is the intended one, but this type used to
      // not exist, so some entries got the clip pasted into 'Second video
      // URL' instead while the CMS only offered the 'pair' (2-image) type
      // -- fall back to that so those don't quietly stay blank.
      pvgallery.appendChild(buildVideoFrame(
        item.videoUrl || item.videoUrl2,
        item.videoLabel || item.videoLabel2,
        item.videoOffsetY || item.videoOffsetY2
      ));
      pvwrap.appendChild(pvgallery);
      if (item.caption) {
        var pvcaption = C.el('span', 'gallery-caption');
        pvcaption.textContent = item.caption;
        pvwrap.appendChild(pvcaption);
      }
      return pvwrap;
    }

    var wrap = C.el('div', 'gallery-block');
    var galleryClass = item.type === 'full' ? 'gallery gallery--full' : 'gallery';
    var gallery = C.el('div', galleryClass);
    var galleryWidth = item.type === 'full' ? 1600 : 800;
    gallery.appendChild(C.mediaEl(item.image, '', '', { width: galleryWidth }));
    if (item.type === 'pair') gallery.appendChild(C.mediaEl(item.image2, '', '', { width: galleryWidth }));
    wrap.appendChild(gallery);
    if (item.caption) {
      var caption = C.el('span', 'gallery-caption');
      caption.textContent = item.caption;
      wrap.appendChild(caption);
    }
    return wrap;
  }

  function renderGallery(root, items) {
    var container = root.querySelector('[data-gallery]');
    if (!container) return;
    container.innerHTML = '';
    (items || []).forEach(function (item) {
      container.appendChild(buildGalleryItem(item));
    });
  }

  function renderResult(root, result) {
    var block = root.querySelector('[data-result]');
    if (!block) return;
    var heading = block.querySelector('[data-heading]');
    if (heading) heading.textContent = result.heading;
    var body = block.querySelector('[data-body]');
    if (body) {
      body.innerHTML = '<span class="dark">' + result.bodyBlack + '</span>';
      if (result.bodyMuted) {
        body.innerHTML += '<br><br><span class="muted">' + result.bodyMuted + '</span>';
      }
    }
  }

  function renderRelated(root, allProjects, currentSlug) {
    var container = root.querySelector('[data-related]');
    if (!container) return;
    container.innerHTML = '';
    allProjects
      .filter(function (p) { return p.slug !== currentSlug; })
      .slice(0, 2)
      .forEach(function (p) {
        var card = C.el('a', 'related-card');
        card.href = p.slug + '.html';
        card.appendChild(C.mediaEl(p.image, '', p.title, { width: 800 }));
        var span = document.createElement('span');
        span.textContent = p.title + ' — ' + p.tagline;
        card.appendChild(span);
        container.appendChild(card);
      });
  }

  Promise.all([
    C.fetchJson('../content/projects/' + slug + '.json'),
    C.fetchJson('../content/settings.json'),
    C.fetchJson('../content/home.json')
  ]).then(function (results) {
    var project = results[0];
    var settings = results[1];
    var home = results[2];
    var root = document;

    renderHeader(root, project);
    renderSplitCopy(root, '[data-problem]', project.problem);
    renderSplitCopy(root, '[data-idea]', project.idea);
    renderGallery(root, project.gallery);
    renderResult(root, project.result);
    renderRelated(root, home.projects, slug);
    C.renderContact(root, settings, 'Get in Touch');
    C.renderFooter(root, settings);
  }).catch(function (err) {
    console.error(err);
  });
})();
