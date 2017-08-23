
const express = require('express');
const bodyParser = require('body-parser');
let axios = require('axios');
const apikey = '06e0241a98ac55c1e49dc1e4d8b04727';


const restService = express();

restService.use(bodyParser.urlencoded({
  extended: true
}));

restService.use(bodyParser.json());

restService.get('/', function (req, res) {
  res.send('hello');
});

restService.post('/location', function (req, res) {
  // var location = req.body.result && req.body.result.parameters &&
  // req.body.result.parameters.location ? req.body.result.parameters.location : 'Bangalore';

  var location = req.body.location || 'bellandur';     

  axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}`)
        .then(function (response) {
          const lat = response.data.results[0].geometry.location.lat;
          const lng = response.data.results[0].geometry.location.lng;
          // secret key f254fa805ed7d9b3aeaa0cb19d976867

          return axios.get(`https://developers.zomato.com/api/v2.1/geocode?lat=${lat}&lon=${lng}&apikey=${apikey}`);
        }).then(function (response) {
          let restraunts = response.data.nearby_restaurants;
          let postbackRespone = [];
          restraunts.map((restraunt)=>{
            if(postbackRespone.length < 5){
              postbackRespone.push(
                {
                  "title": `${restraunt.restaurant.name}`,
                  "image_url": `${restraunt.restaurant.thumb}`,
                  "subtitle": `${restraunt.restaurant.cuisines}`,
                  "default_action": {
                    "type": "web_url",
                    "url": `${restraunt.restaurant.book_url}`,
                    "webview_height_ratio": "tall"
                  }
                }
              )
            }
            
          });
          
          res.json({
            "speech": "",
            "messages": [
              {
                "type": 4,
                "platform": "facebook",
                "payload": {
                  "facebook": {
                    "attachment": {
                      "type": "template",
                      "payload": {
                        "template_type": "generic",
                        "elements": postbackRespone
                      }
                    }
                  }
                }
              },
              {
                "type": 0,
                "speech": ""
              }
            ] 
          });

        })
        .catch(function (error) {
          console.log(error);
        });
});


restService.listen((process.env.PORT || 8000), function () {
  console.log('Server up and listening' + process.env.PORT);
});

