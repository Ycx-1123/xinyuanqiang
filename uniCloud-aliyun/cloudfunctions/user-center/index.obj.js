'use strict';
module.exports = {
	/**
	 * 常规登录（用户点击按钮触发），会更新头像昵称
	 */
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

		if (!openid) return { code: 403, msg: '微信凭证无效' };

		// 查库逻辑
		const userRes = await db.collection('users').where({ openid }).get();
		let finalId = '';
		if (userRes.data.length > 0) {
			// 老用户：更新活跃时间
			finalId = userRes.data[0]._id;
			await db.collection('users').doc(finalId).update({
				nickname, avatar_url, last_login_time: Date.now()
			});
		} else {
			// 新用户：注册
			const addRes = await db.collection('users').add({
				openid, nickname, avatar_url, create_time: Date.now()
			});
			finalId = addRes.id;
		}
		return { code: 200, data: { _id: finalId } };
	},

	/**
	 * 🔥 新增：静默登录（Auto Login）
	 * 只用 code 换 openid，去库里查。
	 * 查到了 -> 返回用户信息（自动进）。
	 * 没查到 -> 返回 404（弹窗让用户注册）。
	 */
	async silentLogin(code) {
		if (!code) return { code: 400, msg: '缺少code' };
		
		const APPID = 'wx5f169e5d90137b90'; 
		const SECRET = '934db4656398430212626ef2f8907fbb'; 
		const apiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;
		
		let openid = '';
		let retry = 3;
		while (retry > 0 && !openid) {
			try {
				const res = await uniCloud.httpclient.request(apiUrl, { dataType: 'json', timeout: 2500 });
				if (res.data && res.data.openid) {
					openid = res.data.openid;
				} else {
					throw new Error('微信接口返回异常');
				}
			} catch (e) {
				retry--;
				if (retry === 0) return { code: 500, msg: '网络连接失败' };
				await new Promise(r => setTimeout(r, 200));
			}
		}

		// 去数据库查这个人是否存在
		const db = uniCloud.database();
		const userRes = await db.collection('users').where({ openid }).get();
		
		if (userRes.data.length > 0) {
			// 查到了！返回这个人的核心信息，帮前端恢复缓存
			const userData = userRes.data[0];
			return { 
				code: 200, 
				msg: '欢迎回来',
				data: { 
					_id: userData._id,
					nickName: userData.nickname, // 注意字段名对应
					avatarUrl: userData.avatar_url
				}
			};
		} else {
			// 没查到，说明真是新用户，或者被删了
			return { code: 404, msg: '用户未注册' };
		}
	},

	/**
	 * 身份核验
	 */
	async checkUser(userId) {
		if (!userId) return { code: 400, msg: '缺少参数' };
		const db = uniCloud.database();
		const res = await db.collection('users').doc(userId).get();
		if (res.data && res.data.length > 0) {
			return { code: 200, msg: '有效' };
		} else {
			return { code: 404, msg: '无效' };
		}
	}
}