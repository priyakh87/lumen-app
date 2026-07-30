const SERVICE_COLOR_UPDATES = [
  { id: 'srv-strategy', color: 'from-emerald-400 to-teal-400' },
  { id: 'srv-followup', color: 'from-sky-400 to-indigo-400' }
];

module.exports = {
  async up(db, client) {
    for (const s of SERVICE_COLOR_UPDATES) {
      await db.collection('services').updateOne(
        { id: s.id },
        { $set: { color: s.color, origin: 'default' } }
      );
    }
  },

  async down(db, client) {
    await db.collection('services').updateOne({ id: 'srv-strategy' }, { $set: { color: '#6366F1' } });
    await db.collection('services').updateOne({ id: 'srv-followup' }, { $set: { color: 'from-amber-400 to-orange-500' } });
  }
};
