import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((s) => s.trim()).filter(Boolean)
      : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
