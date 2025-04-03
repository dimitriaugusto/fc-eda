type BalanceProps = {
    account_id: string;
    balance: number;
};

export default class Balance {
    private _accountId: string;
    private _balance: number;

    constructor(account_id: string, balance: number) {
        this._accountId = account_id;
        this._balance = balance;
    }

    get accountId(): string {
        return this._accountId;
    }

    get balance(): number {
        return this._balance;
    }

    updateBalance(newBalance: number) {
        this._balance = newBalance;
    }
}