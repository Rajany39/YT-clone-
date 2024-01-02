const mongoose = require('mongoose')

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectID,
        ref : 'User'
    },
    channel : {
        type : Schema.Types.ObjectID,
        ref : 'User'
    },

})



module.exports = mongoose.Model('Subscription' , subscriptionSchema)