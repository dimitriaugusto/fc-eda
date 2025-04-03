import Balance from "../domain/balance-entity";
import BalanceGateway from "../gateway/balance-gateway";
import { UpdateBalanceUseCaseInputDTO } from "./update-balance-dto";

export default class UpdateBalanceUseCase {
    private balanceGateway: BalanceGateway;

    constructor(balanceGateway: BalanceGateway) {
        this.balanceGateway = balanceGateway;
    }

    async execute(input: UpdateBalanceUseCaseInputDTO): Promise<void> {
        const balanceFrom = new Balance(input.account_id_from, input.balance_account_id_from);
        const balanceTo = new Balance(input.account_id_to, input.balance_account_id_to);

        try {
            await this.balanceGateway.update(balanceFrom);
        } catch (error) {
            await this.balanceGateway.add(balanceFrom);
        }

        try {
            await this.balanceGateway.update(balanceTo);
        } catch (error) {
            await this.balanceGateway.add(balanceTo);
        }
    }
}