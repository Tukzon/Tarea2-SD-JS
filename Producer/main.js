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

app.post("/newMember", (req, res) => {(async () => {
    if (!req.body) {
        res.status(400).send("No input data provided");
        return;
    }
    await pool.query("INSERT INTO miembros (nombre, apellido, rut, correo, patente, premium, stock) VALUES ($1, $2, $3, $4, $5, $6, $7)", [req.body.nombre, req.body.apellido, req.body.rut, req.body.correo, req.body.patente, req.body.premium, req.body.stock]);
    const producer = kafka.producer();
    await producer.connect();
    const { nombre, apellido, rut, correo, patente, premium, stock } = req.body;
    let miembro = {
        nombre: nombre,
        apellido: apellido,
        rut: rut,
        correo: correo,
        patente: patente,
        premium: premium,
        stock: stock
    }
    value = JSON.stringify(miembro);
    if(!miembro["premium"]){
        const topicMessages = [
        {
            topic: 'miembros',
            partition : 0,
            messages: [{value: JSON.stringify(miembro), partition: 0}]
        },
        ]
        await producer.sendBatch({ topicMessages })
    }else{
        
        const topicMessages = [
        {
            topic: 'miembros',
            messages: [{value: JSON.stringify(miembro), partition: 1}]
        },
        ]
        await producer.sendBatch({ topicMessages })
    }

    await producer.disconnect();

    res.status(200).json({message: 'Member registered successfully'});  
    })();

});

app.post("/newVenta", (req, res) => {(async () => {
    if (!req.body) {
        res.status(400).send("No input data provided");
        return;
    }
    await pool.query("INSERT INTO ventas (patente,cliente, cantidad, ubicacion) VALUES ($1, $2, $3, $4)", [req.body.patente, req.body.cliente, req.body.cantidad, req.body.ubicacion]);
    const producer = kafka.producer();
    await producer.connect();
    const { patente, cliente, cantidad, ubicacion } = req.body;

    let venta = {
        patente: patente,
        cliente: cliente,
        cantidad: cantidad,
        ubicacion: ubicacion
    }
    const topicMessages = [
        {
            topic: 'coordenadas',
            partition: 0,
            messages: [{value: JSON.stringify(venta), partition: 0}]
        },
        {
            topic: 'ventas',
            messages: [{value: JSON.stringify(venta)}]
        },
        {
            topic: 'stock',
            messages: [{value: JSON.stringify(venta)}]
        }
    ]
        await producer.sendBatch({ topicMessages })
        await producer.disconnect();
        res.status(200).json({message: 'Venta registered successfully'});
    })();
});

app.post("/carritoProfugo", (req, res) => {(async () => {
    if (!req.body) {
        res.status(400).send("No input data provided");
        return;
    }
    const producer = kafka.producer();
    
    await producer.connect();
    const { patente,ubicacion} = req.body;
    
    let localizacion = {
        patente: patente,
        ubicacion: ubicacion,
    }
    valido = await pool.query("SELECT * FROM miembros WHERE patente = $1", [patente]);
    if(valido.rowCount == 0){
        res.status(400).send("Patente no existe");
        return;   
    }
    value = JSON.stringify(localizacion)
    const topicMessages = [
    {
        topic: 'coordenadas',
        partition : 1,
        messages: [{value: JSON.stringify(localizacion), partition: 1}]
    },
    ]
    await producer.sendBatch({ topicMessages })
    await producer.disconnect();
    res.json("Carrito denunciado como profugo");
    })();
});

app.listen(8000,'0.0.0.0', () => {
    console.log(`Producer ON`);
});