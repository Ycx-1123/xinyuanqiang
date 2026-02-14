<template>
  <view class="container">
    <view class="bg-circle-1"></view>
    <view class="bg-circle-2"></view>

    <view class="header">
      <view class="user-info-row">
        <image 
          class="avatar-large" 
          :src="userInfo.avatarUrl || defaultAvatar" 
          mode="aspectFill"
        ></image>
        
        <view class="text-group">
          <text class="header-title">{{ userInfo.nickName || '社区友邻' }}</text>
          <view class="id-badge">
            <text class="id-text">ID: {{ myUserId ? myUserId.slice(-8) : '---' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @click="isWishesExpanded = !isWishesExpanded">
        <view class="label-group">
          <text class="section-emoji">⏳</text>
          <text class="section-label">我发起的心愿</text>
        </view>
        <view class="count-bubble">{{ myWishes.length }}</view>
      </view>
      
      <view v-if="myWishes.length > 0">
        <view class="wish-list">
          <view 
            v-for="item in (isWishesExpanded ? myWishes : myWishes.slice(0, 3))" 
            :key="item._id"
            :class="['wish-card', item.status === 1 ? 'wish-done' : 'wish-pending']"
            @click="goToDetail(item._id)"
          >
            <view class="card-top">
              <view :class="['status-badge', item.status === 1 ? 'status-done-badge' : 'status-pending-badge']">
                {{ item.status === 1 ? '🎉 已圆梦' : '⏳ 待实现' }}
              </view>
              <text class="post-time">{{ formatDate(item.createTime) }}</text>
            </view>
            <text class="card-title">{{ item.title }}</text>
            <text class="card-desc">{{ item.content }}</text>
            <view class="card-footer">
              <view class="arrow-text">{{ item.status === 1 ? '回顾详情 →' : '查看进度 →' }}</view>
            </view>
          </view>
        </view>
        <view v-if="myWishes.length > 3" class="fold-control-box" @click.stop="isWishesExpanded = !isWishesExpanded">
          <text class="fold-text">{{ isWishesExpanded ? '收起列表' : '查看更多' }}</text>
        </view>
      </view>
      <view v-else class="empty-state-card" @click="goToAdd">
        <text class="empty-text">许下一个心愿，让温暖开始流动。</text>
        <view class="empty-btn">去许愿</view>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @click="isHelpsExpanded = !isHelpsExpanded">
        <view class="label-group">
          <text class="section-emoji">❤️</text>
          <text class="section-label">我实现的愿望</text>
        </view>
        <view class="count-bubble help-bubble">{{ myHelps.length }}</view>
      </view>
      
      <view v-if="myHelps.length > 0">
        <view class="wish-list">
          <view 
            v-for="item in (isHelpsExpanded ? myHelps : myHelps.slice(0, 3))" 
            :key="item._id"
            class="wish-card wish-done"
            @click="goToDetail(item._id)"
          >
            <view class="card-top">
              <view class="status-badge status-done-badge">🎉 已圆梦</view>
              <text class="post-time">{{ formatDate(item.fulfillTime || item.createTime) }}</text>
            </view>
            <text class="card-title">已助邻居: {{ item.title }}</text>
            <view class="helper-msg-box" v-if="item.replyMessage">
               <text class="helper-msg-text">“ {{ item.replyMessage }} ”</text>
            </view>
            <view class="card-footer">
              <view class="arrow-text helper-arrow">回顾温暖 →</view>
            </view>
          </view>
        </view>
        <view v-if="myHelps.length > 3" class="fold-control-box" @click.stop="isHelpsExpanded = !isHelpsExpanded">
          <text class="fold-text">{{ isHelpsExpanded ? '收起列表' : '查看更多' }}</text>
        </view>
      </view>
      <view v-else class="empty-state-card">
        <text class="empty-text">还没有圆梦记录，快去心愿墙看看吧。</text>
      </view>
    </view>

    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
const userInfo = ref({ nickName: '', avatarUrl: '' });
const myUserId = ref('');
const myWishes = ref([]);
const myHelps = ref([]);
const isWishesExpanded = ref(false);
const isHelpsExpanded = ref(false);

onShow(() => {
  const savedInfo = uni.getStorageSync('userInfo');
  const savedId = uni.getStorageSync('my_user_id');
  if (savedInfo) userInfo.value = savedInfo;
  myUserId.value = savedId;
  if (savedId) fetchMyData(savedId);
});

const fetchMyData = (uid) => {
  uniCloud.callFunction({
    name: 'wish-api',
    data: { action: 'get_list', params: { uid: uid, is_my: true } },
    success: (res) => {
      if (res.result.code === 0) {
        const allList = res.result.data || [];
        const currentId = String(uid);
        myWishes.value = allList.filter(item => String(item.uid) === currentId);
        myHelps.value = allList.filter(item => String(item.helperUid) === currentId);
      }
    }
  });
};

const goToDetail = (id) => uni.navigateTo({ url: `/pages/wish/detail?id=${id}` });
const goToAdd = () => uni.switchTab({ url: '/pages/wish/wish' });
const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
</script>

<style lang="scss">
page {
  background-color: #FFF6F8 !important; /* 强制真机显示粉色 */
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
  min-height: 100vh;
}
</style>

<style lang="scss" scoped>
@import "@/uni.scss";

.container { 
  padding: 0 40rpx; 
}

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

.header { 
  padding: 60rpx 0; 
}
.user-info-row {
  display: flex;       
  flex-direction: row;  
  align-items: center; 
  justify-content: flex-start;
}
.avatar-large { 
  width: 140rpx; height: 140rpx; border-radius: 70rpx; 
  border: 6rpx solid #fff; box-shadow: 0 10rpx 30rpx rgba(255, 75, 92, 0.15);
  margin-right: 30rpx; 
  flex-shrink: 0;
}
.text-group {
  display: flex;
  flex-direction: column; 
  justify-content: center;
}
.header-title { 
  font-size: 44rpx; 
  font-weight: 800; 
  color: #2D3436; 
}
.id-badge { 
  background: rgba(255, 255, 255, 0.6); 
  padding: 4rpx 16rpx; 
  border-radius: 12rpx; 
  margin-top: 10rpx;
  align-self: flex-start; 
}
.id-text { font-size: 24rpx; color: #B2BEC3; font-weight: 600; }

.section { margin-bottom: 60rpx; position: relative; z-index: 1; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; padding: 0 10rpx; }
.section-label { font-size: 32rpx; font-weight: 700; color: #2D3436; }
.count-bubble { background: #FF4B5C; color: #fff; font-size: 24rpx; font-weight: bold; padding: 4rpx 20rpx; border-radius: 20rpx; }
.help-bubble { background: #00B894; }

.wish-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 32rpx; padding: 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.5);
}

.wish-pending { border-left: 12rpx solid #FF4B5C !important; } 
.wish-done { border-left: 12rpx solid #00B894 !important; }    

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.status-badge { font-size: 22rpx; padding: 8rpx 20rpx; border-radius: 30rpx; font-weight: 600; }
.status-pending-badge { background: #FFF0F1; color: #FF4B5C; } 
.status-done-badge { background: #E6FFFA; color: #00B894; } 
.post-time { font-size: 24rpx; color: #B2BEC3; }

.card-title { font-size: 34rpx; font-weight: bold; color: #2D3436; margin-bottom: 12rpx; display: block; }
.card-desc { font-size: 26rpx; color: #636E72; line-height: 1.5; margin-bottom: 20rpx; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden; }

.helper-msg-box { background: #F0FDF9; border-radius: 12rpx; padding: 16rpx; margin-bottom: 20rpx; border: 1rpx dashed rgba(0, 184, 148, 0.3); }
.helper-msg-text { font-size: 24rpx; color: #00B894; font-style: italic; }

.card-footer { display: flex; justify-content: flex-end; padding-top: 10rpx; border-top: 2rpx solid #F8FAFC; }
.arrow-text { font-size: 24rpx; color: #FF4B5C; font-weight: 600; }
.helper-arrow { color: #00B894; }

.empty-state-card { background: rgba(255, 255, 255, 0.6); border: 2rpx dashed #FFD1D5; border-radius: 32rpx; padding: 60rpx 40rpx; text-align: center; }
.empty-btn { display: inline-block; background: #FF4B5C; color: #fff; padding: 12rpx 40rpx; border-radius: 30rpx; font-size: 26rpx; font-weight: bold; margin-top: 20rpx;}
.fold-text { font-size: 26rpx; color: #B2BEC3; text-align: center; display: block; padding: 20rpx 0; }

.safe-area-bottom { height: 120rpx; }
</style>