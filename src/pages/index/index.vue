<template>
  <view class="container">
    <view class="header">
      <text class="header-title">居民心愿墙</text>
    </view>

    <scroll-view scroll-y class="wish-list">
      <view 
        class="wish-card" 
        v-for="(item, index) in wishList" 
        :key="item.id"
        @click="goToDetail(item.id)"
      >
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
            <view class="avatar-placeholder">{{ item.wisherName[0] }}</view>
            <text class="user-name">心愿人：{{ item.wisherName }}</text>
          </view>
          <text class="post-time">{{ item.createTime }}</text>
        </view>

        <view v-if="item.status === 1" class="helper-info">
          <text class="helper-text">✨ 邻居 {{ item.helperName }} 帮忙实现了愿望</text>
        </view>
      </view>
      
      <view style="height: 100px;"></view>
    </scroll-view>

    <view class="fab-btn" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 模拟数据：暖心社区风
const wishList = ref([
  {
    id: 1,
    title: '求助：帮忙买袋米',
    content: '我住在3号楼102，腿脚不太方便，家里米吃完了，哪位好心邻居去超市的时候能顺手帮我带一袋吗？必有重谢！',
    wisherName: '李奶奶',
    helperName: '',
    status: 0, // 0: 待实现
    createTime: '刚刚'
  },
  {
    id: 2,
    title: '闲置感冒药赠送',
    content: '家里多了两盒999感冒灵，保质期到明年。最近流感多，谁家急用的可以直接来拿，放门口了。',
    wisherName: '张先生',
    helperName: '',
    status: 0,
    createTime: '2小时前'
  },
  {
    id: 3,
    title: '想学剪纸',
    content: '快过年了，想给窗户贴个窗花。听说咱们小区有位剪纸高手，想拜师学艺，或者求个教程！',
    wisherName: '小王同学',
    helperName: '赵老师傅',
    status: 1, // 1: 已实现
    createTime: '昨天'
  }
]);

// 跳转到发布页
const goToAdd = () => {
  console.log('点击了发布按钮');
  uni.navigateTo({ url: '/pages/wish/add' });
};

// 跳转到详情页
const goToDetail = (id) => {
  console.log('点击了心愿ID:', id);
  uni.navigateTo({ url: `/pages/wish/detail?id=${id}` });
};
</script>

<style lang="scss">
/* 整体页面背景：暖米色 */
page {
  background-color: #FDFBF7;
}

.container {
  min-height: 100vh;
  padding: 0 30rpx;
}

/* 顶部标题 */
.header {
  padding: 40rpx 0 20rpx;
  background-color: #FDFBF7; /* 保持背景一致 */
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #4A4A4A; /* 深暖灰 */
  letter-spacing: 2rpx;
}

/* 列表区域 */
.wish-list {
  padding-top: 20rpx;
}

/* 心愿卡片：核心样式 */
.wish-card {
  background-color: #FFFFFF;
  border-radius: 32rpx; /* 大圆角 */
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 159, 67, 0.08); /* 极淡的暖橙色阴影 */
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98); /* 点击时的微缩放效果 */
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

/* 状态标签 */
.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-pending {
  background-color: #FFF0DE; /* 淡橙色背景 */
  color: #FF9F43; /* 暖橙色文字 */
}

.status-done {
  background-color: #E6F7ED; /* 淡绿色背景 */
  color: #2ECC71; /* 绿色文字 */
}

.card-body {
  margin-bottom: 24rpx;
}

.card-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  /* 限制显示2行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #F5F5F5;
  padding-top: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-placeholder {
  width: 40rpx;
  height: 40rpx;
  background-color: #FFD3B6; /* 珊瑚色占位符 */
  color: #FFF;
  border-radius: 50%;
  font-size: 24rpx;
  text-align: center;
  line-height: 40rpx;
  margin-right: 12rpx;
}

.user-name {
  font-size: 26rpx;
  color: #888;
}

.post-time {
  font-size: 24rpx;
  color: #AAA;
}

.helper-info {
  margin-top: 20rpx;
  padding: 16rpx;
  background-color: #F9F9F9;
  border-radius: 12rpx;
}

.helper-text {
  font-size: 24rpx;
  color: #FF7F50; /* 珊瑚粉，强调互助 */
  font-weight: 500;
}

/* 悬浮按钮 (FAB) */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  /* 渐变暖橙色 */
  background: linear-gradient(135deg, #FFB75E, #ED8F03);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(237, 143, 3, 0.4);
  z-index: 100;
}

.fab-icon {
  color: #FFF;
  font-size: 60rpx;
  font-weight: 300;
  margin-top: -8rpx; /* 微调加号位置 */
}
</style>