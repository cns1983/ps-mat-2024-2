import prisma from "../database/client.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const controller = {} // objeto vazio

controller.create = async function (req,res){
    try{
        // verificando se foi passado o campo password
        if (req.body.password){
            req.body.password = await bcrypt.hash(req.body.password,12)
        }
        await prisma.user.create({data:req.body})
        // HTTP 201: Created
        res.status(201).end()
    } 
    catch(error){
        console.error(error)
        //HTTP 500: Internal Server Error
        res.status(500).end() 
    }   
}

controller.retrieveAll = async function (req,res){
    try {
        const result = await prisma.user.findMany({
            omit: {password: true},
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
        const result = await prisma.user.findUnique({
            omit: {password: true},
            where: {id: Number(req.params.id)}
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
        if (req.body.password){
            req.body.password = await bcrypt.hash(req.body.password,12)
        }
        const result = await prisma.user.update({
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

        //HTTP 500: Internal Server Error

        res.status(500).end()
    }    
}

controller.delete = async function (req,res) {
    try {
        await prisma.user.delete ({
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
controller.login = async function (req,res) {
    try {
        // buscar o usuario no banco de dados
        // username ou email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {username: req.body?.username},
                    {email: req.body?.email}
                ]
            }
        })
        // Se o usuário não for encontrado, retorna
        // HTTP 401: Unauthorized
        if(! user) return res.status(401).end

        // Usuário encontrado, vamos conferir a senha
        const passwordIsValid = await bcrypt.compare(req.body?.password,user.password)

        // Se a senha estiver errada, retorna
        // HTTP 401: Unauthorized
        if(!passwordIsValid) return res.status(401).end()

        // Usuário e senha OK, passamos ao procedimento de gerar o token
        const token = jwt.sign(
            user,                       // Dados do usuário
            process.env.TOKEN_SECRET,   // Senha para criptografar o token
            {expiresIn: '24h'}          // Prazo de validade do token

        )
        // Formamos o cookie para enviar ao front-end
        res.cookie(process.env.AUTH_COOKIE_NAME, token,{
            httpOnly: true,   // O cookie ficará inacessível para o JS no front-end
            secure: true,   // O cookie será criptografado em conexões https
            sameSite:'none',
            path:'/',
            maxAge: 24 * 60 * 60 * 100  //24 hrs

        })
        // Retorna o token e o usuário autenticado
      // res.send({token, user})

      // Com a implementação do cookie, apenas o usuário é
      // retornado ao front-end
      // HTTP 200: OK (implícito)
        res.send({user}).end()
    }
    catch(error){
        console.error(error)

        //HTTP 500: Internal Server Error

        res.status(500)
    } 
}
controller.logout = function(req, res){
    // Apaga no front-end o cookie que armazena o token de autorização
    res.clearCookie(process.env.AUTH_COOKIE_NAME)
    // HTTP 204: No Content
    res.status(204).end()
}
controller.me = function(req,res){
    // retorna as informações do usuario autenticado
    // HTTP 200: OK (implícito)
  res.send(req?.authUser)
  
}


export default controller 