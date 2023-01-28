const { default: mongoose } = require("mongoose")


const subscriber = new mongoose.Schema({
    user:{
        type:Number,
        required:true,
        
    },
    subscribed:{
        type:Boolean,
        default:false
    }
})
const Subscribers = mongoose.model('Subscribers',subscriber)

module.exports = Subscribers;
