const mongoose  = require("mongoose")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const UserSchema = new mongoose.Schema({
    

 
    firstName:{
        type:String,
        required:true  
    },
    lastName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        lowercase:true,
        unique:true,
        required:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Email do not match'],
        index:true
    },
    password:{
        type:String,
        minlength: 8,
        required:true

    },

    date:{
        type:Date,
        default:Date.now
    },
    
    tokens:[{
        token:{
           type: String,
           required: true
        }
     }],

    articles:[]

    
})



UserSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return next();

//if user being created, or updated
    bcrypt.genSalt(10, function(err, salt){
        if (err) return next(err);

    bcrypt.hash(user.password,salt, function(err, hash) {
        if(err) return next(err);

        user.password =  hash;
        next();
    })
    })
})

//hide the data from users
UserSchema.methods.toJSON = function(){
   const user =this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.confirmPassword;
    delete userObject.tokens;
return userObject;

}
//gen jwt auth tokens

 UserSchema.methods.generateAuthToken = async function(){ 
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},'funTime');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;

    }

//login validation

UserSchema.statics.findByCredentials = async function (email, password)  {
    const user = await User.findOne({email});
    if(!user) throw new Error('Inavlid email or password');
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error ('Inavlid email or password');
    //if there is match
    return user
}

const User = mongoose.model('User', UserSchema)
 
module.exports = User

