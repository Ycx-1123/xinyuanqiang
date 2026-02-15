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
  const userCenter = uniCloud.importObject('user-center');

  // 1. 本地有ID，常规检查
  if (userId) {
    try {
      const res = await userCenter.checkUser(userId);
      if (res.code === 200) {
        uni.switchTab({ url: '/pages/culture/culture' });
        return;
      }
    } catch (e) {
      console.log('本地ID失效，尝试静默恢复...');
    }
  }

  // 2. 尝试静默登录（Auto Login）
  try {
    const loginRes = await uni.login({ provider: 'weixin' });
    const code = loginRes.code || loginRes[1]?.code;
    
    if (code) {
      const silentRes = await userCenter.silentLogin(code);
      if (silentRes.code === 200 && silentRes.data) {
        // 恢复身份
        uni.setStorageSync('my_user_id', silentRes.data._id);
        uni.setStorageSync('userInfo', {
          nickName: silentRes.data.nickName,
          avatarUrl: silentRes.data.avatarUrl
        });
        uni.switchTab({ url: '/pages/culture/culture' });
        return;
      }
    }
  } catch (err) {
    console.error('静默登录失败:', err);
  }

  // 3. 失败，显示登录页
  uni.removeStorageSync('my_user_id');
  uni.removeStorageSync('userInfo');
  isAutoLogin.value = false;
});

const onChooseAvatar = (e) => { userInfo.value.avatarUrl = e.detail.avatarUrl; };
const onNicknameBlur = (e) => { if (e.detail.value) userInfo.value.nickName = e.detail.value; };

const doLogin = async () => {
  if (!userInfo.value.avatarUrl || !userInfo.value.nickName) {
    return uni.showToast({ title: '请完善头像和昵称', icon: 'none' });
  }

  try {
    uni.showLoading({ title: '准备上传...', mask: true });
    
    let finalAvatarUrl = userInfo.value.avatarUrl;
    
    // 如果是临时文件，尝试上传
    if (finalAvatarUrl.startsWith('wxfile://') || finalAvatarUrl.startsWith('http://tmp/')) {
       try {
         const uploadRes = await uniCloud.uploadFile({
           filePath: finalAvatarUrl,
           cloudPath: `avatars/${Date.now()}_${Math.random().toString(36).slice(-6)}.jpg`
         });
         finalAvatarUrl = uploadRes.fileID; 
       } catch (err) {
         uni.hideLoading();
         
         // 🔥🔥🔥 核心修改：把错误直接打印到手机屏幕上！
         // 这样你就能看到到底是域名还没生效，还是别的什么原因
         console.error('上传失败详情:', err);
         await new Promise(resolve => {
            uni.showModal({
                title: '上传失败(请截图)',
                // 将错误对象转为字符串显示，以便调试
                content: '错误信息：' + JSON.stringify(err), 
                showCancel: false,
                success: () => resolve()
            });
         });
         
         // 即使上传失败，也继续往下走，防止用户被卡在登录页进不去
         // 这样虽然头像是临时的（下次进来会挂），但至少能先用
       }
    }

    uni.showLoading({ title: '登录中...', mask: true });
    
    const loginRes = await uni.login({ provider: 'weixin' });
    const code = loginRes.code || loginRes[1]?.code;

    const userCenter = uniCloud.importObject('user-center');
    const res = await userCenter.login({
      nickname: userInfo.value.nickName,
      avatar_url: finalAvatarUrl, 
      code: code 
    });
    
    uni.hideLoading();

    if (res && res.code === 200) {
      uni.setStorageSync('userInfo', { 
        nickName: userInfo.value.nickName, 
        avatarUrl: finalAvatarUrl 
      });
      uni.setStorageSync('my_user_id', res.data._id);
      uni.showToast({ title: '登录成功' });
      setTimeout(() => { uni.switchTab({ url: '/pages/culture/culture' }); }, 800);
    } else {
      uni.showModal({ title: '登录失败', content: res.msg || '请重试', showCancel: false });
    }
  } catch (e) {
    uni.hideLoading();
    // 全局错误也弹窗显示
    uni.showModal({ title: '系统错误', content: JSON.stringify(e), showCancel: false });
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