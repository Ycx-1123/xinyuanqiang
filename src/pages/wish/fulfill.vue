<template>
  <view class="container">
    <view class="header-text">
      <text class="main">我是好心人 ❤️</text>
      <text class="sub">感谢您的热心帮助</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">您的称呼</text>
        <input class="input" v-model="helperName" placeholder="怎么称呼您？" placeholder-class="input-ph" />
      </view>
      
      <view class="form-item">
        <text class="label">暖心留言</text>
        <textarea class="textarea" v-model="replyMessage" placeholder="告诉邻居您如何帮他实现..." placeholder-class="input-ph" />
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
            <text class="add-text">上传</text>
          </view>
        </view>
      </view>
    </view>

    <button class="submit-btn" @click="submitHelp">✨ 确认圆梦</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const helperName = ref('');
const replyMessage = ref('');
const mediaList = ref([]);
let wishId = '';

onLoad((options) => { wishId = options.id; });

const chooseMedia = () => {
  uni.chooseMedia({
    count: 3 - mediaList.value.length,
    mediaType: ['image', 'video'],
    sourceType: ['album', 'camera'],
    maxDuration: 15,
    success: (res) => {
      res.tempFiles.forEach(file => {
        mediaList.value.push({ type: file.fileType, tempUrl: file.tempFilePath });
      });
    }
  });
};

const removeMedia = (index) => {
  mediaList.value.splice(index, 1);
};

const submitHelp = async () => {
  if (!helperName.value || !replyMessage.value) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }
  uni.showLoading({ title: '上传中...' });

  try {
    const evidenceData = [];
    for (let item of mediaList.value) {
      const extension = item.tempUrl.split('.').pop();
      const result = await uniCloud.uploadFile({
        filePath: item.tempUrl,
        cloudPath: `evidence/${Date.now()}_${Math.random().toString(36).slice(-6)}.${extension}`
      });
      evidenceData.push({ type: item.type, url: result.fileID });
    }

    uniCloud.callFunction({
      name: 'wish-api',
      data: {
        action: 'help_wish',
        params: {
          id: wishId,
          helperName: helperName.value,
          replyMessage: replyMessage.value,
          helperUid: uni.getStorageSync('my_user_id'),
          evidence: evidenceData
        }
      },
      success: (res) => {
        uni.hideLoading();
        if (res.result.code === 0) {
          uni.showToast({ title: '圆梦成功！' });
          setTimeout(() => uni.navigateBack(), 1500);
        }
      },
      fail: () => { uni.hideLoading(); uni.showToast({ title: '提交失败', icon: 'none' }); }
    });
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '上传失败', icon: 'none' });
  }
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: $uni-bg-color-grey; }
.container { padding: 40rpx; }

.header-text { margin: 20rpx 0 50rpx; }
.main { font-size: 48rpx; font-weight: 800; color: #2D3436; display: block; }
.sub { font-size: 28rpx; color: #636E72; margin-top: 10rpx; }

.form-card { background: #fff; border-radius: 40rpx; padding: 50rpx 40rpx; box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.4); }

.form-item { margin-bottom: 40rpx; }
.label { font-size: 28rpx; font-weight: 600; color: #2D3436; margin-bottom: 20rpx; display: block; padding-left: 10rpx; }
.input, .textarea {
  background: #F8FAFC; border: 2rpx solid #F1F2F6;
  border-radius: 24rpx; padding: 24rpx 30rpx; width: 100%; box-sizing: border-box; font-size: 30rpx; color: #2D3436;
  transition: all 0.3s;
}
.input:focus, .textarea:focus { background: #fff; border-color: #FF4B5C; }
.input { height: 100rpx; }
.textarea { height: 260rpx; }
.input-ph { color: #B2BEC3; }

/* 媒体上传样式优化 */
.media-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.media-item { width: 180rpx; height: 180rpx; position: relative; border-radius: 20rpx; overflow: hidden; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05); }
.preview-img, .preview-video { width: 100%; height: 100%; }
.remove-btn { position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; width: 44rpx; height: 44rpx; text-align: center; line-height: 40rpx; border-bottom-left-radius: 12rpx; font-size: 32rpx; }

.add-btn {
  width: 180rpx; height: 180rpx; background: #FFF0F1; 
  border-radius: 20rpx; display: flex; flex-direction: column; justify-content: center; align-items: center;
  border: 2rpx dashed #FF8F70;
}
.plus { font-size: 60rpx; color: #FF8F70; margin-bottom: -10rpx; }
.add-text { font-size: 24rpx; color: #FF8F70; font-weight: 600; }

.submit-btn {
  margin-top: 60rpx;
  height: 110rpx; line-height: 110rpx;
  background: linear-gradient(135deg, #FF4B5C, #FF8F70);
  color: #fff; border-radius: 55rpx; font-size: 34rpx; font-weight: bold;
  box-shadow: 0 20rpx 40rpx rgba(255, 75, 92, 0.3);
  border: none;
  &:active { transform: scale(0.98); opacity: 0.9; }
}
</style>