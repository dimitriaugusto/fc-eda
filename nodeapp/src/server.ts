import BalanceEventListener from "./@shared/events/listener";
import { app } from "./express";
import { setupConsumer } from "./kafka";
import { setupDb } from "./mysql-database";

const port: number = Number(process.env.PORT) || 3000;

setupDb()
  .then(() => {
    console.log("Database setup completed.");
  })
  .catch((err) => {
    console.error("Error setting up the database:", err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

setupConsumer(
  new BalanceEventListener()
);