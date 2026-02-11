<template>
  <view class="container">
    
    <view class="target-wish-card">
      <text class="label">正在帮助实现：</text>
      <text class="wish-title">{{ wishTitle }}</text>
    </view>

    <view class="form-card">
      
      <view class="form-item">
        <text class="item-label">我是邻居 (您的称呼)</text>
        <input 
          class="input" 
          type="text" 
          placeholder="例如：6号楼张大哥" 
          placeholder-class="placeholder-style"
          v-model="formData.helperName"
        />
      </view>

      <view class="form-item">
        <text class="item-label">给TA留言</text>
        <textarea 
          class="textarea" 
          placeholder="例如：东西放门口啦 / 随时联系我..." 
          placeholder-class="placeholder-style"
          v-model="formData.message"
        />
      </view>

      <view class="form-item no-border">
        <text class="item-label">上传证明 (照片/视频)</text>
        <view class="upload-box" @click="chooseImage">
          <image v-if="formData.imagePath" :src="formData.imagePath" class="preview-img" mode="aspectFill"></image>
          <view v-else class="upload-placeholder">
            <text class="camera-icon">📷</text>
            <text class="upload-text">点击上传照片</text>
          </view>
        </view>
        <text class="upload-tip">为了维护社区秩序，请上传一张现场照片或物品照片哦~</text>
      </view>

    </view>

    <button class="submit-btn" hover-class="btn-hover" @click="submitFulfill">
      确认实现 ✨
    </button>

  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const wishTitle = ref('加载中...');
const wishId = ref(0);

const formData = reactive({
  helperName: '',
  message: '',
  imagePath: '' // 存储图片路径
});

// 接收上一页传来的 ID
onLoad((options) => {
  wishId.value = options.id;
  // 在真实开发中，这里应该用 ID 去后台查一下心愿标题
  // 这里我们为了演示，模拟一下：
  wishTitle.value = options.id == 1 ? '求助：帮忙买袋米' : '未知心愿';
});

// 选择图片功能
const chooseImage = () => {
  uni.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], 
    sourceType: ['album', 'camera'], 
    success: function (res) {
      // 拿到图片路径，显示在页面上
      console.log(res.tempFilePaths);
      formData.imagePath = res.tempFilePaths[0];
    }
  });
};

// 提交
const submitFulfill = () => {
  if (!formData.helperName.trim()) {
    return uni.showToast({ title: '请留下您的称呼', icon: 'none' });
  }
  if (!formData.imagePath) {
    return uni.showToast({ title: '请上传一张证明照片', icon: 'none' });
  }

  uni.showLoading({ title: '提交中...' });

  // 模拟提交给服务器
  setTimeout(() => {
    uni.hideLoading();
    
    uni.showModal({
      title: '太棒了！🎉',
      content: '感谢您的热心帮助！社区因您更温暖。',
      showCancel: false,
      confirmText: '返回首页',
      confirmColor: '#FF7F50',
      success: () => {
        // 成功后，直接返回首页（或者心愿列表）
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  }, 1500);
};
</script>

<style lang="scss">
page {
  background-color: #FDFBF7;
}

.container {
  padding: 30rpx;
}

/* 顶部目标心愿提示 */
.target-wish-card {
  background-color: #FFF0DE; /* 这里的背景色稍微深一点，突出提示 */
  padding: 24rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  
  .label {
    font-size: 26rpx;
    color: #FF9F43;
    margin-right: 10rpx;
  }
  
  .wish-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

/* 表单卡片 */
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
  
  &.no-border { border-bottom: none; }
  
  .item-label {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .input {
    height: 60rpx;
    font-size: 30rpx;
    color: #333;
  }
  
  .textarea {
    width: 100%;
    height: 160rpx;
    font-size: 30rpx;
    line-height: 1.6;
    color: #333;
  }
  
  .placeholder-style {
    color: #CCC;
    font-size: 28rpx;
  }
}

/* 图片上传框 */
.upload-box {
  width: 200rpx;
  height: 200rpx;
  background-color: #FAFAFA;
  border: 2rpx dashed #DDD; /* 虚线边框 */
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 16rpx;
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .camera-icon {
      font-size: 50rpx;
      margin-bottom: 10rpx;
      color: #CCC;
    }
    
    .upload-text {
      font-size: 22rpx;
      color: #999;
    }
  }
  
  .preview-img {
    width: 100%;
    height: 100%;
  }
}

.upload-tip {
  font-size: 24rpx;
  color: #AAA;
}

/* 按钮 */
.submit-btn {
  background: linear-gradient(135deg, #FF7F50, #FF512F);
  color: #FFF;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: 600;
  height: 100rpx;
  line-height: 100rpx;
  box-shadow: 0 10rpx 20rpx rgba(255, 81, 47, 0.3);
  
  &::after { border: none; }
}

.btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>