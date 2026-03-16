<template>
  <view class="page-wrap">
    <view class="card profile-card">
      <view class="name-row">
        <text class="name">{{ user.name || user.username || "未命名用户" }}</text>
        <text class="role">{{ user.role === "admin" ? "管理员" : "普通用户" }}</text>
      </view>
      <text class="bio">{{ user.bio || "这个人很低调，还没有填写简介" }}</text>

      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ user.points || 0 }}</text>
          <text class="stat-label">我的积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ user.lastCheckInDate || "-" }}</text>
          <text class="stat-label">上次签到</text>
        </view>
      </view>

      <view class="action-row">
        <button
          class="action-btn"
          :class="checkedToday ? 'ghost-btn' : 'main-btn'"
          :disabled="checkingIn || checkedToday"
          :loading="checkingIn"
          @click="handleCheckIn"
        >
          {{ checkedToday ? "今日已签到" : "每日签到 +10" }}
        </button>
        <button class="ghost-btn action-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>

    <view class="tabs card">
      <view class="tab-row">
        <text
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </text>
      </view>
    </view>

    <view v-if="activeTab === 'points'" class="card">
      <text class="points-title">当前可用积分</text>
      <text class="points-value">{{ user.points || 0 }}</text>
      <text class="points-tip">积分可用于购买数据与任务交易</text>
    </view>

    <view v-else-if="activeTab === 'favorites'" class="list-wrap">
      <view v-if="loadingList" class="loading-text">加载中...</view>
      <view v-else-if="favoriteList.length === 0" class="card empty-card">暂无收藏</view>
      <DatasetCard v-else v-for="item in favoriteList" :key="item.id" :item="item" @open="goDatasetDetail(item.id)" />
    </view>

    <view v-else-if="activeTab === 'warehouse'" class="list-wrap">
      <view v-if="loadingList" class="loading-text">加载中...</view>
      <view v-else-if="warehouseList.length === 0" class="card empty-card">个人仓库为空</view>
      <DatasetCard v-else v-for="item in warehouseList" :key="item.id" :item="item" @open="goDatasetDetail(item.id)" />
    </view>

    <view v-else-if="activeTab === 'published'" class="list-wrap">
      <view v-if="loadingList" class="loading-text">加载中...</view>
      <view v-else-if="publishedTasks.length === 0" class="card empty-card">暂无发布任务</view>
      <TaskCard v-else v-for="item in publishedTasks" :key="item.id" :item="item" @open="goTaskDetail(item.id)" />
    </view>

    <view v-else-if="activeTab === 'accepted'" class="list-wrap">
      <view v-if="loadingList" class="loading-text">加载中...</view>
      <view v-else-if="acceptedTasks.length === 0" class="card empty-card">暂无承接任务</view>
      <TaskCard v-else v-for="item in acceptedTasks" :key="item.id" :item="item" @open="goTaskDetail(item.id)" />
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import DatasetCard from "../../components/DatasetCard.vue";
import TaskCard from "../../components/TaskCard.vue";
import { orderApi, productApi, taskApi, userApi } from "../../services/api";
import { clearSession, ensureLogin, getUser, updateUser } from "../../utils/auth";

const tabs = [
  { key: "points", label: "我的积分" },
  { key: "favorites", label: "我的收藏" },
  { key: "warehouse", label: "个人仓库" },
  { key: "published", label: "发布任务" },
  { key: "accepted", label: "承接任务" }
];

const activeTab = ref("points");
const checkingIn = ref(false);
const loadingList = ref(false);

const user = reactive({
  id: null,
  role: "user",
  name: "",
  username: "",
  points: 0,
  bio: "",
  lastCheckInDate: ""
});

const favoriteList = ref([]);
const warehouseList = ref([]);
const publishedTasks = ref([]);
const acceptedTasks = ref([]);

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const checkedToday = computed(() => user.lastCheckInDate === todayStr());

function fillUser(next) {
  user.id = next?.id || null;
  user.role = Number(next?.role) === 1 || next?.role === "admin" ? "admin" : "user";
  user.name = next?.name || "";
  user.username = next?.username || "";
  user.points = Number(next?.points || 0);
  user.bio = next?.bio || "";
  user.lastCheckInDate = next?.lastCheckInDate || "";
}

function normalizeProduct(item) {
  return {
    id: item.id,
    name: item.name || "",
    info: item.info || "",
    category: item.category || "其他",
    tags: item.tags || "",
    price: Number(item.price || 0),
    author: item.authorName || item.author_name || item.author || "",
    sizeLabel: item.sizeLabel || item.size_label || item.size || "-",
    uploadDate: item.uploadDate || item.upload_date || ""
  };
}

function normalizeTask(item) {
  return {
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    category: item.category || "其他",
    tags: item.tags || "",
    budget: Number(item.budget || 0),
    publisher: item.publisherName || item.publisher_name || "",
    deadline: item.deadline || ""
  };
}

async function loadProfile() {
  if (!ensureLogin()) return;
  const local = getUser();
  fillUser(local || {});
  if (!local?.id) return;
  try {
    const res = await userApi.getById(local.id);
    const merged = { ...local, ...(res?.data || {}) };
    fillUser(merged);
    updateUser(merged);
  } catch {
    // Keep local user when request fails.
  }
}

async function loadFavorites() {
  const res = await productApi.getFavorites(user.id);
  const list = Array.isArray(res?.data) ? res.data : [];
  favoriteList.value = list.map(normalizeProduct);
}

async function loadWarehouse() {
  const orderRes = await orderApi.getUserList(user.id);
  const orders = Array.isArray(orderRes?.data) ? orderRes.data : [];
  const ids = Array.from(
    new Set(
      orders
        .filter((item) => Number(item.amount || 0) < 0)
        .map((item) => Number(item.productId || 0))
        .filter((id) => id > 0)
    )
  );
  const products = await Promise.all(ids.map((id) => productApi.getById(id, user.id).catch(() => null)));
  warehouseList.value = products
    .map((res) => (res?.data ? normalizeProduct(res.data) : null))
    .filter(Boolean);
}

async function loadPublishedTasks() {
  const res = await taskApi.getUserList(user.id);
  const list = Array.isArray(res?.data) ? res.data : [];
  publishedTasks.value = list.map(normalizeTask);
}

async function loadAcceptedTasks() {
  const res = await taskApi.getAll();
  const list = Array.isArray(res?.data) ? res.data : [];
  acceptedTasks.value = list
    .filter((item) => Number(item.acceptorId || item.acceptor_id || 0) === Number(user.id))
    .map(normalizeTask);
}

async function loadTabData() {
  if (!user.id || activeTab.value === "points") return;
  loadingList.value = true;
  try {
    if (activeTab.value === "favorites") await loadFavorites();
    if (activeTab.value === "warehouse") await loadWarehouse();
    if (activeTab.value === "published") await loadPublishedTasks();
    if (activeTab.value === "accepted") await loadAcceptedTasks();
  } catch (error) {
    uni.showToast({ title: error.message || "加载失败", icon: "none" });
  } finally {
    loadingList.value = false;
  }
}

function switchTab(key) {
  activeTab.value = key;
  loadTabData();
}

async function handleCheckIn() {
  if (!user.id || checkingIn.value || checkedToday.value) return;
  checkingIn.value = true;
  try {
    const res = await userApi.checkIn(user.id);
    if (res?.code !== 200) throw new Error(res?.message || "签到失败");
    const points = Number(user.points || 0) + 10;
    const lastCheckInDate = todayStr();
    fillUser({ ...user, points, lastCheckInDate });
    updateUser({ points, lastCheckInDate });
    uni.showToast({ title: "签到成功", icon: "success" });
  } catch (error) {
    uni.showToast({ title: error.message || "签到失败", icon: "none" });
  } finally {
    checkingIn.value = false;
  }
}

function goDatasetDetail(id) {
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` });
}

function goTaskDetail(id) {
  uni.navigateTo({ url: `/pages/tasks/detail?id=${id}` });
}

function handleLogout() {
  clearSession();
  uni.reLaunch({ url: "/pages/login/index" });
}

onShow(async () => {
  await loadProfile();
  await loadTabData();
});
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  background: linear-gradient(145deg, #edf4ff, #ffffff);
}
.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  color: #1f3555;
  font-size: 36rpx;
  font-weight: 700;
}
.role {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  color: #2f5c92;
  background: #dfeafa;
  font-size: 22rpx;
}
.bio {
  color: #5c6f89;
  line-height: 1.6;
}
.stats-row {
  display: flex;
  gap: 12rpx;
}
.stat-item {
  flex: 1;
  border-radius: 14rpx;
  padding: 14rpx;
  background: #f7faff;
}
.stat-num {
  display: block;
  color: #1f3758;
  font-size: 32rpx;
  font-weight: 700;
}
.stat-label {
  margin-top: 6rpx;
  color: #6b7f99;
  font-size: 22rpx;
}
.action-row {
  display: flex;
  gap: 12rpx;
}
.action-btn {
  width: 100%;
}
.tabs {
  margin-top: 14rpx;
}
.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tab-item {
  color: #4f6584;
  font-size: 26rpx;
}
.tab-item.active {
  color: #1f518d;
  font-weight: 600;
}
.list-wrap {
  margin-top: 14rpx;
}
.points-title {
  color: #4d6181;
}
.points-value {
  display: block;
  margin-top: 12rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: #1f518d;
}
.points-tip {
  display: block;
  margin-top: 10rpx;
  color: #7185a0;
}
.loading-text,
.empty-card {
  text-align: center;
  color: #70839a;
}
</style>
