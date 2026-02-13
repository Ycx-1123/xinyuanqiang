<template>
  <view class="container">
    <view class="form-card">
      <view class="form-item">
        <text class="label">心愿标题</text>
        <input class="input" v-model="formData.title" placeholder="简短描述你的愿望" />
      </view>
      <view class="form-item">
        <text class="label">心愿详情</text>
        <textarea class="textarea" v-model="formData.content" placeholder="在这里写下更多细节..." />
      </view>
      <view class="form-item">
        <text class="label">你的称呼</text>
        <input class="input" v-model="formData.wisherName" placeholder="例如：张奶奶" />
      </view>
      <button class="submit-btn" @click="submitWish">确认发布</button>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({ title: '', content: '', wisherName: '' });

const submitWish = () => {
  if (!formData.title || !formData.content || !formData.wisherName) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }
  uni.showLoading({ title: '发布中...' });
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
page { background-color: #FDFBF7; }
.container { padding: 40rpx; }
.form-card { background: #fff; border-radius: 32rpx; padding: 40rpx; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05); }
.form-item { margin-bottom: 40rpx; .label { font-size: 28rpx; font-weight: bold; margin-bottom: 20rpx; display: block; } .input, .textarea { background: #F9F9F9; border-radius: 16rpx; padding: 20rpx; width: 100%; box-sizing: border-box; } .input { height: 90rpx; } .textarea { height: 240rpx; } }
.submit-btn { background: linear-gradient(135deg, #FFB75E, #ED8F03); color: #fff; border-radius: 50rpx; font-weight: bold; border: none; }
</style>