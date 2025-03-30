FROM golang:1.22

WORKDIR /app/

COPY go.mod go.sum ./

RUN go mod download

RUN apt-get update && apt-get install -y librdkafka-dev

COPY . .

RUN go build -o /app/main ./cmd/walletcore

CMD ["/app/main"]