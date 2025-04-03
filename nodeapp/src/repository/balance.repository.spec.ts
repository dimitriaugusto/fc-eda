import { Sequelize } from "sequelize-typescript";
import Balance from "../domain/balance-entity";
import BalanceIsExisting from "../domain/balance-is-existing-error";
import BalanceNotFoundError from "../domain/balance-not-found-error";
import BalanceRepository from "./balance.repository";
import { BalanceModel } from "./balances-model";

describe("BalanceRepository", () => {

    let sequelize: Sequelize

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            sync: { force: true }
        })

        sequelize.addModels([BalanceModel])
        await sequelize.sync()
    })

    afterEach(async () => {
        await sequelize.close()
    })

    it("should throw BalanceNotFoundError when balance is not found", async () => {
        let balanceRepository = new BalanceRepository();

        await expect(balanceRepository.find("123")).rejects.toThrow(BalanceNotFoundError);
    })

    it("should find a Balance object", async () => {
        let balanceRepository = new BalanceRepository();

        const balance = { account_id: "123", balance: 1000 };
        BalanceModel.create(balance);

        const result = await balanceRepository.find("123");

        expect(result).toBeInstanceOf(Balance);
        expect(result.accountId).toBe("123");
        expect(result.balance).toBe(1000);
    })

    it("should create up update balance table", async () => {
        let balanceRepository = new BalanceRepository();

        const balance = new Balance("123", 1000);
        await balanceRepository.add(balance);

        const result = await BalanceModel.findOne({ where: { account_id: "123" } });
        expect(result).toBeDefined();
        expect(result.account_id).toBe("123");
        expect(result.balance).toBe(1000);

    });

    it("should update the balance for an existing account", async () => {
        let balanceRepository = new BalanceRepository();

        const initialBalance = new Balance("123", 1000);
        await balanceRepository.add(initialBalance);

        const updatedBalance = new Balance("123", 2000);
        await balanceRepository.update(updatedBalance);

        const result = await BalanceModel.findOne({ where: { account_id: "123" } });
        expect(result).toBeDefined();
        expect(result.account_id).toBe("123");
        expect(result.balance).toBe(2000);
    });

    it("should throw BalanceIsExisting error when adding an existing balance", async () => {
        let balanceRepository = new BalanceRepository();

        const balance = new Balance("123", 1000);
        await balanceRepository.add(balance);

        await expect(balanceRepository.add(balance)).rejects.toThrow(BalanceIsExisting);
    });

    it("should fail if update on non-existing account", async () => {
        let balanceRepository = new BalanceRepository();

        const nonExistingBalance = new Balance("999", 5000);
        await expect(balanceRepository.update(nonExistingBalance)).rejects.toThrow(BalanceNotFoundError);
    });

    it("should fail to add if account_id already exists", async () => {
        let balanceRepository = new BalanceRepository();

        const balance = new Balance("123", 1000);
        await balanceRepository.add(balance);
        await expect(balanceRepository.add(balance)).rejects.toThrow();
    });

});