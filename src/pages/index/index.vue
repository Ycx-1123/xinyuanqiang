<template>
  <view class="container">
    <view class="bg-circle-1"></view>
    <view class="bg-circle-2"></view>

    <view class="header">
      <text class="header-title">✨ 邻里心愿墙</text>
      <text class="header-subtitle">传递温暖，点亮生活</text>
    </view>

    <view class="tab-bar">
      <view 
        :class="['tab-item', currentTab === 0 ? 'active' : '']" 
        @click="currentTab = 0"
      >
        <text>⏳ 待实现</text>
        <view class="indicator" v-if="currentTab === 0"></view>
      </view>
      <view 
        :class="['tab-item', currentTab === 1 ? 'active' : '']" 
        @click="currentTab = 1"
      >
        <text>🎉 已圆梦</text>
        <view class="indicator" v-if="currentTab === 1"></view>
      </view>
    </view>

    <view class="wish-list">
      <view class="wish-card" v-for="item in displayList" :key="item._id" @click="goToDetail(item._id)">
        <view class="card-top">
          <view :class="['status-badge', item.status === 1 ? 'status-done' : 'status-pending']">
            {{ item.status === 1 ? '🎉 已圆梦' : '⏳ 待实现' }}
          </view>
          <text class="post-time">{{ formatDate(item.createTime) }}</text>
        </view>

        <text class="card-title">{{ item.title }}</text>
        <text class="card-desc">{{ item.content }}</text>

        <view v-if="item.status === 1" class="helper-section">
          <view class="helper-row">
            <text class="helper-label">好心邻居：</text>
            <text class="helper-name">{{ item.helperName || '匿名好心人' }}</text>
          </view>
          <view class="helper-row" v-if="item.replyMessage">
            <text class="helper-label">暖心留言：</text>
            <text class="helper-msg">{{ item.replyMessage }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="user-info">
            <view class="avatar-placeholder">{{ item.wisherName ? item.wisherName[0] : '邻' }}</view>
            <text class="user-name">{{ item.wisherName }}</text>
          </view>
          <view class="arrow-btn">查看详情 →</view>
        </view>
      </view>
      
      <view v-if="displayList.length === 0" class="empty-state">
        <text>这里暂时没有记录哦 ~</text>
      </view>

      <view style="height: 140rpx;"></view>
    </view>

    <view class="fab-btn" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const wishList = ref([]);
const currentTab = ref(0);

// 数据过滤逻辑
const displayList = computed(() => {
  if (currentTab.value === 0) {
    return wishList.value.filter(item => item.status === 0);
  } else {
    return wishList.value.filter(item => item.status === 1);
  }
});

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
page { background-color: $uni-bg-color-grey; }

.bg-circle-1 {
  position: fixed; top: -100rpx; right: -100rpx; width: 400rpx; height: 400rpx;
  background: linear-gradient(135deg, rgba(255, 75, 92, 0.2), rgba(255, 143, 112, 0.1));
  border-radius: 50%; z-index: -1; filter: blur(40rpx);
}
.bg-circle-2 {
  position: fixed; top: 200rpx; left: -150rpx; width: 300rpx; height: 300rpx;
  background: linear-gradient(135deg, rgba(255, 236, 210, 0.5), rgba(252, 182, 159, 0.2));
  border-radius: 50%; z-index: -1; filter: blur(30rpx);
}

.container { padding: 0 40rpx; }

.header { padding: 60rpx 0 20rpx; }
.header-title { font-size: 48rpx; font-weight: 800; color: #2D3436; display: block; margin-bottom: 10rpx; }
.header-subtitle { font-size: 28rpx; color: #636E72; font-weight: 400; }

.tab-bar {
  display: flex; margin-bottom: 30rpx; 
  background: rgba(255,255,255,0.6); padding: 10rpx; border-radius: 20rpx;
  backdrop-filter: blur(10px);
}
.tab-item {
  flex: 1; text-align: center; padding: 20rpx 0; font-size: 30rpx; color: #636E72; position: relative;
  transition: all 0.3s;
}
.tab-item.active {
  color: #2D3436; font-weight: 800; transform: scale(1.05);
}
.indicator {
  position: absolute; bottom: 10rpx; left: 50%; transform: translateX(-50%);
  width: 40rpx; height: 6rpx; background: #FF4B5C; border-radius: 10rpx;
  box-shadow: 0 4rpx 10rpx rgba(255, 75, 92, 0.4);
}

.wish-card {
  background: #fff; border-radius: 32rpx; padding: 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.5);
  transition: transform 0.2s;
  &:active { transform: scale(0.98); }
}

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.post-time { font-size: 24rpx; color: #B2BEC3; }

.status-badge { font-size: 22rpx; padding: 8rpx 20rpx; border-radius: 30rpx; font-weight: 600; }
.status-pending { background: #FFF0F1; color: #FF4B5C; } 
.status-done { background: #E6FFFA; color: #00B894; } 

.card-title { font-size: 36rpx; font-weight: bold; color: #2D3436; margin-bottom: 16rpx; display: block; }
.card-desc { font-size: 28rpx; color: #636E72; line-height: 1.6; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-bottom: 30rpx; }

/* --- 🔥 新增：圆梦信息区域样式 --- */
.helper-section {
  background: #F0FDF9; /* 极淡的绿色背景 */
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  border: 2rpx dashed rgba(0, 184, 148, 0.2);
}
.helper-row {
  display: flex; font-size: 26rpx; line-height: 1.5; margin-bottom: 8rpx;
}
.helper-row:last-child { margin-bottom: 0; }
.helper-label { color: #00B894; width: 140rpx; font-weight: 600; }
.helper-name { font-weight: bold; color: #2D3436; }
.helper-msg { color: #636E72; flex: 1; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.user-info { display: flex; align-items: center; }
.avatar-placeholder { width: 50rpx; height: 50rpx; background: linear-gradient(135deg, #FF9A9E, #FECFEF); color: #fff; border-radius: 50%; text-align: center; line-height: 50rpx; font-size: 24rpx; margin-right: 16rpx; font-weight: bold; }
.user-name { font-size: 26rpx; color: #2D3436; font-weight: 500; }
.arrow-btn { font-size: 24rpx; color: #B2BEC3; font-weight: 600; }

.empty-state { text-align: center; padding: 80rpx 0; color: #B2BEC3; font-size: 28rpx; }

.fab-btn {
  position: fixed; right: 40rpx; bottom: 80rpx; width: 110rpx; height: 110rpx;
  background: linear-gradient(135deg, #FF4B5C, #FF8F70);
  border-radius: 50%; display: flex; justify-content: center; align-items: center;
  box-shadow: 0 15rpx 30rpx rgba(255, 75, 92, 0.4);
  z-index: 100;
}
.fab-icon { color: #fff; font-size: 60rpx; margin-top: -6rpx; }
</style>