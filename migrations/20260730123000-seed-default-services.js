const DEFAULT_SERVICES = [
  {
    id: 'srv-implementation',
    name: 'Implementation Session',
    duration: 60,
    price: 85,
    description: 'One-hour implementation session to work through tasks.',
    icon: 'star',
    color: 'from-sky-400 to-indigo-400',
    origin: 'default'
  },
  {
    id: 'srv-followup',
    name: 'Follow-up',
    duration: 15,
    price: 0,
    description: 'Quick 15-minute follow-up to check progress.',
    icon: 'dashboard',
    color: 'from-amber-400 to-orange-500',
    origin: 'default'
  }
];

module.exports = {
  async up(db, client) {
    for (const s of DEFAULT_SERVICES) {
      const existing = await db.collection('services').findOne({ id: s.id });

      if (!existing) {
        await db.collection('services').insertOne({ ...s, origin: 'default' });
        continue;
      }

      if (existing.origin === 'default' || existing.origin === undefined) {
        await db.collection('services').updateOne(
          { id: s.id },
          { $set: {
            name: s.name,
            duration: s.duration,
            price: s.price,
            description: s.description,
            icon: s.icon,
            color: s.color,
            origin: 'default'
          } }
        );
      }
    }
  },

  async down(db, client) {
    const ids = DEFAULT_SERVICES.map((s) => s.id);
    await db.collection('services').deleteMany({ id: { $in: ids }, origin: 'default' });
  }
};
