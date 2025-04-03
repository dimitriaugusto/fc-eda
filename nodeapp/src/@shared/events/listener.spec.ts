import EventHandlerInterface from "./handler-interface";
import BalanceEventListener, { EventPayload } from "./listener";

describe("EventListener", () => {
    let listener: BalanceEventListener;
    let mockHandler: EventHandlerInterface;

    beforeEach(() => {
        mockHandler = {
            handle: jest.fn(),
        };
        listener = new BalanceEventListener();
    });

    it("should register an event handler", () => {
        listener.register("testEvent", mockHandler);

        const handlers = (listener as any).eventHandlers.get("testEvent");
        expect(handlers).toContain(mockHandler);
    });

    it("should deregister an event handler", () => {
        listener.register("testEvent", mockHandler);
        listener.deregister("testEvent", mockHandler);

        const handlers = (listener as any).eventHandlers.get("testEvent");
        expect(handlers).not.toContain(mockHandler);
    });

    it("should not throw an error when deregistering a non-existent handler", () => {
        expect(() => listener.deregister("nonExistentEvent", mockHandler)).not.toThrow();
    });

    it("should handle multiple handlers for the same event", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("testEvent", mockHandler);
        listener.register("testEvent", anotherHandler);

        const handlers = (listener as any).eventHandlers.get("testEvent");
        expect(handlers).toContain(mockHandler);
        expect(handlers).toContain(anotherHandler);
    });

    it("should not deregister a handler if it does not exist in the event", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("testEvent", mockHandler);
        listener.deregister("testEvent", anotherHandler);

        const handlers = (listener as any).eventHandlers.get("testEvent");
        expect(handlers).toContain(mockHandler);
        expect(handlers).not.toContain(anotherHandler);
    });

    it("should handle multiple events with their respective handlers", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("eventOne", mockHandler);
        listener.register("eventTwo", anotherHandler);

        const handlersEventOne = (listener as any).eventHandlers.get("eventOne");
        const handlersEventTwo = (listener as any).eventHandlers.get("eventTwo");

        expect(handlersEventOne).toContain(mockHandler);
        expect(handlersEventTwo).toContain(anotherHandler);
        expect(handlersEventOne).not.toContain(anotherHandler);
        expect(handlersEventTwo).not.toContain(mockHandler);
    });

    it("should deregister handlers from multiple events independently", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("eventOne", mockHandler);
        listener.register("eventTwo", anotherHandler);

        listener.deregister("eventOne", mockHandler);

        const handlersEventOne = (listener as any).eventHandlers.get("eventOne");
        const handlersEventTwo = (listener as any).eventHandlers.get("eventTwo");

        expect(handlersEventOne).not.toContain(mockHandler);
        expect(handlersEventTwo).toContain(anotherHandler);
    });

    it("should notify all handlers of an event with the provided data", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("testEvent", mockHandler);
        listener.register("testEvent", anotherHandler);

        const eventData: EventPayload = {
            account_id_from: "123",
            account_id_to: "456",
            balance_account_id_from: 789,
            balance_account_id_to: 12,
        };
        listener.notify("testEvent", eventData);

        expect(mockHandler.handle).toHaveBeenCalledWith(eventData);
        expect(anotherHandler.handle).toHaveBeenCalledWith(eventData);
    });

    it("should not notify handlers if the event has no registered handlers", () => {
        listener.notify("nonExistentEvent", {
            account_id_from: "123",
            account_id_to: "456",
            balance_account_id_from: 789,
            balance_account_id_to: 12,
        });

        expect(mockHandler.handle).not.toHaveBeenCalled();
    });

    it("should not throw an error when notifying an event with no handlers", () => {
        expect(() => listener.notify("nonExistentEvent", {
            account_id_from: "123",
            account_id_to: "456",
            balance_account_id_from: 789,
            balance_account_id_to: 12,
        })).not.toThrow();
    });

    it("should notify handlers of multiple events independently", () => {
        const anotherHandler: EventHandlerInterface = {
            handle: jest.fn(),
        };

        listener.register("eventOne", mockHandler);
        listener.register("eventTwo", anotherHandler);

        const eventOneData = {
            account_id_from: Math.random().toString(36).substring(2, 8),
            account_id_to: Math.random().toString(36).substring(2, 8),
            balance_account_id_from: Math.floor(Math.random() * 1000),
            balance_account_id_to: Math.floor(Math.random() * 1000),
        };
        const eventTwoData = {
            account_id_from: Math.random().toString(36).substring(2, 8),
            account_id_to: Math.random().toString(36).substring(2, 8),
            balance_account_id_from: Math.floor(Math.random() * 1000),
            balance_account_id_to: Math.floor(Math.random() * 1000),
        };

        listener.notify("eventOne", eventOneData);
        listener.notify("eventTwo", eventTwoData);

        expect(mockHandler.handle).toHaveBeenCalledWith(eventOneData);
        expect(anotherHandler.handle).toHaveBeenCalledWith(eventTwoData);
        expect(mockHandler.handle).not.toHaveBeenCalledWith(eventTwoData);
        expect(anotherHandler.handle).not.toHaveBeenCalledWith(eventOneData);
    });
});