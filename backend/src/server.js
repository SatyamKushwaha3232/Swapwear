
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import http from "node:http";
import { Server } from "socket.io";

import notificationRoutes from "./routes/notification.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import swapRoutes from "./routes/swap.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import deliveryRoutes from "./modules/delivery/delivery.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import trustRoutes from "./modules/trust/trust.routes.js";
import { appConfig } from "./config/app.config.js";
import { validateProductionConfig } from "./config/app.config.js";
import { prisma } from "./config/prisma.js";

dotenv.config();
validateProductionConfig();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: appConfig.clientUrls,
        credentials: true
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    socket.on("user:join", (userId) => {
        if (userId) socket.join(`user:${userId}`);
    });

    socket.on("user:leave", (userId) => {
        if (userId) socket.leave(`user:${userId}`);
    });

    socket.on("conversation:join", (conversationId) => {
        if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
        if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on("chat:typing", (payload = {}) => {
        if (payload.conversation_id) {
            socket.to(`conversation:${payload.conversation_id}`).emit("chat:typing", payload);
        }
    });

    ["call:start", "call:accept", "call:reject", "call:end", "webrtc:offer", "webrtc:answer", "webrtc:ice-candidate"].forEach((eventName) => {
        socket.on(eventName, (payload = {}) => {
            if (payload.conversation_id) {
                socket.to(`conversation:${payload.conversation_id}`).emit(eventName, payload);
            }
        });
    });
});

app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || appConfig.clientUrls.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(appConfig.uploadDir)));

app.get("/", (_req,res)=>{
    res.json({
        success:true,
        message:"SwapWear Backend Running",
        mode:"manual-postgres-ready"
    });
});

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`select 1`;
        res.json({
            success: true,
            status: "ok",
            database: "ok",
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: "unhealthy",
            database: "error",
            error: error.message
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trust", trustRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/listings",listingRoutes);
app.use("/api/swaps", swapRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal server error"
    });
});

const PORT=appConfig.port;

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the existing backend or set PORT to another value.`);
        process.exit(1);
    }

    console.error(error);
    process.exit(1);
});

server.listen(PORT,()=>{
    console.log(`Server Running On ${PORT}`);
});

async function shutdown(signal) {
    console.log(`${signal} received, closing server`);
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
