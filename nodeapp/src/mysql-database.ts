import { Sequelize } from "sequelize-typescript";
import { BalanceModel } from "./repository/balances-model";

export let sequelize: Sequelize;

export async function setupDb() {
    sequelize = new Sequelize({
        dialect: "mysql",
        host: "mysql-nodeapp",
        port: 3306,
        // host: "localhost",
        // port: 3307,
        username: "root",
        password: "root",
        database: "balances",
        logging: false,
    });
    sequelize.addModels([BalanceModel]);

    let retries = 10;
    while (retries) {
        try {
            await sequelize.authenticate();
            console.log("Database connected successfully.");
            break;
        } catch (err) {
            console.error("Unable to connect to the database. Retrying...", err);
            retries -= 1;
            if (retries === 0) throw err;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }

    await sequelize.sync();
}
