const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const patientSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
        history_type:{
            type: String,
            enum:{
                values :['genetical', 'post', 'present'],
                message : 'history_type must be one of [genetical, post, present ]'
            } 
        },
        responsible_doctor:{
            type:String,
            required: true
        },
        initial_diagnosis:{
            type: String,
            required: true
        },
        complain:{
            type:String,
            required: true
        },
        medical_tests:{
            type: [String],
            required: true

        },
        rays:{
            type: [String],
            required: true
        },
        treatment:{
            type:String,
            required: true

        },
        consult_another_doctor:{
            type: String,
            enum:{
                 values:  ['Yes', 'No'],
                message :'smoking must be one of [Yes, No]',

            },
            description:{
                type: String,
                required: true
            },
            required: true
        },

        smoking: {
            type: String,
            enum: {
                values:  ['Yes', 'No'],
                message :'smoking must be one of [Yes, No]'
            }
        },
        allergy: {
            type: String,
            enum: {
                values:  ['Yes', 'No'],
                message :'allergy must be one of [Yes, No]'
            }
        },
        infection: {
            type: String,
            enum: {
                values:  ['Yes', 'No'],
                message :'infection must be one of [Yes, No]'
            }
        },
        diagnosis_result: {
            type: String,
            required: true
        },
        final_report: {
            type:String,
            required: true
        },
        comments: {
            type:String
        },
        segmented_image:{
            type: [String],
            required: true
        }
    
    
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
