<template>
  <view class="page-wrapper" v-if="!isAutoLogin">
    <view class="culture-background-content">
      <view class="culture-mock-card">
        <text class="mock-title">🌸 固固的心愿</text>
        <view class="mock-line"></view>
        <text class="mock-desc">希望能和你一起，走遍所有的街角...</text>
      </view>
      <view class="culture-mock-card">
        <text class="mock-title">🍃 原原的陪伴</text>
        <view class="mock-line"></view>
        <text class="mock-desc">平淡日子里的每一份温暖，都值得被记录。</text>
      </view>
    </view>
    <view class="background-overlay"></view>
    <view class="login-drawer">
      <view class="drawer-header"></view>
      <view class="drawer-title">请先登录</view>
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar-img" :src="userInfo.avatarUrl || defaultAvatar" mode="aspectFill"></image>
      </button>
      <view class="input-row">
        <text class="label">昵称</text>
        <input type="nickname" class="nickname-input" placeholder="点击输入昵称" v-model="userInfo.nickName" @blur="onNicknameBlur" />
      </view>
      <button class="login-btn" @click="doLogin">登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';

const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
const userInfo = ref({ avatarUrl: '', nickName: '' });
const isAutoLogin = ref(true); 

onBeforeMount(async () => {
  const userId = uni.getStorageSync('my_user_id');
  if (!userId) {
    isAutoLogin.value = false;
    return;
  }

  // ⚡️ 优雅审计：静默检查云端账号是否存在
  try {
    const res = await uniCloud.database().collection('users').doc(userId).get();
    if (res.result.data && res.result.data.length > 0) {
      // 账号有效，直接去主页
      uni.switchTab({ url: '/pages/culture/culture' });
    } else {
      // 账号已在云端被删，悄悄清理本地，展示登录框
      uni.removeStorageSync('my_user_id');
      uni.removeStorageSync('userInfo');
      isAutoLogin.value = false;
    }
  } catch (e) {
    // 网络波动，稳妥起见不强制退登，允许尝试进入
    uni.switchTab({ url: '/pages/culture/culture' });
  }
});

const onChooseAvatar = (e) => { userInfo.value.avatarUrl = e.detail.avatarUrl; };
const onNicknameBlur = (e) => { if (e.detail.value) userInfo.value.nickName = e.detail.value; };

const doLogin = async () => {
  if (!userInfo.value.avatarUrl || !userInfo.value.nickName) {
    return uni.showToast({ title: '请完善头像和昵称', icon: 'none' });
  }
  try {
    uni.showLoading({ title: '登录中...', mask: true });
    const loginRes = await uni.login({ provider: 'weixin' });
    const userCenter = uniCloud.importObject('user-center');
    const res = await userCenter.login({
      nickname: userInfo.value.nickName,
      avatar_url: userInfo.value.avatarUrl,
      code: loginRes.code 
    });
    uni.hideLoading();
    if (res && res.code === 200) {
      uni.setStorageSync('userInfo', userInfo.value);
      uni.setStorageSync('my_user_id', res.data._id);
      uni.switchTab({ url: '/pages/culture/culture' });
    } else {
      uni.showModal({ title: '提示', content: res.msg, showCancel: false });
    }
  } catch (e) {
    uni.hideLoading();
    uni.showModal({ title: '提示', content: '连接超时，请重试', showCancel: false });
  }
};
</script>

<style lang="scss" scoped>
.page-wrapper { height: 100vh; background-color: #FFF6F8; position: relative; overflow: hidden; }
.culture-background-content { padding: 60rpx 40rpx; filter: blur(15rpx); transform: scale(1.1); opacity: 0.7; }
.culture-mock-card { background: #fff; padding: 40rpx; border-radius: 32rpx; margin-bottom: 40rpx; box-shadow: 0 10rpx 40rpx rgba(255, 75, 92, 0.1); }
.mock-title { font-size: 40rpx; font-weight: 800; color: #2D3436; display: block; }
.mock-line { width: 80rpx; height: 8rpx; background: #FF4B5C; border-radius: 4rpx; margin: 24rpx 0; }
.mock-desc { font-size: 30rpx; color: #636E72; line-height: 1.6; }
.background-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(255, 246, 248, 0.4), rgba(255, 246, 248, 0.2)); }
.login-drawer { position: absolute; bottom: 0; width: 100%; height: 62vh; background-color: #ffffff; border-radius: 48rpx 48rpx 0 0; display: flex; flex-direction: column; align-items: center; padding: 40rpx; box-sizing: border-box; box-shadow: 0 -20rpx 60rpx rgba(0,0,0,0.08); z-index: 10; }
.drawer-header { width: 60rpx; height: 8rpx; background-color: #f0f0f0; border-radius: 4rpx; margin-bottom: 40rpx; }
.drawer-title { font-size: 32rpx; color: #B2BEC3; margin-bottom: 50rpx; font-weight: 600; }
.avatar-wrapper { padding: 0; width: 160rpx; height: 160rpx; background: none; border: none; margin-bottom: 60rpx; }
.avatar-img { width: 160rpx; height: 160rpx; border-radius: 0; background-color: #f8f8f8; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); border: 1rpx solid #f0f0f0; }
.input-row { display: flex; align-items: center; width: 85%; padding: 30rpx 0; border-bottom: 2rpx solid #f5f5f5; margin-bottom: 80rpx; }
.label { font-size: 32rpx; width: 100rpx; color: #2D3436; font-weight: bold; }
.nickname-input { flex: 1; font-size: 32rpx; color: #2D3436; }
.login-btn { width: 85%; height: 100rpx; line-height: 100rpx; background: linear-gradient(135deg, #FF4B5C, #FF8F70); color: white; border-radius: 50rpx; font-size: 34rpx; font-weight: bold; box-shadow: 0 10rpx 30rpx rgba(255, 75, 92, 0.3); }
</style>