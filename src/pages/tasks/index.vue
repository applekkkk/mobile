<template>
  <view class="page-wrap">
    <view class="card filter-card">
      <input v-model.trim="keyword" class="search-input" placeholder="搜索任务标题、描述、分类" />
    </view>

    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else-if="filteredList.length === 0" class="card empty-card">
      <text>暂无可承接任务</text>
    </view>

    <view v-else class="list-wrap">
      <TaskCard v-for="item in filteredList" :key="item.id" :item="item" @open="openDetail(item.id)" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { taskApi } from "../../services/api";
import { ensureLogin, getUser } from "../../utils/auth";
import TaskCard from "../../components/TaskCard.vue";

const loading = ref(false);
const keyword = ref("");
const list = ref([]);

function normalize(item) {
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

const filteredList = computed(() => {
  const q = keyword.value.toLowerCase();
  if (!q) return list.value;
  return list.value.filter((item) =>
    `${item.title} ${item.description} ${item.category} ${item.tags} ${item.publisher}`.toLowerCase().includes(q)
  );
});

async function fetchTasks() {
  if (!ensureLogin()) return;
  loading.value = true;
  try {
    const user = getUser();
    const res = await taskApi.getMarket(user?.id || null);
    const raw = Array.isArray(res?.data) ? res.data : [];
    list.value = raw.map(normalize);
  } catch (error) {
    list.value = [];
    uni.showToast({ title: error.message || "加载失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

function openDetail(id) {
  uni.navigateTo({ url: `/pages/tasks/detail?id=${id}` });
}

onShow(() => {
  fetchTasks();
});
</script>

<style scoped>
.filter-card {
  margin-bottom: 16rpx;
}

.search-input {
  border: 1rpx solid #cfddf0;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
  background: #f7faff;
}

.list-wrap {
  padding-top: 4rpx;
}

.loading-text,
.empty-card {
  text-align: center;
  color: #70839a;
}
</style>
