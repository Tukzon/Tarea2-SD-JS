const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

const pg = require('pg');
const pool = new pg.Pool({
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

var low_stock = [];

const main = async () => {

  const consumer = kafka.consumer({ groupId: "stock" });
  await consumer.connect();
  await consumer.subscribe({ topic: "stock", fromBeginning: true });

  await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        var value = JSON.parse(message.value.toString());
        
        resStock = await pool.query("SELECT stock FROM miembros WHERE patente = $1", [value['patente']])
        stock = resStock.rows[0]['stock']
        if(stock - value["cantidad"] < 20 && !low_stock.includes(value['patente'])){
          low_stock.push(value['patente']);
          //console.log("Stock bajo para la patente: " + value['patente']);
        }
        if(low_stock.length == 5){
          console.log("Stock bajo para las patentes: " + low_stock);
          await pool.query("UPDATE miembros SET stock = 30 WHERE patente in ($1,$2,$3,$4,$5)", (low_stock));
          console.log("SE HA AÑADIDO STOCK AUTOMATICAMENTE A LAS PATENTES: " + low_stock + " A 30 UNIDADES");
          low_stock = [];
        }
        await pool.query("UPDATE miembros SET stock = stock - $1 WHERE patente = $2", [value['cantidad'], value['patente']]);
        }})
    };

app.listen(5001,'0.0.0.0',()=>{
    main()
});