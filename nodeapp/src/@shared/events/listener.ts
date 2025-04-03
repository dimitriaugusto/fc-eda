import EventHandlerInterface from "./handler-interface";

export interface EventPayload {
    account_id_from: string;
    account_id_to: string;
    balance_account_id_from: number;
    balance_account_id_to: number;
}

export default class BalanceEventListener {

    private eventHandlers: Map<string, EventHandlerInterface[]> = new Map();

    register(eventName: string, handler: EventHandlerInterface) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName)?.push(handler);
    }

    deregister(eventName: string, handler: EventHandlerInterface) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    notify(eventName: string, eventPayload: EventPayload) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler.handle(eventPayload));
        }
    }
}