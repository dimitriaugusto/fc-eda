export default class BalanceNotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}