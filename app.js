// imported modules
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const axios = require('axios')
const request = require('request')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// endpoint search to search playlist
app.get('/search', async (req, res) => {
    try {
        if(!req.query.playlist){
            throw({
                type:'known',
                code:400,
                message:'playlist keyword for search required'
            })
        }
        const client_id = process.env.CLIENT_ID
        const client_secret = process.env.CLIENT_SECRET
        // from example code in documentation in spotify api
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            form: {
                grant_type: 'client_credentials'
            },
            json: true
        };
        
        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // use the access token to access the Spotify Web API
                var token = body.access_token;
                const querySearch = req.query.playlist
                var options = {
                    url: `https://api.spotify.com/v1/search?type=playlist&include_external=audio&q=${querySearch}`,
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    json: true
                };
                request.get(options, function (error, response, body) {
                    if(error){
                        res.status(500).json({message:'internal server error'})
                    }else{
                        res.status(200).json(body.playlists.items);
                    }
                });
            }
        });
    } catch (error) {
        if(error.type === 'known'){ // for error thrown handling
            res.status(error.code).json({message:error.message})
        }else{
            res.status(500).json({message:'internal server error'})
        }
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})