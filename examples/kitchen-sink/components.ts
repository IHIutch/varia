import './styles.css'

// Wire up every dropdown on the page. Convention: trigger has id "X-trigger",
// menu has id "X-menu", or they share a common ancestor with class .dropdown.
function wireDropdown(triggerId: string, menuId: string): void {
  const trigger = document.getElementById(triggerId)
  const menu = document.getElementById(menuId)
  if (!trigger || !menu)
    return
  const setOpen = (open: boolean): void => {
    menu.setAttribute('data-state', open ? 'open' : 'closed')
    trigger.setAttribute('aria-expanded', String(open))
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation()
    setOpen(menu.getAttribute('data-state') !== 'open')
  })
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target as Node) && !trigger.contains(e.target as Node))
      setOpen(false)
  })
}

wireDropdown('dropdown-1-trigger', 'dropdown-1-menu')
wireDropdown('dropdown-2-trigger', 'dropdown-2-menu')
wireDropdown('navbar-user-trigger', 'navbar-user-menu')

// Wire up the alert close buttons.
document.querySelectorAll<HTMLButtonElement>('.alert__close').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('.alert')?.remove()
  })
})

// Wire up pagination — click any non-disabled page link to make it active.
const pagination = document.getElementById('varia-pagination')
if (pagination) {
  pagination.querySelectorAll<HTMLAnchorElement>('.pagination__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      if (link.getAttribute('data-state') === 'disabled')
        return
      if (!link.dataset.page)
        return
      pagination.querySelectorAll<HTMLAnchorElement>('.pagination__link[data-state=active]')
        .forEach(a => a.removeAttribute('data-state'))
      link.setAttribute('data-state', 'active')
      link.setAttribute('aria-current', 'page')
    })
  })
}

// Wire up nav tabs and pills — click any non-disabled link to make it active.
for (const id of ['nav-tabs', 'nav-pills']) {
  const nav = document.getElementById(id)
  nav?.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      if (link.classList.contains('nav__link-disabled'))
        return
      nav.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav__link-active'))
      link.classList.add('nav__link-active')
    })
  })
}
