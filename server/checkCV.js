import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/recruitment', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(async () => {
  const CV = mongoose.model('CV', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    cvName: String,
    cvFilePath: String,
    cvText: String,
    isDefault: Boolean,
    isActive: Boolean,
    createdAt: Date,
    updatedAt: Date
  }));
  
  const cvs = await CV.find({ isActive: true }).sort({ updatedAt: -1 }).limit(5);
  console.log('\n=== CV TRONG DATABASE ===');
  cvs.forEach((cv, i) => {
    console.log(`${i+1}. ${cv.cvName}`);
    console.log(`   - isDefault: ${cv.isDefault}`);
    console.log(`   - cvFilePath: ${cv.cvFilePath}`);
    console.log(`   - cvText length: ${cv.cvText ? cv.cvText.length : 0}`);
    console.log(`   - userId: ${cv.userId}`);
    console.log('');
  });
  
  const defaultCV = await CV.findOne({ isDefault: true, isActive: true });
  if (defaultCV) {
    console.log('✅ Có Default CV:', defaultCV.cvName);
  } else {
    console.log('❌ KHÔNG CÓ DEFAULT CV!');
    console.log('➡️ Vui lòng vào CV Manager và tick "Đặt làm CV mặc định"');
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
