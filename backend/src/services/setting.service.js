import prisma from '../config/prisma.js'

export async function listSettings(group) {
  const where = {}
  if (group) {
    where.group = group
  }

  const settings = await prisma.setting.findMany({
    where,
    orderBy: { key: 'asc' },
  })

  // Convert to easy key-value map along with array
  const map = {}
  settings.forEach((s) => {
    map[s.key] = s.value
  })

  return { settings, map }
}

export async function updateSettings(settingsMap) {
  return prisma.$transaction(async (tx) => {
    const updated = []
    for (const [key, value] of Object.entries(settingsMap)) {
      const record = await tx.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          group: key.startsWith('pos_') ? 'pos' : key.startsWith('printer_') ? 'printer' : 'general',
        },
      })
      updated.push(record)
    }
    return updated
  })
}

