import './styles.css'

// Click-to-activate behavior for both varia tabs and pills. Active state is
// expressed by toggling `.nav__link-active` (a slot class) on the clicked link.

function wireGroup(rootId: string): void {
  const root = document.getElementById(rootId)
  if (!root)
    return
  root.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      if (link.classList.contains('nav__link-disabled'))
        return
      root.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav__link-active'))
      link.classList.add('nav__link-active')
    })
  })
}

wireGroup('varia-tabs')
wireGroup('varia-pills')
