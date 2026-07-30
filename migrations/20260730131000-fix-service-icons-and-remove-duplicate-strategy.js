const SERVICE_UPDATES = [
  {
    id: 'srv-strategy',
    icon: 'star'
  },
  {
    id: 'srv-implementation',
    icon: 'user'
  },
  {
    id: 'srv-followup',
    icon: 'dashboard'
  }
];

module.exports = {
  async up(db, client) {
    await db.collection('services').deleteOne({ id: 'srv-consult' });

    for (const s of SERVICE_UPDATES) {
      await db.collection('services').updateOne(
        { id: s.id },
        { $set: { icon: s.icon, origin: 'default' } }
      );
    }
  },

  async down(db, client) {
    await db.collection('services').updateOne(
      { id: 'srv-strategy' },
      { $set: { icon: '💡' } }
    );
    await db.collection('services').updateOne(
      { id: 'srv-implementation' },
      { $set: { icon: 'cpu' } }
    );
    await db.collection('services').updateOne(
      { id: 'srv-followup' },
      { $set: { icon: 'compass' } }
    );
    await db.collection('services').insertOne({
      id: 'srv-consult',
      name: 'Strategy Consultation',
      duration: 30,
      price: 0,
      description: 'A focused 30-minute strategy consultation to scope your goals.',
      icon: 'sparkles',
      color: 'from-emerald-400 to-teal-400',
      origin: 'default'
    });
  }
};
