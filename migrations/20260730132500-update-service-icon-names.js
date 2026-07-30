const SERVICE_UPDATES = [
  { id: 'srv-strategy', icon: 'square-play' },
  { id: 'srv-implementation', icon: 'user' },
  { id: 'srv-followup', icon: 'layout-dashboard' }
];

module.exports = {
  async up(db, client) {
    for (const s of SERVICE_UPDATES) {
      await db.collection('services').updateOne(
        { id: s.id },
        { $set: { icon: s.icon, origin: 'default' } }
      );
    }
  },

  async down(db, client) {
    await db.collection('services').updateOne({ id: 'srv-strategy' }, { $set: { icon: 'star' } });
    await db.collection('services').updateOne({ id: 'srv-implementation' }, { $set: { icon: 'user' } });
    await db.collection('services').updateOne({ id: 'srv-followup' }, { $set: { icon: 'dashboard' } });
  }
};
