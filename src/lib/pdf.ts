import { AISLES } from './categories'
import { weekRangeLabel } from './date'
import { formatQty, type ShoppingItem } from './shopping'

/** Exporta a lista de compras para PDF (descarregado diretamente). */
export async function exportShoppingPdf(items: ShoppingItem[], weekStart: string, checked: Record<string, boolean>) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 15
  const colWidth = 85
  let x = margin
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Lista de compras', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Semana ${weekRangeLabel(weekStart)}`, margin, y + 6)
  doc.setTextColor(0)
  y += 16
  const top = y

  const nextLine = (h: number) => {
    y += h
    if (y > 280) {
      if (x === margin) {
        x = margin + colWidth + 10
      } else {
        doc.addPage()
        x = margin
      }
      y = x === margin ? margin : top
    }
  }

  for (const aisle of AISLES) {
    const group = items.filter((i) => i.aisle === aisle)
    if (!group.length) continue
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(aisle, x, y)
    nextLine(6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const it of group) {
      const done = checked[it.key]
      doc.rect(x, y - 3.2, 3.5, 3.5)
      if (done) doc.line(x + 0.6, y - 1.5, x + 3, y - 0.2)
      doc.setTextColor(done ? 150 : 0)
      const qty = it.extra ? '' : formatQty(it.qty, it.unit)
      doc.text(it.name, x + 6, y, { maxWidth: colWidth - 28 })
      if (qty) doc.text(qty, x + colWidth, y, { align: 'right' })
      doc.setTextColor(0)
      nextLine(6)
    }
    nextLine(3)
  }
  doc.save(`lista-compras-${weekStart}.pdf`)
}
