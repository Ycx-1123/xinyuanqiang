'use strict';
const db = uniCloud.database();
const _ = db.command; // 引入指令用于复杂查询

exports.main = async (event, context) => {
	const collection = db.collection('wishes');
	const { action, params } = event; 

	// 1. 获取心愿列表 (已增加身份隔离逻辑)
	if (action === 'get_list') {
		const { uid, is_my } = params || {};
		let query = {};
		
		// 如果是“我的”页面调用，只返回与我相关的数据
		if (is_my && uid) {
			query = _.or([
				{ uid: uid },
				{ helperUid: uid }
			]);
		}
		
		const res = await collection.where(query).orderBy('createTime', 'desc').get();
		return { code: 0, data: res.data };
	}

	// 2. 发布新心愿 (保持原样)
	if (action === 'add_wish') {
		const res = await collection.add({
			uid: params.uid,
			title: params.title,
			content: params.content,
			wisherName: params.wisherName,
			status: 0, 
			createTime: Date.now(),
			helperName: '',
			helperUid: '',
			replyMessage: ''
		});
		return { code: 0, msg: '发布成功', id: res.id };
	}

	// 3. 获取单条详情
	if (action === 'get_detail') {
		if (!params.id) return { code: 1, msg: '缺少ID' };
		const res = await collection.doc(params.id).get();
		if (res.data.length > 0) return { code: 0, data: res.data[0] };
		return { code: 404, msg: '未找到' };
	}

	// 4. 提交帮助信息
	if (action === 'help_wish') {
		await collection.doc(params.id).update({
			status: 1,
			helperName: params.helperName,
			helperUid: params.helperUid,
			replyMessage: params.replyMessage,
			evidence: params.evidence || [],
			fulfillTime: Date.now()
		});
		return { code: 0, msg: '圆梦成功！' };
	}

	return { code: 404, msg: '未定义操作' };
};