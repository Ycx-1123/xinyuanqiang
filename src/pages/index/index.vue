<template>
  <view class="container">
    <view class="header">
      <text class="header-title">居民心愿墙</text>
    </view>
    <view class="wish-list">
      <view class="wish-card" v-for="item in wishList" :key="item._id" @click="goToDetail(item._id)">
        <view class="card-header">
          <text class="card-title">{{ item.title }}</text>
          <view :class="['status-tag', item.status === 1 ? 'status-done' : 'status-pending']">
            {{ item.status === 1 ? '已圆梦' : '待实现' }}
          </view>
        </view>
        <view class="card-body">
          <text class="card-desc">{{ item.content }}</text>
        </view>
        <view class="card-footer">
          <view class="user-info">
            <view class="avatar-placeholder">{{ item.wisherName ? item.wisherName[0] : '匿' }}</view>
            <text class="user-name">{{ item.wisherName }}</text>
          </view>
          <text class="post-time">{{ formatDate(item.createTime) }}</text>
        </view>
      </view>
      <view style="height: 120rpx;"></view>
    </view>
    <view class="fab-btn" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const wishList = ref([]);
const formatDate = (ts) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const fetchWishes = () => {
  uniCloud.callFunction({
    name: 'wish-api',
    data: { action: 'get_list' },
    success: (res) => {
      if (res.result.code === 0) wishList.value = res.result.data;
    }
  });
};

onShow(() => fetchWishes());
const goToAdd = () => uni.navigateTo({ url: '/pages/wish/add' });
const goToDetail = (id) => uni.navigateTo({ url: `/pages/wish/detail?id=${id}` });
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: #FDFBF7; }
.container { padding: 0 30rpx; }
.header { padding: 40rpx 0 20rpx; background-color: #FDFBF7; position: sticky; top: 0; z-index: 100; }
.header-title { font-size: 40rpx; font-weight: bold; color: #4A4A4A; }
.wish-card { background: #fff; border-radius: 32rpx; padding: 30rpx; margin-bottom: 30rpx; box-shadow: 0 8rpx 20rpx rgba(255, 159, 67, 0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.card-title { font-size: 34rpx; font-weight: 600; }
.status-tag { font-size: 24rpx; padding: 6rpx 16rpx; border-radius: 20rpx; }
.status-pending { background: #FFF0DE; color: #FF9F43; }
.status-done { background: #E6F7ED; color: #2ECC71; }
.card-desc { font-size: 28rpx; color: #666; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1rpx solid #F5F5F5; padding-top: 20rpx; margin-top: 20rpx; }
.user-info { display: flex; align-items: center; }
.avatar-placeholder { width: 40rpx; height: 40rpx; background: #FFD3B6; border-radius: 50%; text-align: center; line-height: 40rpx; color: #fff; font-size: 24rpx; margin-right: 12rpx; }
.user-name { font-size: 26rpx; color: #888; }
.post-time { font-size: 24rpx; color: #AAA; }
.fab-btn { position: fixed; right: 40rpx; bottom: 80rpx; width: 100rpx; height: 100rpx; background: linear-gradient(135deg, #FFB75E, #ED8F03); border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 8rpx 20rpx rgba(237, 143, 3, 0.4); z-index: 100; }
.fab-icon { color: #fff; font-size: 60rpx; margin-top: -8rpx; }
</style>