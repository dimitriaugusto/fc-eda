import BalanceRepository from "../repository/balance.repository";
import UpdateBalanceUseCase from "../usecase/update-balance-usecase";

export default class UpdateBalanceUseCaseFactory {
    static create(): UpdateBalanceUseCase {
        const balanceGateway = new BalanceRepository();
        return new UpdateBalanceUseCase(balanceGateway);
    }
}