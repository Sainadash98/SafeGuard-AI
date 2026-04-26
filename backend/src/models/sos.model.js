import mongoose from 'mongoose';
const sosSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    message : {
        type : String,
        required : true
    }, 
    location : {
        lat : { //latitude
            type : Number,
            required : true
        },
        lng : { //longitude
            type : Number,
            required : true
        }
    },
    riskLevel : {
        type : String,
        enum : ['low', 'medium', 'high'],
        default : 'low'
    },
    status : {
        type : String,
        enum : ['active', 'resolved'],
        default : 'active'
    }
}
, { timestamps : true });

const Sos = mongoose.model('Sos', sosSchema);
export default Sos;