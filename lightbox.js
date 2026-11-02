/* Simple lightbox: click an image or video to view it large on the same page.
   Close: click outside, × button, or Esc.  Navigate: ← → keys or arrow buttons. */
(function () {
  var SEL = '.interest .zoom img, .project .gallery img, figure.vid video, img.banner';
  var items = [], idx = 0;

  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML =
    '<button class="lb-close" aria-label="Close">×</button>' +
    '<button class="lb-prev" aria-label="Previous">‹</button>' +
    '<div class="lb-stage"></div>' +
    '<button class="lb-next" aria-label="Next">›</button>' +
    '<div class="lb-cap"></div>';
  document.body.appendChild(box);
  var stage = box.querySelector('.lb-stage');
  var cap = box.querySelector('.lb-cap');

  function captionOf(el) {
    var fig = el.closest('figure');
    if (fig && fig.querySelector('figcaption')) return fig.querySelector('figcaption').textContent;
    var art = el.closest('article');
    if (art && art.querySelector('h3')) return art.querySelector('h3').textContent;
    return el.getAttribute('alt') || '';
  }

  function show(i) {
    idx = (i + items.length) % items.length;
    var el = items[idx];
    stage.innerHTML = '';
    var m;
    if (el.tagName === 'VIDEO') {
      m = document.createElement('video');
      m.src = el.currentSrc || el.src;
      m.autoplay = true; m.loop = true; m.muted = true; m.controls = true;
      m.setAttribute('playsinline', '');
    } else {
      m = document.createElement('img');
      m.src = el.currentSrc || el.src;
      m.alt = el.alt || '';
    }
    stage.appendChild(m);
    cap.textContent = captionOf(el);
    var multi = items.length > 1;
    box.querySelector('.lb-prev').style.display = multi ? '' : 'none';
    box.querySelector('.lb-next').style.display = multi ? '' : 'none';
  }

  function open(el) {
    items = Array.prototype.filter.call(document.querySelectorAll(SEL), function (x) {
      return x.offsetParent !== null; // skip hidden (missing) images
    });
    var i = items.indexOf(el);
    show(i < 0 ? 0 : i);
    box.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('on');
    stage.innerHTML = '';
    document.documentElement.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest(SEL);
    if (!el || box.contains(el)) return;
    e.preventDefault();
    open(el);
  });

  box.addEventListener('click', function (e) {
    if (e.target.closest('.lb-prev')) { show(idx - 1); return; }
    if (e.target.closest('.lb-next')) { show(idx + 1); return; }
    if (e.target.closest('.lb-close') || e.target === box || e.target === stage) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  // swipe on phones
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
