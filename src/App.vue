<script>
export default {
  onLaunch: function () {
    console.log('App Launch');
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  }
}
</script>

<style>
view, text, button, input {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
}
page {
  background-color: #FFF6F8 !important; 
  min-height: 100vh;
}
button::after { border: none; }
</style>