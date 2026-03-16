<template>
  <view class="page-wrap">
    <view class="card filter-card">
      <input v-model.trim="keyword" class="search-input" placeholder="搜索名称、分类、标签" />
    </view>

    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else-if="filteredList.length === 0" class="card empty-card">
      <text>暂无数据</text>
    </view>

    <view v-else class="list-wrap">
      <DatasetCard v-for="item in filteredList" :key="item.id" :item="item" @open="openDetail(item.id)" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { productApi } from "../../services/api";
import { ensureLogin, getUser } from "../../utils/auth";
import DatasetCard from "../../components/DatasetCard.vue";

const loading = ref(false);
const keyword = ref("");
const list = ref([]);

function normalize(item) {
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

const filteredList = computed(() => {
  const q = keyword.value.toLowerCase();
  if (!q) return list.value;
  return list.value.filter((item) => {
    const text = `${item.name} ${item.info} ${item.category} ${item.tags} ${item.author}`.toLowerCase();
    return text.includes(q);
  });
});

async function fetchData() {
  if (!ensureLogin()) return;
  loading.value = true;
  try {
    const user = getUser();
    const res = await productApi.getList(user?.id || null);
    const raw = Array.isArray(res?.data?.list) ? res.data.list : [];
    list.value = raw.map(normalize);
  } catch (error) {
    uni.showToast({ title: error.message || "加载失败", icon: "none" });
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function openDetail(id) {
  const user = getUser();
  if (!user?.id) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` });
}

onShow(() => {
  fetchData();
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
  color: #6e8098;
}
</style>
