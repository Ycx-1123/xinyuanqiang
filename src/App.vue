<script>
export default {
  onLaunch: function () {
    // 临时身份证逻辑
    let userId = uni.getStorageSync('my_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      uni.setStorageSync('my_user_id', userId);
    }
  },
  onShow: function () {},
  onHide: function () {}
}
</script>

<style lang="scss">
/* 🔥 核心：确保这里有 lang="scss" */
/* 注意：uni-app 会自动注入 uni.scss，这里手动引一次确保万无一失 */
@import "@/uni.scss";

/* 可以在这里写全局样式 */
view, text {
  box-sizing: border-box;
}
</style>