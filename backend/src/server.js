
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import notificationRoutes from "./routes/notification.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import swapRoutes from "./routes/swap.routes.js";
import listingRoutes from "./routes/listing.routes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.get("/", (req,res)=>{
    res.json({
        success:true,
        message:"SwapWear Backend Running"
    });
});

app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/listings",listingRoutes);
app.use("/api/swaps", swapRoutes);

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server Running On ${PORT}`);
});