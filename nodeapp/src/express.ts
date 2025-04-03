import express, { Express } from "express";
import { balancesRoute } from "./api/routes/balances-route";

export const app: Express = express();

app.use(express.json());
app.use("/balances", balancesRoute);
