<template>
  <view class="container">
    <view class="detail-card">
      <view class="user-header">
        <view class="avatar">{{ info.wisherName ? info.wisherName[0] : '匿' }}</view>
        <view class="user-info">
          <text class="name">{{ info.wisherName }}</text>
          <text class="time">{{ formatDate(info.createTime) }} 发布</text>
        </view>
        <view :class="['status-tag', info.status === 1 ? 'status-done' : 'status-pending']">
          {{ info.status === 1 ? '已圆梦' : '待实现' }}
        </view>
      </view>
      <view class="content">
        <text class="title">{{ info.title }}</text>
        <text class="desc">{{ info.content }}</text>
      </view>
    </view>

    <view v-if="info.status === 0" class="btn-box">
      <button class="help-btn" @click="goToFulfill">我来帮忙</button>
    </view>

    <view v-else class="done-card">
      <text class="done-title">✨ 圆梦瞬间</text>
      <text class="done-info">好心邻居：{{ info.helperName }}</text>
      <text class="done-msg">留言：{{ info.replyMessage }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

const info = ref({});
let wishId = '';

const loadDetail = () => {
  uniCloud.callFunction({
    name: 'wish-api',
    data: { action: 'get_detail', params: { id: wishId } },
    success: (res) => {
      if (res.result.code === 0) info.value = res.result.data;
    }
  });
};

onLoad((options) => { wishId = options.id; });
onShow(() => { loadDetail(); });

const goToFulfill = () => {
  uni.navigateTo({ url: `/pages/wish/fulfill?id=${wishId}` });
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: #FDFBF7; }
.container { padding: 30rpx; }
.detail-card { background: #fff; border-radius: 32rpx; padding: 40rpx; margin-bottom: 40rpx; }
.user-header { display: flex; align-items: center; margin-bottom: 40rpx; .avatar { width: 80rpx; height: 80rpx; background: #FFD3B6; border-radius: 50%; text-align: center; line-height: 80rpx; color: #fff; margin-right: 20rpx; } .user-info { flex: 1; .name { display: block; font-weight: bold; } .time { font-size: 24rpx; color: #999; } } }
.content { .title { display: block; font-size: 38rpx; font-weight: bold; margin-bottom: 20rpx; } .desc { color: #666; line-height: 1.8; } }
.help-btn { background: linear-gradient(135deg, #FFB75E, #ED8F03); color: #fff; border-radius: 50rpx; font-weight: bold; }
.done-card { background: #E6F7ED; border-radius: 32rpx; padding: 40rpx; border: 2rpx dashed #2ECC71; .done-title { color: #2ECC71; font-weight: bold; display: block; margin-bottom: 20rpx; } .done-info, .done-msg { display: block; font-size: 28rpx; color: #444; margin-bottom: 10rpx; } }
.status-tag { font-size: 24rpx; padding: 6rpx 16rpx; border-radius: 20rpx; }
.status-pending { background: #FFF0DE; color: #FF9F43; }
.status-done { background: #E6F7ED; color: #2ECC71; }
</style>