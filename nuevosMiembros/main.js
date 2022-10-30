const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'postgres',
  database: 'tarea2',
  password: 'postgres',
  port: 5432,
})

const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cors())

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

const main = async () => {
  const consumer = kafka.consumer({ groupId: "miembros" });
  await consumer.connect();
  await consumer.subscribe({ topic: "miembros", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var miembro = JSON.parse(message.value.toString());
      if(partition == 0){console.log("Nuevo miembro registrado: "+ miembro['nombre']+ " " + miembro['apellido']);}
      else{console.log("Nuevo miembro premium registrado: "+ miembro['nombre']+ " " + miembro['apellido'])}
    },
  })
}

app.listen(5000,'0.0.0.0',()=>{
    main()
});