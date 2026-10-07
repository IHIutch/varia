const column = 'col col-span-12 md:col-span-6 lg:col-span-4'
const row = 'row row-g-1 md:row-g-3 lg:row-g-5'
const grid = document.querySelector('#responsive-grid')!
grid.className = row
for (const label of ['First', 'Second', 'Third']) {
  const cell = document.createElement('div')
  cell.className = column
  const content = document.createElement('div')
  content.className = 'grid-content'
  content.textContent = label
  cell.append(content)
  grid.append(cell)
}
