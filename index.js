
const Twit = require('twit');
const config = require('./config.json');
const axios = require('axios');

const T = new Twit(config);

const stream = T.stream('user', { stringify_friend_ids: true });
stream.on('tweet',  tweet => {
  if(tweet.user.id_str === config.account_id) return;
  if(tweet.retweeted_status) return;

	if (/show me /i.test(tweet.text)) {
		const text = tweet.text.trim().replace('show me ', '')
		return Promise.all([axios.get('/api/assets/search?type=panorama&query=${text}'), axios.get('/api/assets/search?type=audio&query=${text}')])
		.then(([pano, audio]) => {
			const body = []
			if (pano && pano.length && (pano[0].url_k || pano[0].url_o)) {
				body.push({ type: 'panorama', src: pano[0].url_k || pano[0].url_o  })
			}

			if (audio) {
				body.push({ type: 'audio', src: audio })
			}

			if (!body.length) return T.post('statuses/update', {in_reply_to_status_id: tweet.id_str , status: `@${tweet.user.screen_name} your scene is here https://s3.amazonaws.com/gurivr/s/${res.data._id}.html` }, function(err, data, response) {});

			axios.post('https://gurivr.com/api/stories', {
				title: 'GuriVR - ' + text,
				body: body
			}).then(res => {
				T.post('statuses/update', {in_reply_to_status_id: tweet.id_str , status: `@${tweet.user.screen_name} your scene is here https://s3.amazonaws.com/gurivr/s/${res.data._id}.html` }, function(err, data, response) {});
			});
	
		});
	}

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
    T.post('statuses/update', {in_reply_to_status_id: tweet.id_str , status: `@${tweet.user.screen_name} your scene is here https://s3.amazonaws.com/gurivr/s/${res.data._id}.html` }, function(err, data, response) {});
  });

});
