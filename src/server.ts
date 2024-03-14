import express from 'express';
import { PrismaClient } from '@prisma/client';

const port = 3000
const app = express()
const prisma = new PrismaClient();

app.use(express.json())


    
    ///////////////

    // // Modificando o endpoint de listagem de filmes para permitir ordenação por diversos critérios
 
    // app.get("/movies/sort", async (req, res) => {
    //     const { sort } = req.query;
    //     console.log(sort);
    //     let orderBy: Prisma.MovieOrderByWithRelationInput | Prisma.MovieOrderByWithRelationInput[] | undefined;
    //     if (sort === "title") {
    //         orderBy = {
    //             title: "asc",
    //         };
    //     } else if (sort === "release_date") {
    //         orderBy = {
    //             release_date: "asc",
    //         };
    //     }
    
    //     try {
    //         const movies = await prisma.movie.findMany({
    //             orderBy,
    //             include: {
    //                 genres: true,
    //                 languages: true,
    //             },
    //         });
    
    //         res.json(movies);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).send({ message: "Houve um problema ao buscar os filmes." });
    //     }
    // });

    ////////////////

//     app.get("/movies", async (req, res) => {

//     const totalMovies = await prisma.movie.count();

//     const averageMovieLenght = await prisma.movie.aggregate({
//         _avg: {
//             movie_lenght: true
//         }
//     });

//     const movies = await prisma.movie.findMany({
//         orderBy: {
//             title: 'asc'
//         },
//         include: {
//             genres: true,
//             languages: true
//         }
//     });

//     res.json({totalMovies, averageMovieLenght, movies})
// });

app.post('/movies', async (req, res) => {
    console.log(`Conteúdo do body enviado na requisição: ${req.body.title}`);

    const { title, genre_id, language_id, oscar_count, release_date, movie_lenght } = req.body

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
            movie_lenght,
            release_date: new Date(release_date)
        }
    });
}catch(err){
    return res.status(500).send({message:"Falha ao cadastrar um filme."})
}
    res.status(201).send()    
});

app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);

    const data = { ...req.body }
    data.release_date = data.release_date ? new Date(data.release_date) : undefined

    await prisma.movie.update({
        where: { id },
        data
});
    res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try{

        const movie = await prisma.movie.findUnique({ where: { id }})

        if(!movie){
            return res.status(404).send({message: "O filme não foi encontrado."})
        }

        await prisma.movie.delete({
            where: { id }
        })

    }catch(err){
        return res.status(500).send({message:"Não foi possível remover o filme."})
    }
    res.status(200).send()
})

app.get("/movies/:genreName", async (req, res) => {
    console.log(req.params.genreName);

    try{

        const moviesFilteredByGenreName = await prisma.movie.findMany({

            include: {
                genres: true,
                languages: true
            },

            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }
                }
            }

        })

        res.status(200).send(moviesFilteredByGenreName);

    }catch(err){
        return res.status(500).send({message: "Falha ao filtrar filmes por gênero."})
    }
})


/////////////////


app.put("/genres/:id", async (req, res) => {

    const id = Number(req.params.id)
    const { name } = req.body

    try{ 

    const genre = await prisma.genre.findUnique({
        where: { id }
    });
        
    if(!name){
        return res.status(400).send({ message: "O nome do gênero é obrigatório." })
    }
        
    if(!genre){
        return res.status(404).send({message: "Gênero não encontrado."})
    }

    const genreWithSameTitle = await prisma.genre.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
    });

    if(genreWithSameTitle){
        return res.status(409).send({message: "Esse nome de gênero já existe."});
    }

    const data = req.body

    await prisma.genre.update({
        where: { id },
        data
    })
    
    }catch(err){
        return res.status(500).send({message: "Falha ao atualizar o gênero."})
    }

    res.status(200).send();

})

//-

app.post('/genres', async (req, res) => {
    console.log(`Conteúdo do body enviado na requisição: ${req.body.name}`);

    const { id, name } = req.body

    try{

        const genreWithSameTitle = await prisma.genre.findFirst({
            where: { name: { equals: name, mode: "insensitive" } }
        });

        if(!name){
            return res.status(400).send({message: "O nome do gênero é obrigatório."})
        }

        if(genreWithSameTitle){
            return res.status(409).send({message: "Esse gênero já existe."});
        }

    await prisma.genre.create({
        data: {
            id,
            name
        }
    });
}catch(err){
    return res.status(500).send({message:"Falha ao cadastrar um gênero."})
}
    res.status(201).send()    
});

//-

app.get("/genres", async (_,res) => {
    
    try{
        const genres = await prisma.genre.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(genres)
    }catch(err){
        console.error(err);
        res.status(500).send({message: "Houve um erro ao buscar os gêneros."})
    }
});

//-

app.delete("/genres/:id", async (req, res) => {
    const id = Number(req.params.id);

    try{

        const genre = await prisma.genre.findUnique({ where: { id }})

        if(!genre){
            return res.status(404).send({message: "O gênero não foi encontrado."})
        }

        await prisma.genre.delete({
            where: { id }
        })

    }catch(err){
        return res.status(500).send({message:"Não foi possível remover o gênero."})
    }
    res.status(200).send({message: "Gênero removido com sucesso"})
})

//-

app.get("/movies/:language", async (req, res) => {
    const { language } = req.params; // Use req.params para acessar os parâmetros da rota
    const languageName = language as string;

    let where = {};
    if (languageName) {
        where = {
            languages: {
                name: {
                    equals: languageName,
                    mode: "insensitive",
                },
            },
        };
    }

    try {
        const movies = await prisma.movie.findMany({
            where: where,
            include: {
                genres: true,
                languages: true,
            },
        });

        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Houve um problema ao buscar os filmes." });
    }
});

//-

app.get("/movies/filter", async (req, res) => {
    const { language, sort } = req.query;
    const languageName = language as string;
    const sortName = sort as string;

    let orderBy = {};
    if (sortName === "title") {
        orderBy = {
            title: "asc",
        };
    } else if (sortName === "release_date") {
        orderBy = {
            release_date: "asc",
        };
    }

    let where = {};
    if (languageName) {
        where = {
            languages: {
                name: {
                    equals: languageName,
                    mode: "insensitive",
                },
            },
        };
    }

    try {
        const movies = await prisma.movie.findMany({
            orderBy,
            where: where,
            include: {
                genres: true,
                languages: true,
            },
        });

        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Houve um problema ao buscar os filmes." });
    }
});

/////////////////////

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});