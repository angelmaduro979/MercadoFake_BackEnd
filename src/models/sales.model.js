import mongoose from "mongoose";


const salesSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    purchase: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchases',
        required: true
    },
    purchaseStatus: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });


const Sales= mongoose.model('Sales', salesSchema)

export default Sales ;
