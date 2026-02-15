<template>
  <view class="container">
    <view class="detail-card">
      <view class="user-header">
        <view class="avatar">{{ info.wisherName ? info.wisherName[0] : '...' }}</view>
        <view class="user-info">
          <text class="name">{{ info.wisherName || '加载中...' }}</text>
          <text class="time">{{ info.createTime ? formatDate(info.createTime) + ' 发布' : '' }}</text>
        </view>
        
        <view v-if="info._id" :class="['status-badge', info.status === 1 ? 'status-done' : 'status-pending']">
          {{ info.status === 1 ? '🎉 已圆梦' : '⏳ 待实现' }}
        </view>
      </view>
      
      <view class="content">
        <text class="title">{{ info.title }}</text>
        <text class="desc">{{ info.content }}</text>
      </view>
    </view>

    <view v-if="isOwner" class="owner-actions">
      <button class="action-btn outline-style" @click="goEdit">修改</button>
      <button class="action-btn outline-style" @click="handleDelete">删除</button>
    </view>

    <view v-if="info.status === 0 && !isOwner" class="btn-box">
      <button class="help-btn" @click="goToFulfill">💖 我来帮忙</button>
    </view>

    <view v-if="info.status === 1" class="done-card">
      <view class="done-header">
        <text class="done-title">✨ 圆梦时刻</text>
        <text class="done-time" v-if="info.fulfillTime">{{ formatDate(info.fulfillTime) }}</text>
      </view>

      <view class="info-row">
        <text class="label">善心人士</text>
        <text class="val highlight">{{ info.helperName }}</text>
      </view>
      <view class="info-row">
        <text class="label">温暖留言</text>
        <text class="val">{{ info.replyMessage }}</text>
      </view>

      <view v-if="info.evidence && info.evidence.length > 0" class="evidence-box">
        <text class="sub-title">📸 现场记录</text>
        <view class="media-grid">
          <view v-for="(item, index) in info.evidence" :key="index" class="media-show">
            <image 
              v-if="item.type === 'image'" 
              :src="item.url" 
              mode="aspectFill" 
              class="show-img"
              @click="previewImg(item.url)"
            ></image>
            <video 
              v-if="item.type === 'video'" 
              :src="item.url" 
              class="show-video"
            ></video>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

const info = ref({});
const wishId = ref(''); 
const myUserId = ref('');

// 判断是否是号主
const isOwner = computed(() => {
  return myUserId.value && info.value.uid && String(myUserId.value) === String(info.value.uid);
});

const loadDetail = () => {
  uni.showLoading({ title: '加载中...', mask: true });
  
  uniCloud.callFunction({
    name: 'wish-api',
    data: { action: 'get_detail', params: { id: wishId.value } }, 
    success: (res) => {
      uni.hideLoading();
      if (res.result.code === 0) info.value = res.result.data;
    },
    fail: () => {
      uni.hideLoading();
    }
  });
};

onLoad((options) => { 
  wishId.value = options.id; 
  myUserId.value = uni.getStorageSync('my_user_id');
});

onShow(() => { 
  if (wishId.value) loadDetail(); 
});

const goEdit = () => {
  uni.navigateTo({
    url: `/pages/wish/add?id=${wishId.value}` 
  });
};

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条心愿吗？',
    confirmColor: '#FF4B5C',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        uniCloud.callFunction({
          name: 'wish-api',
          data: { 
            action: 'delete_wish', 
            params: { id: wishId.value } 
          },
          success: (delRes) => {
            uni.hideLoading();
            if (delRes.result.code === 0) {
              uni.showToast({ title: '已删除' });
              setTimeout(() => uni.navigateBack(), 1000);
            } else {
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          },
          fail: () => {
            uni.hideLoading();
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        });
      }
    }
  });
};

const goToFulfill = () => {
  const targetId = info.value._id || wishId.value;
  if (!targetId) return;

  uni.navigateTo({ 
    url: `/pages/wish/fulfill?id=${targetId}`,
    fail: (err) => {
      console.error('跳转失败:', err);
      uni.showToast({ title: '页面路径错误', icon: 'none' });
    }
  });
};

const previewImg = (url) => {
  uni.previewImage({ urls: [url] });
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: #FFF6F8; }
.container { padding: 40rpx; }

/* 详情卡片样式 */
.detail-card {
  background: #fff; border-radius: 40rpx; padding: 50rpx 40rpx; margin-bottom: 50rpx;
  box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.4);
}

.user-header { display: flex; align-items: center; margin-bottom: 40rpx; }
.avatar { width: 90rpx; height: 90rpx; background: linear-gradient(135deg, #FF9A9E, #FECFEF); border-radius: 50%; text-align: center; line-height: 90rpx; color: #fff; font-size: 40rpx; margin-right: 24rpx; font-weight: bold; }
.user-info { flex: 1; }
.name { display: block; font-size: 34rpx; font-weight: 700; color: #2D3436; }
.time { font-size: 24rpx; color: #B2BEC3; }

.status-badge { font-size: 24rpx; padding: 10rpx 24rpx; border-radius: 30rpx; font-weight: 600; }
.status-pending { background: #FFF0F1; color: #FF4B5C; }
.status-done { background: #E6FFFA; color: #00B894; }

.content .title { font-size: 40rpx; font-weight: 800; color: #2D3436; margin-bottom: 24rpx; display: block; }
.content .desc { font-size: 30rpx; color: #636E72; line-height: 1.8; }

/* 统一按钮风格 */
.owner-actions {
  display: flex;
  gap: 30rpx;
  margin-bottom: 50rpx;
  padding: 0 10rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  display: flex; 
  align-items: center; 
  justify-content: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  background: #fff; 
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.07);
  transition: all 0.2s ease-in-out;
  
  &::after { border: none; }
  
  &:active { 
    transform: scale(0.97); 
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    background-color: #fafafa;
  }
}

/* 按钮边框风格：统一粉色线框 */
.outline-style {
  color: #FF4B5C;  
  border: 3rpx solid #FF4B5C; 
}

/* 帮忙按钮样式 */
.help-btn {
  height: 110rpx; line-height: 110rpx;
  background: linear-gradient(135deg, #FF4B5C, #FF8F70);
  color: #fff; border-radius: 55rpx; font-size: 36rpx; font-weight: bold;
  box-shadow: 0 20rpx 40rpx rgba(255, 75, 92, 0.3);
  border: none;
  &:active { transform: scale(0.98); opacity: 0.9; }
}

.done-card {
  background: #E6FFFA; border-radius: 40rpx; padding: 50rpx 40rpx;
  border: 4rpx solid #fff; 
  box-shadow: 0 10rpx 30rpx rgba(0, 184, 148, 0.1);
}
.done-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.done-title { color: #00B894; font-weight: 800; font-size: 34rpx; }
.done-time { color: #55EFC4; font-size: 24rpx; }

.info-row { margin-bottom: 20rpx; font-size: 28rpx; display: flex; }
.label { color: #00B894; width: 140rpx; opacity: 0.8; }
.val { color: #2D3436; flex: 1; font-weight: 500; }
.val.highlight { font-weight: 700; color: #00B894; }

.evidence-box { margin-top: 40rpx; padding-top: 30rpx; border-top: 2rpx dashed rgba(0, 184, 148, 0.3); }
.sub-title { font-size: 26rpx; color: #00B894; margin-bottom: 20rpx; display: block; opacity: 0.8; }
.media-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.media-show { width: 48%; height: 220rpx; border-radius: 20rpx; overflow: hidden; background: #fff; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05); }
.show-img, .show-video { width: 100%; height: 100%; }
</style>