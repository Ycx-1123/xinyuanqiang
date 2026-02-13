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
      <button class="submit-btn" @click="submitHelp">确认圆梦</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const helperName = ref('');
const replyMessage = ref('');
let wishId = '';

onLoad((options) => { wishId = options.id; });

const submitHelp = () => {
  if (!helperName.value || !replyMessage.value) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }
  uni.showLoading({ title: '提交中...' });
  uniCloud.callFunction({
    name: 'wish-api',
    data: {
      action: 'help_wish',
      params: {
        id: wishId,
        helperName: helperName.value,
        replyMessage: replyMessage.value,
        helperUid: uni.getStorageSync('my_user_id')
      }
    },
    success: (res) => {
      uni.hideLoading();
      if (res.result.code === 0) {
        uni.showToast({ title: '圆梦成功！' });
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
.page-title { font-size: 36rpx; font-weight: bold; color: #FF9F43; display: block; margin-bottom: 40rpx; }
.form-card { background: #fff; border-radius: 32rpx; padding: 40rpx; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05); }
.form-item { margin-bottom: 40rpx; .label { font-size: 28rpx; font-weight: bold; margin-bottom: 20rpx; display: block; } .input, .textarea { background: #F9F9F9; border-radius: 16rpx; padding: 20rpx; width: 100%; box-sizing: border-box; } .input { height: 90rpx; } .textarea { height: 240rpx; } }
.submit-btn { background: linear-gradient(135deg, #FFB75E, #ED8F03); color: #fff; border-radius: 50rpx; font-weight: bold; border: none; }
</style>