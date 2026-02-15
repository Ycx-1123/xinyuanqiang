'use strict';
const db = uniCloud.database();
const _ = db.command; 

exports.main = async (event, context) => {
	const collection = db.collection('wishes');
	const { action, params } = event; 

	// 1. 获取列表
	if (action === 'get_list') {
		const { uid, is_my } = params || {};
		let query = {};
		if (is_my && uid) {
			query = _.or([{ uid: uid }, { helperUid: uid }]);
		}
		const res = await collection.where(query).orderBy('createTime', 'desc').get();
		return { code: 0, data: res.data };
	}

	// 2. 发布
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
			replyMessage: '',
			evidence: []
		});
		return { code: 0, msg: '发布成功', id: res.id };
	}

	// 3. 详情
	if (action === 'get_detail') {
		if (!params.id) return { code: 1, msg: '缺少ID' };
		const res = await collection.doc(params.id).get();
		if (res.data.length > 0) return { code: 0, data: res.data[0] };
		return { code: 404, msg: '未找到' };
	}

	// 4. 提交圆梦 (帮忙)
	if (action === 'help_wish' || action === 'update_help') {
		await collection.doc(params.id).update({
			status: 1,
			helperName: params.helperName,
			helperUid: params.helperUid,
			replyMessage: params.replyMessage,
			evidence: params.evidence || [],
			fulfillTime: Date.now()
		});
		return { code: 0, msg: '同步成功' };
	}

	// 5. 删除心愿 (发起人)
	if (action === 'delete_wish') {
		await collection.doc(params.id).remove();
		return { code: 0, msg: '删除成功' };
	}

	// 6. 修改心愿 (发起人)
	if (action === 'update_wish') {
		await collection.doc(params.id).update({
			title: params.title,
			content: params.content,
			wisherName: params.wisherName
		});
		return { code: 0, msg: '修改成功' };
	}

	// 🔥 7. 撤销圆梦：彻底清空帮忙信息，状态切回 0
	if (action === 'cancel_help') {
		await collection.doc(params.id).update({
			status: 0,
			helperName: '',
			helperUid: '',
			replyMessage: '',
			evidence: [],
			fulfillTime: _.remove() 
		});
		return { code: 0, msg: '圆梦已撤销' };
	}

	return { code: 404, msg: '未定义操作' };
};