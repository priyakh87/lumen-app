const DEFAULT_UPDATES = [
  {
    id: 'srv-implementation',
    name: 'Implementation Session',
    duration: 60,
    price: 85,
    description: 'One-hour implementation session to work through tasks.',
    icon: 'star',
    color: 'from-sky-400 to-indigo-400'
  },
  {
    id: 'srv-followup',
    name: 'Follow-up',
    duration: 15,
    price: 0,
    description: 'Quick 15-minute follow-up to check progress.',
    icon: 'dashboard',
    color: 'from-amber-400 to-orange-500'
  }
];

module.exports = {
  async up(db, client) {
    for (const s of DEFAULT_UPDATES) {
      await db.collection('services').updateOne(
        { id: s.id, origin: { $in: ['default', undefined] } },
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
  },

  async down(db, client) {
    await db.collection('services').updateMany(
      { id: { $in: DEFAULT_UPDATES.map((s) => s.id) }, origin: 'default' },
      { $unset: { icon: '', color: '' } }
    );
  }
};
