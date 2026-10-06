import './tailwind.css'

// Bare-minimum wiring to exercise the modal + dropdown markup. The point of
// this app is to stress varia's class-assembly DX, not to demo accessible
// dialogs — so this is intentionally crude.

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el)
    throw new Error(`#${id} not found`)
  return el as T
}

// Account-actions dropdown
const trigger = $('acct-trigger')
const menu = $('acct-menu')
function setOpen(open: boolean): void {
  menu.setAttribute('data-state', open ? 'open' : 'closed')
  trigger.setAttribute('aria-expanded', String(open))
}
trigger.addEventListener('click', () => {
  setOpen(menu.getAttribute('data-state') !== 'open')
})
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target as Node) && !trigger.contains(e.target as Node)) {
    setOpen(false)
  }
})

// Delete-account modal
const modal = $('delete-modal')
const openModal = (): void => modal.classList.remove('hidden')
const closeModal = (): void => modal.classList.add('hidden')
$('open-delete').addEventListener('click', () => {
  setOpen(false)
  openModal()
})
$('close-delete').addEventListener('click', closeModal)
$('cancel-delete').addEventListener('click', closeModal)
