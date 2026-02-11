<template>
  <view class="container" v-if="wish">
    
    <view class="status-bar">
      <view class="status-icon" :class="{ 'done': wish.status === 1 }">
        {{ wish.status === 1 ? '✨' : '⏳' }}
      </view>
      <text class="status-text">
        {{ wish.status === 1 ? '心愿已达成' : '等待热心邻居' }}
      </text>
    </view>

    <view class="detail-card">
      <view class="card-header">
        <view class="avatar">{{ wish.wisherName[0] }}</view>
        <view class="meta-info">
          <text class="user-name">{{ wish.wisherName }}</text>
          <text class="time">发布于 {{ wish.createTime }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <view class="content-area">
        <text class="title">{{ wish.title }}</text>
        <text class="desc">{{ wish.content }}</text>
      </view>
    </view>

    <view class="result-card" v-if="wish.status === 1">
      <text class="result-title">🎉 圆梦记录</text>
      <text class="result-desc">
        邻居 <text class="highlight">{{ wish.helperName }}</text> 帮忙实现了这个心愿！
        <br/>
        “远亲不如近邻，一点小事不用客气~”
      </text>
      <view class="proof-img-box">
        <text class="img-placeholder">📸 现场合影/物品照片</text>
      </view>
    </view>

    <view class="footer-action" v-if="wish.status === 0">
      <button class="action-btn" hover-class="btn-hover" @click="goToFulfill">
        👋 我来帮帮TA
      </button>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const wish = ref(null);

// 模拟数据库：跟列表页的数据对应
const mockDatabase = [
  {
    id: 1,
    title: '求助：帮忙买袋米',
    content: '我住在3号楼102，腿脚不太方便，家里米吃完了，哪位好心邻居去超市的时候能顺手帮我带一袋吗？必有重谢！',
    wisherName: '李奶奶',
    helperName: '',
    status: 0, 
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
    status: 1,
    createTime: '昨天'
  }
];

// 页面加载时，根据传过来的 id 查找数据
onLoad((options) => {
  const id = Number(options.id); // 获取 URL 里的 id
  console.log('正在查看心愿 ID:', id);
  
  // 在模拟数据里查找
  const foundWish = mockDatabase.find(item => item.id === id);
  
  if (foundWish) {
    wish.value = foundWish;
  } else {
    // 如果没找到（比如新发布的），就给个默认数据兜底，防止报错
    wish.value = {
      title: '加载中...',
      content: '暂时无法获取详情',
      wisherName: '未知',
      status: 0,
      createTime: '刚刚'
    };
  }
});

// 点击“我来帮帮TA”
const goToFulfill = () => {
  // 跳转到第4个页面：去实现
  // 注意：这里把 id 也传过去，告诉下一页我们要实现哪个愿望
  uni.navigateTo({
    url: `/pages/wish/fulfill?id=${wish.value.id}`
  });
};
</script>

<style lang="scss">
page {
  background-color: #FDFBF7;
}

.container {
  padding: 30rpx;
  padding-bottom: 140rpx; /* 给底部按钮留足位置，防止遮挡内容 */
}

/* 顶部状态 */
.status-bar {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  .status-icon {
    width: 60rpx;
    height: 60rpx;
    background-color: #FFF0DE;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20rpx;
    font-size: 30rpx;
    
    &.done {
      background-color: #E6F7ED;
    }
  }
  
  .status-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #4A4A4A;
  }
}

/* 详情卡片 */
.detail-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 159, 67, 0.05);
  margin-bottom: 30rpx;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  background-color: #FFD3B6;
  border-radius: 50%;
  text-align: center;
  line-height: 80rpx;
  color: #FFF;
  font-size: 36rpx;
  margin-right: 24rpx;
}

.meta-info {
  display: flex;
  flex-direction: column;
  
  .user-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .time {
    font-size: 24rpx;
    color: #999;
    margin-top: 6rpx;
  }
}

.divider {
  height: 1rpx;
  background-color: #F5F5F5;
  margin-bottom: 30rpx;
}

.content-area {
  .title {
    display: block;
    font-size: 38rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  .desc {
    display: block;
    font-size: 30rpx;
    color: #555;
    line-height: 1.7;
    text-align: justify;
  }
}

/* 已实现结果卡片 */
.result-card {
  background-color: #FAFAFA;
  border-radius: 24rpx;
  padding: 30rpx;
  border: 2rpx dashed #E0E0E0;
  
  .result-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .result-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20rpx;
    display: block;
    
    .highlight {
      color: #FF7F50;
      font-weight: bold;
      margin: 0 8rpx;
    }
  }
}

.proof-img-box {
  width: 100%;
  height: 200rpx;
  background-color: #EEE;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .img-placeholder {
    color: #999;
    font-size: 26rpx;
  }
}

/* 底部按钮栏 */
.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  
  /* ↓↓↓ 关键修复：解决按钮超出屏幕问题 ↓↓↓ */
  box-sizing: border-box;
  
  padding: 20rpx 40rpx 50rpx; 
  background-color: #FDFBF7;
  z-index: 100;
}

.action-btn {
  background: linear-gradient(135deg, #FF7F50, #FF512F); 
  color: #FFF;
  border-radius: 50rpx;
  
  /* 微调高度，让按钮更精致 */
  font-size: 32rpx;
  font-weight: 600;
  height: 88rpx;
  line-height: 88rpx;
  
  box-shadow: 0 10rpx 20rpx rgba(255, 81, 47, 0.3);
  
  &::after { border: none; }
}

.btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>