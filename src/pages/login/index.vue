<template>
  <view class="page-wrap login-page">
    <view class="hero card">
      <text class="title">数据交易平台</text>
    </view>

    <view class="card form-card">
      <view class="field">
        <text class="label">账号</text>
        <input v-model.trim="form.username" class="input" placeholder="请输入账号" />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input v-model="form.password" class="input" password placeholder="请输入密码" />
      </view>
      <button class="main-btn submit-btn" :loading="loading" @click="handleLogin">登录</button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { authApi, userApi } from "../../services/api";
import { setSession } from "../../utils/auth";

const form = reactive({
  username: "",
  password: ""
});
const loading = ref(false);

async function handleLogin() {
  if (!form.username || !form.password) {
    uni.showToast({ title: "请输入账号和密码", icon: "none" });
    return;
  }
  loading.value = true;
  try {
    const res = await authApi.login({
      username: form.username,
      password: form.password
    });
    const data = res?.data || {};
    if (!data?.token || !data?.id) {
      throw new Error("登录失败");
    }
    let user = {
      id: data.id,
      role: Number(data.role) === 1 ? "admin" : "user",
      name: data.name || form.username,
      points: Number(data.points || 0)
    };
    try {
      const userRes = await userApi.getById(data.id);
      user = {
        ...user,
        ...(userRes?.data || {}),
        role: Number(userRes?.data?.role) === 1 ? "admin" : "user"
      };
    } catch {
      // Keep lightweight user info if profile request fails.
    }
    setSession(data.token, user);
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      uni.reLaunch({ url: "/pages/market/index" });
    }, 200);
  } catch (error) {
    uni.showToast({ title: error.message || "登录失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  padding-top: 72rpx;
}

.hero {
  background: linear-gradient(145deg, #e8f1ff, #f1f6ff);
  margin-bottom: 34rpx;
  min-height: 160rpx;
  display: flex;
  align-items: center;
}

.title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  color: #1f3f68;
}

.form-card {
  display: flex;
  flex-direction: column;
  padding-top: 30rpx;
  padding-bottom: 26rpx;
}

.field {
  margin-bottom: 30rpx;
}

.label {
  color: #3f526e;
}

.input {
  border: 1rpx solid #d0ddee;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  background: #f9fbff;
}

.submit-btn {
  margin-top: 22rpx;
}
</style>
