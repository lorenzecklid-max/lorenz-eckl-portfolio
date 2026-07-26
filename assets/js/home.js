(function () {
  var C = window.SiteContent;

  function renderHero(root, hero) {
    var img = root.querySelector('[data-hero-image]');
    if (img && hero.image) img.src = hero.image;
    var headline = root.querySelector('[data-hero-headline]');
    if (headline) {
      headline.innerHTML =
        escapeHtml(hero.prefix) + ' <span class="accent">' + escapeHtml(hero.accent) + '</span>. ' + escapeHtml(hero.suffix);
    }
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function renderWork(root, work) {
    var heading = root.querySelector('[data-work-heading]');
    if (heading) heading.textContent = work.heading;
    var intro = root.querySelector('[data-work-intro]');
    if (intro) intro.textContent = work.intro;
  }

  function buildProjectCard(project, featured) {
    var card = C.el('a', 'project-card');
    card.href = 'projects/' + project.slug + '.html';

    var mediaWrap = C.el('div', 'project-card-media ' + (featured ? 'project-card-media--featured' : 'project-card-media--grid'));
    mediaWrap.appendChild(C.mediaEl(project.image, '', project.title));
    card.appendChild(mediaWrap);

    var title = C.el('span', 'project-card-title');
    title.textContent = project.title + ' — ' + project.tagline;
    card.appendChild(title);

    var tagRow = C.el('div', 'tag-row');
    C.renderTags(tagRow, project.tags);
    card.appendChild(tagRow);

    return card;
  }

  function renderProjects(root, projects) {
    var list = root.querySelector('[data-project-list]');
    if (!list || !projects || !projects.length) return;
    list.innerHTML = '';

    var featured = projects[0];
    if (featured) list.appendChild(buildProjectCard(featured, true));

    var rest = projects.slice(1);
    if (rest.length) {
      var grid = C.el('div', 'split');
      grid.setAttribute('data-rs', 'split');
      rest.forEach(function (p) { grid.appendChild(buildProjectCard(p, false)); });
      list.appendChild(grid);
    }
  }

  function renderAbout(root, about) {
    var heading = root.querySelector('[data-about-heading]');
    if (heading) heading.textContent = about.heading;
    var bio = root.querySelector('[data-about-bio]');
    if (bio) bio.textContent = about.bio;
    var skillsLabel = root.querySelector('[data-about-skills-label]');
    if (skillsLabel) skillsLabel.textContent = about.skillsLabel;
    var skillsList = root.querySelector('[data-about-skills-list]');
    if (skillsList) {
      skillsList.innerHTML = '';
      (about.skills || []).forEach(function (s) {
        var tag = C.el('span', 'tag');
        tag.textContent = s;
        skillsList.appendChild(tag);
      });
    }
    var imgsWrap = root.querySelector('[data-about-imgs]');
    if (imgsWrap) {
      imgsWrap.innerHTML = '';
      var a = C.el('div');
      a.appendChild(C.mediaEl(about.portraitImage, '', 'Portrait'));
      var b = C.el('div');
      b.appendChild(C.mediaEl(about.secondImage, '', ''));
      imgsWrap.appendChild(a);
      imgsWrap.appendChild(b);
    }
  }

  Promise.all([
    C.fetchJson('content/home.json'),
    C.fetchJson('content/settings.json')
  ]).then(function (results) {
    var home = results[0];
    var settings = results[1];
    var root = document;

    var logo = root.querySelector('[data-nav-logo]');
    if (logo) logo.textContent = settings.name;

    renderHero(root, home.hero);
    renderWork(root, home.work);
    renderProjects(root, home.projects);
    renderAbout(root, home.about);
    C.renderContact(root, settings, home.contact.heading);
    C.renderFooter(root, settings);
  }).catch(function (err) {
    console.error(err);
  });
})();
