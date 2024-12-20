import prisma from "../database/client.js";
import Customer from "../models/customer.js";
import {ZodError} from 'zod'


const controller = {} // objeto vazio

controller.create = async function (req,res){
    try{
        // chama o zod para validação do cliente
        Customer.parse(req.body)
        await prisma.customer.create({data:req.body})
        // HTTP 201: Created
        res.status(201).end()
    } 
    catch(error){
        console.error(error)

        // se for erro de validação do zod retorna 
        //HTTP 422: unprocessable entity
        if (error instanceof ZodError) res.status(422).send(error.issues)
        //HTTP 500: Internal Server Error
        else res.status(500).end() 
    }   
}

controller.retrieveAll = async function (req,res){
    try {
        const result = await prisma.customer.findMany({
            orderBy: [
                {name:'asc'},
            ],
            include:{
                cars: req.query.include === 'cars'
            }
        })
        // HTTP 200 :OK (IMPLICITO)
        res.send(result)

    }
    catch(error){
        console.error(error)

        //HTTP 500: Internal Server Error

        res.status(500).end()
    }
}
controller.retrieveOne = async function (req,res){
    try {
        const result = await prisma.customer.findUnique({
            where: {id: Number(req.params.id)},
            include:{
                cars: req.query.include === 'cars'
            }
    })
        // incontrou retorna HTTP 200 :OK (IMPLICITO)
       if(result)  res.send(result)
        // nao encocontrou retorna HTTP 404: NOT FOUND
       else res.status(404).end()

    }
    catch(error){
        console.error(error)

        //HTTP 500: Internal Server Error

        res.status(500).end()
    }
}

controller.update = async function (req,res) {
    try {
        // chama o zod para validação do cliente
        Customer.parse(req.body)

        const result = await prisma.customer.update({
            where: {id : Number(req.params.id)},
            data: req.body
        })
        //encontrou e atualizou HTTP 204 : not content
        if (result)res.status(204).end()
        //nao encontrou (e nao atualizou ) HTTP 404 not found
        else res.status(404).end()
    }
    catch(error){
        console.error(error)

        // se for erro de validação do zod retorna 
        //HTTP 422: unprocessable entity
        if (error instanceof ZodError) res.status(422).send(error.issues)

        //HTTP 500: Internal Server Error

        else res.status(500).end()
    }    
}

controller.delete = async function (req,res) {
    try {
        await prisma.customer.delete ({
            where: {id: Number(req.params.id)}
        })
        // encontrou e excluiu HTTP 204 no content
        res.status(204).end()
        
    }
    catch(error){
        if (error?.code ==='P2025'){
            // nao endcontrou NOT FOUND
            res.status(404).end()
        }
        else {
            // outros erros
            console.error(error)
            // HTTP 500 Internal Server Error
            res.status(500).end()
        }
    }  
    
}


export default controller 