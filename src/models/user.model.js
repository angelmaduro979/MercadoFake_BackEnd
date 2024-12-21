import mongoose from "mongoose";


const userFields={
    email:{
        type: String,
        required: true,
        unique:true,
        trim: true
    }, 
    name:{
        type: String,
        required: true,
        trim: true
    }, 
    phone:{
        type: String,
        required: true,
        unique:true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    verificationToken:{
        type: String,
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user',
        required: true
    },

    productsPurchased: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number, 
                required: true
            }
        }
    ],

    productsSold: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number, 
                required: true
            }
        }
    ],

    activo:{
        type:Boolean,
        default: true
    }

}
const SchemaUser = mongoose.Schema;
const userSchema= new SchemaUser(userFields,{timestamps: true})
const User= mongoose.model('User', userSchema)

export default User