import { Router } from 'express'
import prisma from '../database/client.js'

const router = Router()

/* GET home page. */
router.get('/', function (req, res) {
  res.send('Hello World!')
})

// esta rota sera chamada por um cronjob para fazer uma requisição ao banco de dados e tentar manter o projeto ativo no supabase
router.get('/keep-alive', async function (req,res) {
  try {
    // uma simples requisição ao BD, obtendo o numero de usuarios cadastrados
    await prisma.user.count()
    res.status(204).end()
  }
  catch(error){
    console.error(error)
    res.status(204).end()
  }
})

export default router
