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

  function buildGalleryItem(item) {
    if (item.type === 'video') {
      var vb = C.el('div', 'video-block');
      if (item.videoUrl) {
        var iframe = document.createElement('iframe');
        iframe.className = 'video-embed';
        iframe.src = item.videoUrl;
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        vb.appendChild(iframe);
      } else {
        var ph = C.el('div', 'video-placeholder checker');
        var label = document.createElement('span');
        label.textContent = item.videoLabel || 'Video';
        ph.appendChild(label);
        vb.appendChild(ph);
      }
      if (item.image) {
        vb.appendChild(C.mediaEl(item.image, 'cs-hero-img', '', { width: 1600 }));
      }
      return vb;
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
      body.innerHTML =
        '<span class="dark">' + result.bodyBlack + '</span><br><br>' +
        '<span class="muted">' + result.bodyMuted + '</span>';
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
