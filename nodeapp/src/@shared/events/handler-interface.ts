import { EventPayload } from "./listener";

export default interface EventHandlerInterface {
    handle(eventPayload: EventPayload): Promise<void>;
}