<template>
  <view class="page-wrap">
    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else-if="!task" class="card empty-card">
      <text>未找到任务</text>
    </view>

    <view v-else class="detail-wrap">
      <view class="card">
        <view class="head-row">
          <text class="title">{{ task.title }}</text>
          <view class="points-badge">
            <text class="points-num">{{ task.budget }}</text>
            <text class="points-text">积分</text>
          </view>
        </view>
        <text class="desc">{{ task.description || "暂无描述" }}</text>
        <view class="meta-row">
          <text class="meta">分类：{{ task.category || "其他" }}</text>
          <text class="meta">发布者：{{ task.publisher || "未知用户" }}</text>
          <text class="meta">标签：{{ task.tags || "无" }}</text>
        </view>
      </view>

      <button class="main-btn action-btn" :loading="submitting" @click="handleAccept">承接任务</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { taskApi } from "../../services/api";
import { ensureLogin, getUser } from "../../utils/auth";

const task = ref(null);
const loading = ref(false);
const submitting = ref(false);
const taskId = ref(0);

function normalize(item) {
  return {
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    category: item.category || "其他",
    tags: item.tags || "",
    budget: Number(item.budget || 0),
    publisher: item.publisherName || item.publisher_name || "",
    publisherId: item.publisherId || item.publisher_id || null
  };
}

async function fetchDetail() {
  if (!ensureLogin()) return;
  if (!taskId.value) return;
  loading.value = true;
  try {
    const res = await taskApi.getById(taskId.value);
    task.value = normalize(res?.data || {});
  } catch (error) {
    task.value = null;
    uni.showToast({ title: error.message || "加载失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

async function handleAccept() {
  if (!task.value || submitting.value) return;
  const user = getUser();
  if (!user?.id) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  if (Number(task.value.publisherId || 0) === Number(user.id)) {
    uni.showToast({ title: "不能承接自己发布的任务", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const res = await taskApi.accept(task.value.id, {
      acceptorId: user.id,
      acceptorName: user.name || user.username || "用户"
    });
    if (res?.code !== 200) throw new Error(res?.message || "承接失败");
    uni.showToast({ title: "承接成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 250);
  } catch (error) {
    uni.showToast({ title: error.message || "承接失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

onLoad((query) => {
  taskId.value = Number(query?.id || 0);
  fetchDetail();
});
</script>

<style scoped>
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.head-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.title {
  flex: 1;
  color: #203451;
  font-size: 34rpx;
  font-weight: 700;
}

.points-badge {
  min-width: 120rpx;
  border-radius: 16rpx;
  padding: 10rpx 12rpx;
  background: linear-gradient(140deg, #fff5de, #ffe4b2);
  text-align: center;
}

.points-num {
  display: block;
  color: #b26a11;
  font-size: 32rpx;
  font-weight: 700;
}

.points-text {
  color: #855617;
  font-size: 22rpx;
}

.desc {
  display: block;
  margin-top: 14rpx;
  color: #4f637f;
  line-height: 1.6;
}

.meta-row {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.meta {
  color: #58708c;
}

.action-btn {
  margin-top: 8rpx;
}

.loading-text,
.empty-card {
  text-align: center;
  color: #70839a;
}
</style>
