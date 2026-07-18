import express from "express";
import multer from "multer";
import {
  addReaction,
  createConversation,
  createMessage,
  fetchConversations,
  fetchMessages,
  patchCall,
  patchMessage,
  seenConversation,
  startCall,
  typing,
  uploadFile,
} from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype?.startsWith("image/") ||
      file.mimetype?.startsWith("audio/") ||
      [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.mimetype);

    if (!ok) {
      cb(new Error("Unsupported chat attachment type"));
      return;
    }

    cb(null, true);
  },
});

router.use(requireAuth);

router.get("/conversations", fetchConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:conversationId/messages", fetchMessages);
router.post("/messages", createMessage);
router.patch("/messages/:id", patchMessage);
router.post("/messages/:id/reactions", addReaction);
router.post("/upload", upload.single("file"), uploadFile);
router.post("/conversations/:conversationId/seen", seenConversation);
router.post("/conversations/:conversationId/typing", typing);
router.post("/calls", startCall);
router.patch("/calls/:id", patchCall);

export default router;
