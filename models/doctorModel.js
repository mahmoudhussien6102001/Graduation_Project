const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    specialty:{
        type:String ,
        required: true
    },
    hosptial_name:{
        type:String,
        required: true
    }
   
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
