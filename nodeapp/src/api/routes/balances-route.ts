import express, { Request, Response } from "express";
import { BalanceModel } from "../../repository/balances-model";

export const balancesRoute = express.Router();

balancesRoute.get("/:id", async (req: Request, res: Response) => {
    BalanceModel.findOne({
        where: {
            account_id: req.params.id
        }
    }).then((balance) => {
        if (balance) {
            res.status(200).json({
                account_id: balance.account_id,
                balance: balance.balance
            });
        } else {
            res.status(404).json({
                message: "Account not found"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    });
});