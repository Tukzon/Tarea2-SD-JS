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

var carrito = []
var carritoP = []

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ubicacion_check = async () => {
  while(true){
    await sleep(5000)
    for(let i=0; i<=carrito.length-1; i++)
    {
      if((Date.now()/1000 - carrito[i]["tiempo"]) > 60){
        console.log("Borrando ubicacion de carrito:",carrito[i]["patente"]);
        carrito.splice(i,1);
      }
    }
  }
}

const main = async () => {
  const consumer = kafka.consumer({ groupId: "coordenadas" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "coordenadas", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var value = JSON.parse(message.value.toString());

      if(partition == 0)
      {
        console.log("Entra a particion 0")
        console.log("Carrito esta bien")

        
        var find = false;
        for(let i=0; i<=carrito.length-1; i++)
        {
          if(carrito[i]["patente"] === value["patente"]){
            find = true;
            carrito[i]["cordenadas"] = value["coordenadas"];
            carrito[i]["tiempo"] = Date.now()/1000;
            console.log("actualizando ubicacion de carrito "+carrito[i]["patente"]+" a "+carrito[i]["coordenadas"]);
          }
        }
        if(!find){
          carrito.push({"patente":value["patente"],"coordenadas":value["coordenadas"],"tiempo":Date.now()/1000});
          console.log("añadiendo ubicacion de carrito "+value["patente"],"(coordenadas:",value["coordenadas"]+")")
        }
        

      }
      else if(partition == 1)
      {
        carritoP.push(value["coordenadas"]);
        console.log("Entra en particion 1")
        console.log("Este carrito es profugo, patente:", value["patente"])
        console.log(carritoP)
      }
    },
  })
}

ubicacion_check()

app.listen(5002,'0.0.0.0',()=>{
    main()
});