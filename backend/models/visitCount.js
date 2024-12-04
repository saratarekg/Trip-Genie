const mongoose = require('mongoose');

const visitCountSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  dailyCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

visitCountSchema.statics.incrementCount = async function() {
  let visitCount = await this.findOne();
  if (!visitCount) {
    visitCount = new this();
  }
  
  // Check if the date has changed
  const today = new Date();
  if (today.toDateString() !== visitCount.lastUpdated.toDateString()) {
    // Reset daily count for a new day
    visitCount.dailyCount = 0;
    visitCount.lastUpdated = today;
  }
  
  visitCount.count += 1;
  visitCount.dailyCount += 1;
  await visitCount.save();
  return visitCount;
};

const VisitCount = mongoose.model('VisitCount', visitCountSchema);

module.exports = VisitCount;
