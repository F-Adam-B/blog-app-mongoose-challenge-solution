const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now}
});


blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  };
}


const BlogPost = mongoose.model('BlogPost', blogPostSchema);

const UserSchema = new mongoose.Schema({
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  password: {
    type: String, 
    required: true},
  username: {
    type:String,
    required: '',
    unique: true
  },
});

UserSchema.methods.apiRepr = function () {
  return {

    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,

  };
}; 

UserSchema.methods.validatePassword = function(password) {
  return bcrypt
    .compare(password, this.password)
    .then(isValid = isValid);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash);
};








const User = mongoose.model('User', UserSchema);



module.exports = {BlogPost, User};
