import path from "path";
import cors from "cors";
import express, { Application } from "express";
import sequenceRoutes from "./routes/sequence.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/sequence", sequenceRoutes);

export default app;
