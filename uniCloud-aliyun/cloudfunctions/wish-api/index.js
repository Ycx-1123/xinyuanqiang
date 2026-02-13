'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const collection = db.collection('wishes');
	const { action, params } = event; 

	// 1. 获取所有心愿列表 (首页用)
	if (action === 'get_list') {
		const res = await collection.orderBy('createTime', 'desc').get();
		return { code: 0, data: res.data };
	}

	// 2. 发布新心愿 (发布页用)
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

	// 3. 获取单条心愿详情 (详情页用)
	if (action === 'get_detail') {
		if (!params.id) return { code: 1, msg: '缺少ID' };
		const res = await collection.doc(params.id).get();
		if (res.data.length > 0) return { code: 0, data: res.data[0] };
		return { code: 404, msg: '未找到' };
	}

	// 4. 提交帮助信息 (圆梦页用)
	if (action === 'help_wish') {
		await collection.doc(params.id).update({
			status: 1,
			helperName: params.helperName,
			helperUid: params.helperUid,
			replyMessage: params.replyMessage,
			fulfillTime: Date.now()
		});
		return { code: 0, msg: '圆梦成功！' };
	}

	return { code: 404, msg: '未定义操作' };
};