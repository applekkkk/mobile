<script>
export default {
  onLaunch() {
    // Keep lifecycle hook for future initialization.
  }
};
</script>

<style>
page {
  background: #f6f8fc;
  color: #223047;
  font-size: 28rpx;
}

.page-wrap {
  min-height: 100%;
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.card {
  border-radius: 20rpx;
  padding: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(31, 48, 78, 0.06);
}

.main-btn {
  border: none;
  border-radius: 999rpx;
  color: #ffffff;
  background: linear-gradient(130deg, #1f5ea8, #2f78cc);
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
}

.ghost-btn {
  border: 1rpx solid #c5d5ea;
  border-radius: 999rpx;
  color: #2e4f78;
  background: #ffffff;
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
}

button::after {
  border: none;
}
</style>
