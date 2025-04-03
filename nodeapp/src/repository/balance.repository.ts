import Balance from "../domain/balance-entity";
import BalanceIsExisting from "../domain/balance-is-existing-error";
import BalanceNotFoundError from "../domain/balance-not-found-error";
import BalanceGateway from "../gateway/balance-gateway";
import { BalanceModel } from "./balances-model";

export default class BalanceRepository implements BalanceGateway {

    async add(balance: Balance): Promise<Balance> {
        const existingBalance = await BalanceModel.findOne({ where: { account_id: balance.accountId } });
        if (existingBalance) {
            throw new BalanceIsExisting("Balance Is Existing: " + balance.accountId);
        }

        await BalanceModel.create({
            account_id: balance.accountId,
            balance: balance.balance
        });

        return new Balance(balance.accountId, balance.balance);
    }

    async update(balance: Balance): Promise<Balance> {
        const [rowsUpdate] = await BalanceModel.update(
            { balance: balance.balance },
            { where: { account_id: balance.accountId } }
        );

        if (rowsUpdate === 0) {
            throw new BalanceNotFoundError("Account not found");
        }

        return new Balance(balance.accountId, balance.balance);
    }

    async find(id: string): Promise<Balance> {
        const balance = await BalanceModel.findOne({ where: { account_id: id } });

        if (balance)
            return new Balance(balance.account_id, balance.balance);

        throw new BalanceNotFoundError("Account not found");
    }
}