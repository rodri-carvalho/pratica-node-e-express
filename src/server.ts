import express from 'express';
import { PrismaClient } from '@prisma/client';

const port = 3000
const app = express()
const prisma = new PrismaClient();

app.use(express.json())

app.get("/movies", async (req,res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc'
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies)
});

app.post('/movies', async (req, res) => {
    console.log(`Conteúdo do body enviado na requisição: ${req.body.title}`);

    const { title, genre_id, language_id, oscar_count, release_date } = req.body

    try{

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } }
        });

        if(movieWithSameTitle){
            return res.status(409).send({message: "Já existe um filme cadastrado com esse título."});
        }

    await prisma.movie.create({
        data: {
            title,
            genre_id,
            language_id,
            oscar_count,
            release_date: new Date(release_date)
        }
    });
}catch(err){
    return res.status(500).send({message:"Falha ao cadastrar um filme."})
}
    res.status(201).send()    
})

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
})