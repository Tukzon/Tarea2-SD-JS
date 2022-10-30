const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

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

let tiempo = -1;
let carrito = {}

const main = async () => {
  const consumer = kafka.consumer({ groupId: "coordenadas" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "coordenadas", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var value = JSON.parse(message.value.toString());
      carrito = {'patente': value['patente'], 'ubicacion': value['ubicacion']}
      if(partition == 0){console.log("Ubicacion registrada:",carrito);} //VIENE DE VENTAS
      else{console.log("Se ha denunciado un carrito profugo:",carrito)} //VIENE DE PROFUGO
      tiempo = 60;
  }})
}

setInterval(function(){
  if(tiempo == 0 && carrito != {}){
    console.log("Se ha eliminado el carrito: ", carrito['patente'])
    carrito = {}
    tiempo = -1
  }
  else{tiempo--}
}, 1000);

app.listen(5002,'0.0.0.0',()=>{
    main()
});