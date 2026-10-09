(() => {
  const header = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const icon = toggle.querySelector('.icon');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
    icon.classList.toggle('icon-menu', !open);
    icon.classList.toggle('icon-close', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  matchMedia('(min-width: 1000px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const workflow = document.querySelector('.beam-diagram');
  if (!workflow) return;
  const network = workflow.querySelector('.beam-network');
  const svg = workflow.querySelector('.beam-connections');
  const paths = workflow.querySelector('.beam-paths');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connections = [
    ['alert', 'hub', -18], ['evidence', 'hub', 0], ['context', 'hub', 18],
    ['hub', 'responder', -18], ['hub', 'cause', 0], ['hub', 'prevention', 18]
  ];
  const lines = connections.map((_, index) => {
    const base = paths.children[index];
    const flow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    flow.setAttribute('class', `beam-flow${index > 2 ? ' is-output' : ''}`);
    flow.setAttribute('pathLength', '100');
    flow.style.animationDelay = `${-(index % 3) * 1.4 - (index > 2 ? 2.5 : 0)}s`;
    svg.append(flow);
    return { base, flow };
  });
  // Measure node edges so paths stay attached at every screen size.
  const drawConnections = () => {
    const bounds = network.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const node = (name) => {
      const rect = network.querySelector(`[data-beam-node="${name}"]`).getBoundingClientRect();
      return { left: rect.left - bounds.left, right: rect.right - bounds.left, y: rect.top - bounds.top + rect.height / 2 };
    };
    connections.forEach(([from, to, offset], index) => {
      const source = node(from);
      const target = node(to);
      const startY = source.y + (from === 'hub' ? offset : 0);
      const endY = target.y + (to === 'hub' ? offset : 0);
      const midX = (source.right + target.left) / 2;
      const d = `M ${source.right} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${target.left} ${endY}`;
      lines[index].base.setAttribute('d', d);
      lines[index].flow.setAttribute('d', d);
    });
  };
  let visible = false;
  const updateMotion = () => {
    workflow.classList.toggle('is-running', visible && !document.hidden && !reducedMotion.matches);
  };
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    }, { threshold: 0.15 }).observe(network);
  } else { visible = true; }
  if ('ResizeObserver' in window) new ResizeObserver(drawConnections).observe(network);
  else window.addEventListener('resize', drawConnections);
  document.fonts.ready.then(drawConnections);
  drawConnections();
  updateMotion();
})();
