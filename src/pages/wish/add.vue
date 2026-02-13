<template>
  <view class="container">
    <view class="title-area">
      <text class="main-title">许个愿吧 ✨</text>
      <text class="sub-title">让温暖的邻居帮你实现</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">心愿标题</text>
        <input class="input" v-model="formData.title" placeholder="例如：想借个梯子..." placeholder-class="input-ph" />
      </view>
      <view class="form-item">
        <text class="label">详情描述</text>
        <textarea class="textarea" v-model="formData.content" placeholder="详细说说你的需求，好让大家准备..." placeholder-class="input-ph" />
      </view>
      <view class="form-item">
        <text class="label">您的称呼</text>
        <input class="input" v-model="formData.wisherName" placeholder="例如：2号楼张姨" placeholder-class="input-ph" />
      </view>
    </view>

    <button class="submit-btn" @click="submitWish">✨ 发布心愿</button>
  </view>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({ title: '', content: '', wisherName: '' });

const submitWish = () => {
  if (!formData.title || !formData.content || !formData.wisherName) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }
  uni.showLoading({ title: '发送中...' });
  uniCloud.callFunction({
    name: 'wish-api',
    data: {
      action: 'add_wish',
      params: { ...formData, uid: uni.getStorageSync('my_user_id') }
    },
    success: (res) => {
      uni.hideLoading();
      if (res.result.code === 0) {
        uni.showToast({ title: '发布成功' });
        setTimeout(() => uni.navigateBack(), 1500);
      }
    }
  });
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: $uni-bg-color-grey; }
.container { padding: 40rpx; }

.title-area { margin-bottom: 50rpx; margin-top: 20rpx; }
.main-title { font-size: 48rpx; font-weight: 800; color: #2D3436; display: block; }
.sub-title { font-size: 28rpx; color: #636E72; margin-top: 10rpx; display: block; }

.form-card { background: #fff; border-radius: 40rpx; padding: 50rpx 40rpx; box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.4); }

.form-item { margin-bottom: 40rpx; }
.label { font-size: 28rpx; font-weight: 600; color: #2D3436; margin-bottom: 20rpx; display: block; padding-left: 10rpx; }
.input, .textarea {
  background: #F8FAFC; 
  border: 2rpx solid #F1F2F6;
  border-radius: 24rpx; padding: 24rpx 30rpx; width: 100%; box-sizing: border-box; font-size: 30rpx; color: #2D3436;
  transition: all 0.3s;
}
.input:focus, .textarea:focus { background: #fff; border-color: #FF4B5C; } /* 聚焦变粉红 */
.input { height: 100rpx; }
.textarea { height: 260rpx; }
.input-ph { color: #B2BEC3; }

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