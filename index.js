const blogAnimation = bodymovin.loadAnimation({
  container: document.querySelector('#blog-animation'),
  path: 'blog.json',
  renderer: 'svg',
  loop: true,
  autoplay: true,
});
const adminAnimation = bodymovin.loadAnimation({
  container: document.querySelector('#admin-animation'),
  path: 'writing.json',
  renderer: 'svg',
  loop: true,
  autoplay: true,
});
const sourceAnimation = bodymovin.loadAnimation({
  container: document.querySelector('#source-animation'),
  path: 'github.json',
  renderer: 'svg',
  loop: true,
  autoplay: true,
});