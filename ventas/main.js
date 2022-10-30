const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

const pg = require('pg')
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

const ventas = async () => {
  let ventas = await pool.query("SELECT patente, count(*) AS count, sum(cantidad) AS suma, count(DISTINCT cliente) AS cantidad FROM ventas WHERE data_time > now() - interval '1 day' GROUP BY patente")
  data = {}
  ventas.rows.forEach(item => {
    //console.log(item)
    data[item["patente"]] = {'ventas': item["count"], 'promedio_ventas': item["suma"]/item["count"], 'clientes_totales': item["cantidad"]}    
  });
    //data[ventas[i][0]] = {'ventas': ventas[i][1], 'promedio_ventas': (prom_ventas[i][1]/prom_ventas[i][2]), 'clientes_totales': prom_ventas[i][2]}
  console.log(data)
}

const main = async () => {
  const consumer = kafka.consumer({ groupId: "ventas" });
  await consumer.connect();
  await consumer.subscribe({ topic: "ventas", fromBeginning: true });


  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var venta = JSON.parse(message.value.toString());

      console.log("Venta realizada por patente: " + venta["patente"])
    },
  });
};

app.listen(5003,'0.0.0.0',()=>{
    //REPEAT EVERY 24 HOURS VENTA FUNCTION
    setInterval(ventas, 24*60*60*100);
    main().catch(console.error);
});