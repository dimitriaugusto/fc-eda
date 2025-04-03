import BalanceEventListener, { EventPayload } from "../../@shared/events/listener";
import UpdateBalanceUseCaseFactory from "../../factory/update-balance-usecase-factory";

export default function setupBalanceUpdateHandler(listener: BalanceEventListener, eventName: string) {
    listener.register(
        eventName,
        {
            handle: async (eventPayload: EventPayload) => {
                const updateBalanceUseCase = UpdateBalanceUseCaseFactory.create();
                updateBalanceUseCase.execute(
                    {
                        account_id_from: eventPayload.account_id_from,
                        account_id_to: eventPayload.account_id_to,
                        balance_account_id_from: eventPayload.balance_account_id_from,
                        balance_account_id_to: eventPayload.balance_account_id_to,
                    }
                );
            }
        });
}