const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrpyt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Name field is required']
  },
  lastName: {
    type: String
  },
  jobTitle: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country'//,
   // required: [true, 'Country must belong to a Country']
  },
  pincode: {
    type: String
  },
  phone: {
    type: Number
  },  
  email: {
    type: String,
    required: [true, 'Email field is required'],
    unique: true,
    lowercase: true, // Transform value to lowercase
    validate: [validator.isEmail, 'Specified email ({VALUE}) is incorrect']
  },
  extraDetails: {
    type: String
  },
  isSuperAdmin: {
    type: Boolean
  },
  status: {
    type: String,
    enum: ['Active', 'Deleted','Resigned','Terminated','Inactive','Settled','FNF Attendance Processed','FNF Payroll Calculated','FNF Payment Processed'],
    default: 'Active'
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company must belong to a Company']
  },
  // Used for authorization
  photo: {
    type: String  },
  role: {
    type: mongoose.Schema.ObjectId,
    ref: 'Role',
    required: [true, 'Role must belong to a Role']
  },
  password: {
    type: String,
    // Do not include password while using eg. findOne
    select: false
  },
  passwordConfirm: {
    type: String
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
  //  required: [true, 'User must belong to a User']
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
    //required: [true, 'User must belong to a User']
  },
  createdOn: {
    type: Date,
    required: true    
  },
  updatedOn: {
    type: Date,
    required: true    
  },
  personalEmail: {
    type: String
  },
  mobile: {
    type: String
  },
  emergancyContactName: {
    type: String
  },
  emergancyContactNumber: {
    type: String
  },
  Gender: {
    type: String
  },
  DOB: {
    type: Date
  },
  MaritalStatus: {
    type: String
  },
  MarraigeAniversary: {
    type: Date
  },
  PassportDetails: {
    type: String
  },
  Pancard: {
    type: String
  },
  AadharNumber: {
    type: String
  },
  Disability: {
    type: String
  },
  FatherHusbandName: {
    type: String
  },
  NoOfChildren: {
    type: String
  },
  BankName: {
    type: String
  },
  BankAccountNumber: {
    type: String
  },
  BankIFSCCode: {
    type: String
  },
  BankBranch: {
    type: String
  },
  BankAddress: {
    type: String
  },
  appointment: []
},
{
 toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
 toObject: { virtuals: true } // Use virtuals when outputing as Object
},
{ collection: 'User' });
userSchema.pre(/^find/,async function(next) {
  this.populate({
    path: 'company',
    select: 'companyName freeCompany'
  }).populate({
    path: 'role',
    select: 'roleName'
  });
  next();
});

userSchema.virtual('userSubordinateAsUser', {
  ref: 'userSubordinate',
  foreignField: 'userId',
  localField: '_id'
});

userSchema.virtual('userSubordinateAsSubordinate', {
  ref: 'userSubordinate',
  foreignField: 'subordinateUserId',
  localField: '_id'
});

userSchema.virtual('genericSetting', {
  ref: 'GenericSetting',
  foreignField: 'user', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});

userSchema.virtual('taskUser', {
  ref: 'TaskUsers',
  foreignField: 'user', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});
userSchema.virtual('timelog', {
  ref: 'TimeLog',
  foreignField: 'user', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});
userSchema.virtual('projectUser', {
  ref: 'ProjectUsers',
  foreignField: 'user', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});
userSchema.virtual('liveTrackinng', {
  ref: 'LiveTracking',
  foreignField: 'user', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});
// Hashing functions
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Because JWT could be generated before this timestamp is set
  // we have to subtract 1s just to be sure that user can log in
  // with new JWT after resetting the password
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function(next) {
  // If password wasn't modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrpyt.hash(this.password, 12);

  // We need this field only for validation
  this.passwordConfirm = undefined;

  next();
});
// End of hashing functions

userSchema.pre(/^find/, async function(next) {
  // This points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function(
  candidatePassword, // Not hashed
  userPassword // Hashed
) {
  // Because passwords select is set to false, we can't access it directly with 'this' keyword
  // Compare non hashed password with hashed one
  return await bcrpyt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  // Create random string with length of 32
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash it and set to 'this' user
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time to 10 minutes since now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.pre(/^find/,async function(next) {
  this.populate({
    path: 'role',
    select: 'id name'
  })
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
