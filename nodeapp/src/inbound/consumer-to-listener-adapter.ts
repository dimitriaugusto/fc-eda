import { Consumer } from 'kafkajs';
import EventListener from '../@shared/events/listener';

export default class ConsumerToListenerAdapter {
    private consumer: any;
    private listener: EventListener;

    constructor(consumer: Consumer, listener: EventListener) {
        this.listener = listener;
        this.consumer = consumer;
    }

    async setupOnMessageReceived() {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }:
                    {
                        topic: string; partition: number; message:
                        { key: Buffer | null; value: Buffer | null; offset: string; timestamp: string }
                    }) => {

                    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
                    console.log(`${prefix} - ${message.key?.toString()}#${message.value?.toString()}`);
                    const messageValue = message.value?.toString();

                    if (messageValue) {
                        const parsedMessage = JSON.parse(messageValue);
                        const { account_id_from, account_id_to, balance_account_id_from, balance_account_id_to } = parsedMessage.Payload;
                        const eventName: string = parsedMessage.Name;

                        this.listener.notify(
                            eventName,
                            {
                                account_id_from: account_id_from,
                                account_id_to: account_id_to,
                                balance_account_id_from: balance_account_id_from,
                                balance_account_id_to: balance_account_id_to,
                            }
                        );
                    }

                },
            });
        } catch (error) {
            console.error('Error in consumer:', error);
        };

    }
}