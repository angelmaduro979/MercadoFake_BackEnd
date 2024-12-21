import mongoose from "mongoose";




const purchaseSchema = new mongoose.Schema({
   
    
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
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
    totalAmount: {
        type: Number, 
        required: true
    },
    paymentMethod: {
        type: String, 
        required: true
    },
    paymentStatus: {
        type: String, 
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pendiente'
    }
},{timestamps: true});

const Purchases= mongoose.model('Purchases', purchaseSchema);

export default Purchases;
