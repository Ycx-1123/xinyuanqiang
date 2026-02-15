<template>
  <view class="container">
    <view class="title-area">
      <text class="main-title">{{ isEditMode ? '修改心愿 📝' : '许个愿吧 ✨' }}</text>
      <text class="sub-title">{{ isEditMode ? '完善信息让大家更懂你' : '让温暖的邻居帮你实现' }}</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">心愿标题</text>
        <input class="input" v-model="formData.title" placeholder="例如：想借个梯子..." placeholder-class="input-ph" />
      </view>
      <view class="form-item">
        <text class="label">详情描述</text>
        <textarea class="textarea" v-model="formData.content" placeholder="详细说说你的需求，好让大家准备..." placeholder-class="input-ph" />
      </view>
      <view class="form-item">
        <text class="label">您的称呼</text>
        <input class="input" v-model="formData.wisherName" placeholder="例如：2号楼张姨" placeholder-class="input-ph" />
      </view>
    </view>

    <button class="submit-btn" @click="submitWish">
      {{ isEditMode ? '确认修改' : '✨ 发布心愿' }}
    </button>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app'; // 🔥 引入 onLoad

const formData = reactive({ title: '', content: '', wisherName: '' });
const isEditMode = ref(false); // 是否处于编辑模式
const wishId = ref(''); // 编辑时的心愿ID

// 🔥 页面加载时判断是“新增”还是“修改”
onLoad((options) => {
  if (options.id) {
    isEditMode.value = true;
    wishId.value = options.id;
    loadWishDetail(options.id);
  }
});

// 如果是修改模式，先去云端拉取旧数据
const loadWishDetail = (id) => {
  uni.showLoading({ title: '加载中...' });
  uniCloud.callFunction({
    name: 'wish-api',
    data: { action: 'get_detail', params: { id: id } },
    success: (res) => {
      uni.hideLoading();
      if (res.result.code === 0) {
        const data = res.result.data;
        // 回填表单
        formData.title = data.title;
        formData.content = data.content;
        formData.wisherName = data.wisherName;
      }
    }
  });
};

const submitWish = () => {
  if (!formData.title || !formData.content || !formData.wisherName) {
    return uni.showToast({ title: '请填写完整', icon: 'none' });
  }

  const currentUserId = uni.getStorageSync('my_user_id');
  if (!currentUserId) {
    return uni.showToast({ title: '无法获取身份信息，请先授权登录', icon: 'none' });
  }

  uni.showLoading({ title: isEditMode.value ? '修改中...' : '发送中...' });
  
  // 🔥 核心：根据模式选择 action
  const actionName = isEditMode.value ? 'update_wish' : 'add_wish';
  // 如果是修改，需要传心愿ID
  const params = { ...formData, uid: currentUserId };
  if (isEditMode.value) {
    params.id = wishId.value;
  }

  uniCloud.callFunction({
    name: 'wish-api',
    data: {
      action: actionName,
      params: params
    },
    success: (res) => {
      uni.hideLoading();
      if (res.result.code === 0) {
        uni.showToast({ title: isEditMode.value ? '修改成功' : '发布成功' });
        setTimeout(() => uni.navigateBack(), 1500);
      } else {
        uni.showToast({ title: '操作失败请重试', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '网络开小差了', icon: 'none' });
    }
  });
};
</script>

<style lang="scss">
@import "@/uni.scss";
page { background-color: $uni-bg-color-grey; }
.container { padding: 40rpx; }

.title-area { margin-bottom: 50rpx; margin-top: 20rpx; }
.main-title { font-size: 48rpx; font-weight: 800; color: #2D3436; display: block; }
.sub-title { font-size: 28rpx; color: #636E72; margin-top: 10rpx; display: block; }

.form-card { background: #fff; border-radius: 40rpx; padding: 50rpx 40rpx; box-shadow: 0 10rpx 40rpx rgba(223, 230, 233, 0.4); }

.form-item { margin-bottom: 40rpx; }
.label { font-size: 28rpx; font-weight: 600; color: #2D3436; margin-bottom: 20rpx; display: block; padding-left: 10rpx; }
.input, .textarea {
  background: #F8FAFC; 
  border: 2rpx solid #F1F2F6;
  border-radius: 24rpx; padding: 24rpx 30rpx; width: 100%; box-sizing: border-box; font-size: 30rpx; color: #2D3436;
  transition: all 0.3s;
}
.input:focus, .textarea:focus { background: #fff; border-color: #FF4B5C; } 
.input { height: 100rpx; }
.textarea { height: 260rpx; }
.input-ph { color: #B2BEC3; }

.submit-btn {
  margin-top: 60rpx;
  height: 110rpx; line-height: 110rpx;
  background: linear-gradient(135deg, #FF4B5C, #FF8F70);
  color: #fff; border-radius: 55rpx; font-size: 34rpx; font-weight: bold;
  box-shadow: 0 20rpx 40rpx rgba(255, 75, 92, 0.3);
  border: none;
  &:active { transform: scale(0.98); opacity: 0.9; }
}
</style>