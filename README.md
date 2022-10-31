
# Tarea 2 Sistemas Distribuidos

Sistema con Apache Kafka para distribuir la carga de los distintos
servidores en funcionamiento con sus respectivas tareas.



## Herramientas Utilizadas

 - [Kafka](https://kafka.apache.org/documentation/#gettingStarted)
 - [Zookeper](https://zookeeper.apache.org/doc/r3.8.0/index.html)
 - [NodeJS](https://nodejs.org/en/docs/guides/)
 - [PostgreSQL](https://www.postgresql.org/)
 - [Pool](https://node-postgres.com/api/pool)
 - [Docker](https://www.docker.com/)


## Deployment

To deploy this project run

```bash
  docker-compose build --no-cache
  docker-compose up --force-recreate
```
    


## API Reference

#### Ingresar Nuevo Miembro

```http
  POST localhost:8000/newMember
```

```json
{
    "nombre": "John",
    "apellido": "Doe",
    "rut": "99.999.999-9",
    "correo": "john.doe@mail.udp.cl",
    "patente": "abcd12",
    "premium": 1,
    "stock": 999
}
```

#### Ingresar Nueva Venta

```http
POST localhost:8000/newVenta
```
```json
{
    "patente": "abcd12",
    "cliente": "John Doe",
    "cantidad": 999,
    "ubicacion": "-33.452607772695686, -70.66136977581571"
}
```
#### Ingresar Carrito Profugo
```http
POST localhost:8000/carritoProfugo

```
```json
{
    "patente": "abcd12",
    "ubicacion":"-33.452607772695686, -70.66136977581571"
}
```

## Authors

- [@Tukzon](https://www.github.com/Tukzon)
- [@Mringeling17](https://www.github.com/Mringeling17)

