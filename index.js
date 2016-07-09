
const Twit = require('twit');
const uuid = require('node-uuid');
const config = require('./config.json');
const axios = require('axios');

const T = new Twit(config);

const stream = T.stream('user', { stringify_friend_ids: true });
stream.on('tweet',  tweet => {
  if(tweet.user.id_str === config.account_id) return;

  const media = tweet.entities.media
  .filter(m => m.type === 'photo');

  const body = media.map(m => ([
      {type: 'panorama', src :`${m.media_url_https}:large`},
      {type: 'duration', value: media.length === 1 ? 5000 : 10},
  ]));

  axios.post('https://gurivr.com/api/stories', {
    title: 'GuriVR - Twitter',
    body: body
  }).then(res => {
    T.post('statuses/update', { status: `@${tweet.user.screen_name} your scene is here http://gurivr.s3-website-us-east-1.amazonaws.com/s/${res.data._id}.html` }, function(err, data, response) {});
  });

});
