package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com.br/devfullcycle/fc-ms-wallet/internal/database"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/event"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/event/handler"
	createaccount "github.com.br/devfullcycle/fc-ms-wallet/internal/usecase/create_account"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/usecase/create_client"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/usecase/create_transaction"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/web"
	"github.com.br/devfullcycle/fc-ms-wallet/internal/web/webserver"
	"github.com.br/devfullcycle/fc-ms-wallet/pkg/events"
	"github.com.br/devfullcycle/fc-ms-wallet/pkg/kafka"
	"github.com.br/devfullcycle/fc-ms-wallet/pkg/uow"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", "root", "root", "mysql-goapp", "3306", "wallet")
	fmt.Println("Connecting to MySQL with DSN:", dsn)

	dbUrl := "mysql://root:root@tcp(mysql-goapp:3306)/wallet"
	fmt.Println("Connecting to MySQL with URL:", dbUrl)

	waitForMySQL(dsn)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	m, err := migrate.New(
		"file://db/migrations",
		dbUrl,
	)
	if err != nil {
		log.Fatal("Failed to initialize migrate:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Migration failed:", err)
	}

	log.Println("Migrations applied successfully!")

	configMap := ckafka.ConfigMap{
		"bootstrap.servers": "kafka:29092",
		"group.id":          "wallet",
	}
	kafkaProducer := kafka.NewKafkaProducer(&configMap)

	eventDispatcher := events.NewEventDispatcher()
	eventDispatcher.Register("TransactionCreated", handler.NewTransactionCreatedKafkaHandler(kafkaProducer))
	eventDispatcher.Register("BalanceUpdated", handler.NewUpdateBalanceKafkaHandler(kafkaProducer))
	transactionCreatedEvent := event.NewTransactionCreated()
	balanceUpdatedEvent := event.NewBalanceUpdated()

	clientDb := database.NewClientDB(db)
	accountDb := database.NewAccountDB(db)

	ctx := context.Background()
	uow := uow.NewUow(ctx, db)

	uow.Register("AccountDB", func(tx *sql.Tx) interface{} {
		return database.NewAccountDB(db)
	})

	uow.Register("TransactionDB", func(tx *sql.Tx) interface{} {
		return database.NewTransactionDB(db)
	})
	createTransactionUseCase := create_transaction.NewCreateTransactionUseCase(uow, eventDispatcher, transactionCreatedEvent, balanceUpdatedEvent)
	createClientUseCase := create_client.NewCreateClientUseCase(clientDb)
	createAccountUseCase := createaccount.NewCreateAccountUseCase(accountDb, clientDb)

	webserver := webserver.NewWebServer(":8080")

	clientHandler := web.NewWebClientHandler(*createClientUseCase)
	accountHandler := web.NewWebAccountHandler(*createAccountUseCase)
	transactionHandler := web.NewWebTransactionHandler(*createTransactionUseCase)

	webserver.AddHandler("/clients", clientHandler.CreateClient)
	webserver.AddHandler("/accounts", accountHandler.CreateAccount)
	webserver.AddHandler("/transactions", transactionHandler.CreateTransaction)

	fmt.Println("Server is running")
	webserver.Start()
}

func waitForMySQL(dsn string) {
	for {
		db, err := sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			db.Close()
		}
		if err == nil {
			break
		}
		fmt.Println("Waiting for MySQL to be ready...")
		time.Sleep(2 * time.Second)
	}
}
