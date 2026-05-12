// Bootstrap version. Same widget, native Bootstrap class names. No virtual
// uno import — this page is intentionally Bootstrap-only so the class names
// don't collide with varia's `.nav`/`.nav-link`/`.nav-item` shortcuts.

function wireGroup(rootId: string): void {
  const root = document.getElementById(rootId)
  if (!root)
    return
  root.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      if (link.classList.contains('disabled'))
        return
      root.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'))
      link.classList.add('active')
    })
  })
}

wireGroup('bs-tabs')
wireGroup('bs-pills')
