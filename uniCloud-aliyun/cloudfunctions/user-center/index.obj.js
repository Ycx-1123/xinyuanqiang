'use strict';
module.exports = {
	async login(params) {
		const { nickname, avatar_url, code } = params;
		const db = uniCloud.database();
		const APPID = 'wx5f169e5d90137b90'; 
		const SECRET = '934db4656398430212626ef2f8907fbb'; 

		const apiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;
		
		let openid = '';
		let retry = 3; 

		while (retry > 0 && !openid) {
			try {
				const response = await uniCloud.httpclient.request(apiUrl, {
					dataType: 'json',
					timeout: 2500 
				});
				openid = response.data.openid;
			} catch (e) {
				retry--;
				if (retry === 0) return { code: 500, msg: '验证服务连接超时' };
				await new Promise(r => setTimeout(r, 200)); 
			}
		}

		const userRes = await db.collection('users').where({ openid }).get();
		let finalId = '';
		if (userRes.data.length > 0) {
			finalId = userRes.data[0]._id;
			await db.collection('users').doc(finalId).update({
				nickname, avatar_url, last_login_time: Date.now()
			});
		} else {
			const addRes = await db.collection('users').add({
				openid, nickname, avatar_url, create_time: Date.now()
			});
			finalId = addRes.id;
		}
		return { code: 200, data: { _id: finalId } };
	}
}