import { Router } from "express";
import { getSequence, processSequence } from "../controllers/sequence.controller";

const router = Router();

router.get("/:id", getSequence);
router.post("/process", processSequence);

export default router;
