import express from "express";
import {
  createMessage,
  fetchMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", createMessage);

router.get("/:swapId", fetchMessages);

export default router;