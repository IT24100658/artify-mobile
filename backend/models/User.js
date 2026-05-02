const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 20 },
  email: { type: String, required: true, unique: true, maxlength: 50 },
  password: { type: String, required: true, maxlength: 120 },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  active: { type: Boolean, default: true },
  roles: [{ type: String, enum: ['ROLE_CUSTOMER', 'ROLE_ARTIST', 'ROLE_ADMIN'], default: 'ROLE_CUSTOMER' }],
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
