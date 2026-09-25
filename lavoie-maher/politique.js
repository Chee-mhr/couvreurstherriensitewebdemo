// Surligne la section en cours de lecture dans le sommaire
(() => {
  const links = [...document.querySelectorAll(".toc a")];
  const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(l => l.classList.remove("on")); map.get(e.target.id)?.classList.add("on"); }
  }), { rootMargin: "-30% 0px -60% 0px" });
  document.querySelectorAll("article section").forEach(s => io.observe(s));
})();
