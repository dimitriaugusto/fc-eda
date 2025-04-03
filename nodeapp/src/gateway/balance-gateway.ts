import Balance from "../domain/balance-entity";

export default interface BalanceGateway {
    add(invoice: Balance): Promise<Balance>;
    update(invoice: Balance): Promise<Balance>;
    find(id: string): Promise<Balance>;
}