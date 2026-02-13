<template>
  <view class="container">
    <view class="form-card">
      <text class="page-title">我来帮忙实现愿望</text>
      
      <view class="form-item">
        <text class="label">好心邻居称呼</text>
        <input class="input" v-model="helperName" placeholder="怎么称呼您？" />
      </view>
      
      <view class="form-item">
        <text class="label">给邻居留言</text>
        <textarea class="textarea" v-model="replyMessage" placeholder="告诉邻居您如何帮他实现愿望..." />
      </view>

      <view class="form-item">
        <text class="label">圆梦证据 (照片/视频)</text>
        <view class="media-list">
          <view class="media-item" v-for="(item, index) in mediaList" :key="index">
            <image v-if="item.type === 'image'" :src="item.tempUrl" mode="aspectFill" class="preview-img"></image>
            <video v-if="item.type === 'video'" :src="item.tempUrl" class="preview-video" :controls="false"></video>
            <view class="remove-btn" @click="removeMedia(index)">×</view>
          </view>
          <view class="add-btn" @click="chooseMedia" v-if="mediaList.length < 3">
            <text class="plus">+</text>
          </view>
        </view>
      </view>

      <button class="submit-btn" @click="submitHelp">确认圆梦</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const helperName = ref('');
const replyMessage = ref('');
const mediaList = ref([]); // 存临时文件
let wishId = '';

onLoad((options) => { wishId = options.id; });

// 1. 选择图片或视频
const chooseMedia = () => {
  uni.chooseMedia({
    count: 3 - mediaList.value.length,
    mediaType: ['image', 'video'], // 同时支持图片和视频
    sourceType: ['album', 'camera'],
    maxDuration: 15, // 视频最长15秒
    success: (res) => {
      res.tempFiles.forEach(file => {
        mediaList.value.push({
          type: file.fileType, // 'image' 或 'video'
          tempUrl: file.tempFilePath
        });
      });
    }
  });
};

// 2. 删除已选
const removeMedia = (index) => {
  mediaList.value.splice(index, 1);
};

// 3. 提交逻辑
const submitHelp = async () => {
  if (!helperName.value || !replyMessage.value) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }

  uni.showLoading({ title: '正在上传证据...' });

  try {
    // 3.1 先把文件一个个传到云存储
    const evidenceData = [];
    for (let item of mediaList.value) {
      const extension = item.tempUrl.split('.').pop(); // 获取后缀名
      const result = await uniCloud.uploadFile({
        filePath: item.tempUrl,
        cloudPath: `evidence/${Date.now()}_${Math.random().toString(36).slice(-6)}.${extension}`
      });
      evidenceData.push({
        type: item.type,
        url: result.fileID // 拿到云端地址
      });
    }

    uni.showLoading({ title: '正在提交...' });

    // 3.2 提交数据到云函数
    uniCloud.callFunction({
      name: 'wish-api',
      data: {
        action: 'help_wish',
        params: {
          id: wishId,
          helperName: helperName.value,
          replyMessage: replyMessage.value,
          helperUid: uni.getStorageSync('my_user_id'),
          evidence: evidenceData // 带上证据列表
        }
      },
      success: (res) => {
        uni.hideLoading();
        if (res.result.code === 0) {
          uni.showToast({ title: '圆梦成功！' });
          setTimeout(() => uni.navigateBack(), 1500);
        }
      },
      fail: (err) => {
        console.error(err);
        uni.hideLoading();
        uni.showToast({ title: '提交失败', icon: 'none' });
      }
    });

  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '上传文件失败', icon: 'none' });
    console.error(e);
  }
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: #FDFBF7; }
.container { padding: 40rpx; }
.page-title { font-size: 36rpx; font-weight: bold; color: #FF9F43; display: block; margin-bottom: 40rpx; }
.form-card { background: #fff; border-radius: 32rpx; padding: 40rpx; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05); }
.form-item { margin-bottom: 40rpx; .label { font-size: 28rpx; font-weight: bold; margin-bottom: 20rpx; display: block; } .input, .textarea { background: #F9F9F9; border-radius: 16rpx; padding: 20rpx; width: 100%; box-sizing: border-box; } .input { height: 90rpx; } .textarea { height: 240rpx; } }
.submit-btn { background: linear-gradient(135deg, #FFB75E, #ED8F03); color: #fff; border-radius: 50rpx; font-weight: bold; border: none; }

/* 媒体列表样式 */
.media-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.media-item { width: 140rpx; height: 140rpx; position: relative; border-radius: 12rpx; overflow: hidden; }
.preview-img, .preview-video { width: 100%; height: 100%; }
.remove-btn { position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; width: 40rpx; height: 40rpx; text-align: center; line-height: 36rpx; border-bottom-left-radius: 12rpx; font-size: 30rpx; }
.add-btn { width: 140rpx; height: 140rpx; background: #F9F9F9; border-radius: 12rpx; display: flex; justify-content: center; align-items: center; border: 2rpx dashed #ccc; }
.plus { font-size: 60rpx; color: #ccc; margin-top: -8rpx; }
</style>