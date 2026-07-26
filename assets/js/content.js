// Small helpers shared by home.js and project.js for turning JSON content
// into DOM nodes. No framework, no build step: the CMS edits the JSON files
// in /content, these scripts fetch and render them on page load.
(function (global) {
  function fetchJson(path) {
    return fetch(path, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
      return res.json();
    });
  }

  function el(tag, className) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  // Renders either an <img> (when src is a non-empty string) or a grey
  // placeholder <div> (when src is empty/null) sharing the same class,
  // so CSS aspect-ratio rules apply either way.
  function mediaEl(src, className, alt) {
    if (src) {
      var img = el('img', className);
      img.src = src;
      img.alt = alt || '';
      return img;
    }
    var ph = el('div', className + ' img-placeholder');
    return ph;
  }

  function tagVariantClass(variant) {
    if (variant === 'dark') return 'tag tag--dark';
    if (variant === 'gold') return 'tag tag--gold';
    return 'tag';
  }

  function renderTags(container, tags) {
    (tags || []).forEach(function (t) {
      var span = el('span', tagVariantClass(t.variant));
      span.textContent = t.label;
      container.appendChild(span);
    });
  }

  function renderFooter(root, settings) {
    var nameEl = root.querySelector('[data-footer-name]');
    if (nameEl && settings) {
      nameEl.textContent = settings.name + ' → ' + settings.location;
    }
    var impressum = root.querySelector('[data-footer-impressum]');
    if (impressum && settings && settings.links) {
      impressum.textContent = settings.links.impressum.label;
      impressum.href = settings.links.impressum.href;
    }
    var datenschutz = root.querySelector('[data-footer-datenschutz]');
    if (datenschutz && settings && settings.links) {
      datenschutz.textContent = settings.links.datenschutz.label;
      datenschutz.href = settings.links.datenschutz.href;
    }
  }

  function renderContact(root, settings, headingText) {
    var heading = root.querySelector('[data-contact-heading]');
    if (heading) heading.textContent = headingText || 'Get in Touch';
    var mail = root.querySelector('[data-contact-email]');
    if (mail && settings) {
      mail.href = 'mailto:' + settings.email;
      var textEl = mail.querySelector('[data-contact-email-text]');
      if (textEl) textEl.textContent = settings.email;
    }
  }

  global.SiteContent = {
    fetchJson: fetchJson,
    el: el,
    mediaEl: mediaEl,
    renderTags: renderTags,
    renderFooter: renderFooter,
    renderContact: renderContact
  };
})(window);
