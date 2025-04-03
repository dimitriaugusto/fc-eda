import { Kafka } from "kafkajs";
import ConsumerToListenerAdapter from "./inbound/consumer-to-listener-adapter";
import setupBalanceUpdateHandler from "./inbound/events/balance-updated-handler";

const kafka = new Kafka({
    clientId: 'transaction-consumer',
    brokers: ['kafka:29092'],
    // brokers: ['localhost:9092'],
});
const consumer = kafka.consumer({ groupId: 'wallet' })
const topics = ['balances'];

export async function setupConsumer(listener: any) {
    try {
        await consumer.connect();
        console.log('Consumer connected');

        for (const topic of topics) {
            await consumer.subscribe({ topic, fromBeginning: true });
            console.log(`Subscribed to topic: ${topic}`);
        }

        consumer.on('consumer.crash', async (error: any) => {
            console.error('Consumer crashed:', error);
            await consumer.disconnect();
        });

        new ConsumerToListenerAdapter(consumer, listener).setupOnMessageReceived();
        setupBalanceUpdateHandler(listener, "BalanceUpdated");

    } catch (error) {
        console.error('Error in consumer:', error);
        await consumer.disconnect();
    };
}

