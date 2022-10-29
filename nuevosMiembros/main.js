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

var miembrosP = [];
var miembrosN = [];

const main = async () => {
  const consumer = kafka.consumer({ groupId: "miembros" });
  await consumer.connect();
  await consumer.subscribe({ topic: "miembros", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if(partition == 1)
      {
        var miembro = JSON.parse(message.value.toString());
        miembrosP.push(miembro);
        console.log("Nuevo miembro premium registrado")
        console.log("Miembros Premium:" , miembrosP.length)
        if(miembrosP.length > 0)
        {
          console.log(miembrosP)
        }
      }
      else if(partition == 0)
      {
        var miembro = JSON.parse(message.value.toString());
        miembrosN.push(miembro);
        console.log("Nuevo miembro registrado")
        console.log("Miembros:" ,miembrosN.length)
        if(miembrosN.length > 0 )
        {
          console.log(miembrosN)
        }
      }
      

    },
  })
}

app.listen(5000,'0.0.0.0',()=>{
    main()
});