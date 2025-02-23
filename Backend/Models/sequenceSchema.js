// Create new file: Models/sequenceModel.js
import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  _id: String,
  sequence_value: Number
});

export default mongoose.model('Sequence', sequenceSchema);