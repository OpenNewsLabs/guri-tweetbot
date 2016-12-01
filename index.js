
const Twit = require('twit');
const config = require('./config.json');
const axios = require('axios');

const T = new Twit(config);

const stream = T.stream('user', { stringify_friend_ids: true });
stream.on('tweet',  tweet => {
  if(tweet.user.id_str === config.account_id) return;
  if(tweet.retweeted_status) return;

	if (tweet.entities.media) {

		const media = tweet.entities.media
		.filter(m => m.type === 'photo');

		const body = media.map(m => ([
				{type: 'panorama', src :`${m.media_url_https}:large`},
				{type: 'duration', value: media.length === 1 ? 5000 : 10},
		]));
		
		console.log('era una historia con media?', body.length)

		if (body.length) {
			axios.post('https://gurivr.com/api/stories', {
				title: 'GuriVR - Twitter',
				body: body
			}).then(res => {
				T.post('statuses/update', {in_reply_to_status_id: tweet.id_str , status: `@${tweet.user.screen_name} your scene is here https://s3.amazonaws.com/gurivr/s/${res.data._id}.html` }, function(err, data, response) {});
			});
		}
	} else {
		console.log('entre al else')
		axios.post('https://gurivr.com/api/stories', {
			title: 'GuriVR - Twitter',
			text: tweet.text,
		 	store: false	
		}).then(res => {
			console.log(res.data, 'que devolvio el store false')
			if (res.data.length) {
				console.log(res.data.length, 'hay historia')
				axios.post('https://gurivr.com/api/stories', {
					title: 'GuriVR - Twitter',
					text: tweet.text
				}).then(res => {
					console.log('a twiteaaaarla', res.data)
					T.post('statuses/update', {in_reply_to_status_id: tweet.id_str , status: `@${tweet.user.screen_name} your scene is here https://s3.amazonaws.com/gurivr/s/${res.data._id}.html` }, function(err, data, response) {});
				});
			}
		});
	}

});
