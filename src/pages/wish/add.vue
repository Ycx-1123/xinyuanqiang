<template>
  <view class="container">
    <view class="header-tip">
      <text class="tip-title">写下你的心愿</text>
      <text class="tip-desc">邻里互助，温暖常在 ✨</text>
    </view>

    <view class="form-card">
      
      <view class="form-item">
        <text class="label">心愿主题</text>
        <input 
          class="input" 
          type="text" 
          placeholder="例如：想借一把梯子 / 谁会修水龙头" 
          placeholder-class="placeholder-style"
          v-model="formData.title"
        />
      </view>

      <view class="form-item">
        <text class="label">详细描述</text>
        <textarea 
          class="textarea" 
          placeholder="请详细描述你的需求，方便邻居们准备工具或安排时间..." 
          placeholder-class="placeholder-style"
          maxlength="200"
          v-model="formData.content"
        />
        <text class="word-count">{{ formData.content.length }}/200</text>
      </view>

      <view class="form-item no-border">
        <text class="label">怎么称呼你</text>
        <input 
          class="input" 
          type="text" 
          placeholder="例如：3号楼李阿姨" 
          placeholder-class="placeholder-style"
          v-model="formData.wisherName"
        />
      </view>

    </view>

    <button class="submit-btn" hover-class="btn-hover" @click="submitWish">
      发布心愿 🕊️
    </button>

  </view>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({
  title: '',
  content: '',
  wisherName: ''
});

const submitWish = () => {
  // 1. 简单的非空校验
  if (!formData.title.trim()) {
    return uni.showToast({ title: '写个标题吧~', icon: 'none' });
  }
  if (!formData.content.trim()) {
    return uni.showToast({ title: '描述越详细，越容易实现哦', icon: 'none' });
  }
  if (!formData.wisherName.trim()) {
    return uni.showToast({ title: '留个称呼方便邻居联系', icon: 'none' });
  }

  // 2. 模拟提交过程
  uni.showLoading({ title: '正在发布...' });

  setTimeout(() => {
    uni.hideLoading();
    
    // 3. 提交成功提示
    uni.showToast({
      title: '发布成功！',
      icon: 'success',
      duration: 1500
    });

    // 4. 延迟返回上一页 (列表页)
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    
  }, 1000);
};
</script>

<style lang="scss">
page {
  background-color: #FDFBF7; /* 保持一致的暖米色背景 */
}

.container {
  padding: 40rpx 30rpx;
}

/* 顶部提示 */
.header-tip {
  margin-bottom: 40rpx;
  .tip-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #4A4A4A;
    display: block;
    margin-bottom: 10rpx;
  }
  .tip-desc {
    font-size: 28rpx;
    color: #999;
  }
}

/* 表单大卡片 */
.form-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 10rpx 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 159, 67, 0.05);
  margin-bottom: 60rpx;
}

.form-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &.no-border {
    border-bottom: none;
  }

  .label {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
  }

  .input {
    font-size: 30rpx;
    color: #333;
    height: 60rpx;
  }

  .textarea {
    width: 100%;
    height: 200rpx;
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
  }

  .placeholder-style {
    color: #CCC;
    font-size: 28rpx;
  }

  .word-count {
    display: block;
    text-align: right;
    font-size: 24rpx;
    color: #CCC;
    margin-top: 10rpx;
  }
}

/* 提交按钮 */
.submit-btn {
  background: linear-gradient(135deg, #FFB75E, #ED8F03); /* 暖橙渐变 */
  color: #FFF;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: 600;
  height: 100rpx;
  line-height: 100rpx;
  box-shadow: 0 10rpx 20rpx rgba(237, 143, 3, 0.3);
  
  /* 去除默认边框 */
  &::after {
    border: none;
  }
}

.btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>