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
    port: 5432
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

var stock = [];

const main = async () => {

  const consumer = kafka.consumer({ groupId: "stock" });
  await consumer.connect();
  await consumer.subscribe({ topic: "stock", fromBeginning: true });

  await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        var algo = JSON.parse(message.value.toString());

        if(algo["stock"] <= 5){
          console.log("Stock MENOR A 5, SE AGREGA A LA COLA DE MENSAJE PARA NOTIFICAR");
          stock.push(algo["patente"]);
          console.log("TAMAÑO DEL ARREGLO, ES DECIR CUANTOS SE HAN METIDO " + stock.length);
        }
        if(stock.length == 5){
          console.log("LA COLA DE NOTIFICACION ESTA LLENA, SE PROCEDE A MOSTRAR LOS CARRITOS CON FALTA ADE SOPAIPILLAS");
          console.log("Patente de los carritos: "+stock+" con falta de sopapillas");
          stock = [];
        }
      },
    })
};

app.listen(5001,'0.0.0.0',()=>{
    main()
});