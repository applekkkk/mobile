<template>
  <view class="page-wrap">
    <view v-if="loading" class="loading-text">加载中...</view>

    <view v-else-if="!detail" class="card empty-card">
      <text>未找到数据</text>
    </view>

    <view v-else class="detail-wrap">
      <view class="card">
        <view class="head-row">
          <text class="title">{{ detail.name }}</text>
          <text class="price">{{ detail.price }} 积分</text>
        </view>
        <text class="info">{{ detail.info || "暂无描述" }}</text>
        <view class="meta-row">
          <text class="meta">{{ detail.category || "其他" }}</text>
          <text class="meta">{{ detail.author || "未知作者" }}</text>
          <text class="meta">{{ detail.sizeLabel || "-" }}</text>
        </view>
      </view>

      <view class="card">
        <text class="section-title">数据统计</text>
        <view v-if="summaryList.length === 0" class="empty-summary">暂无信息</view>
        <view v-else class="summary-list">
          <view v-for="item in summaryList" :key="`${item.key}-${item.value}`" class="summary-item">
            <text class="summary-key">{{ item.key }}</text>
            <text class="summary-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <button class="main-btn buy-btn" :disabled="buying || detail.purchased" :loading="buying" @click="handleBuy">
        {{ detail.purchased ? "已购买" : "购买数据" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { orderApi, productApi } from "../../services/api";
import { ensureLogin, getUser, updateUser } from "../../utils/auth";

const detail = ref(null);
const loading = ref(false);
const buying = ref(false);
const productId = ref(0);

const summaryList = computed(() => {
  const value = detail.value?.summary;
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
});

function normalize(item) {
  return {
    id: item.id,
    name: item.name || "",
    info: item.info || "",
    category: item.category || "其他",
    price: Number(item.price || 0),
    author: item.authorName || item.author_name || item.author || "",
    sizeLabel: item.sizeLabel || item.size_label || item.size || "-",
    purchased: Boolean(item.purchased),
    summary: item.summary
  };
}

function hasPurchased(productIdValue, orders) {
  return orders.some((item) => {
    const pid = Number(item?.productId || 0);
    const amount = Number(item?.amount || 0);
    return pid === Number(productIdValue) && amount < 0;
  });
}

async function refreshPurchasedStatus(userId) {
  if (!detail.value?.id || !userId) return;
  const res = await orderApi.getUserList(userId);
  const orders = Array.isArray(res?.data) ? res.data : [];
  detail.value.purchased = hasPurchased(detail.value.id, orders);
}

async function fetchDetail() {
  if (!ensureLogin() || !productId.value) return;
  loading.value = true;
  try {
    const user = getUser();
    const res = await productApi.getById(productId.value, user?.id || null);
    detail.value = normalize(res?.data || {});
    await refreshPurchasedStatus(user?.id || null);
  } catch (error) {
    detail.value = null;
    uni.showToast({ title: error.message || "加载失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

async function handleBuy() {
  if (!detail.value || buying.value) return;
  const user = getUser();
  if (!user?.id) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }

  buying.value = true;
  try {
    await refreshPurchasedStatus(user.id);
    if (detail.value.purchased) {
      uni.showToast({ title: "该数据已购买", icon: "none" });
      return;
    }

    const amount = -Math.abs(Number(detail.value.price || 0));
    const res = await orderApi.create({
      buyerId: user.id,
      productId: detail.value.id,
      productName: `购买数据: ${detail.value.name}`,
      amount
    });
    if (res?.code !== 200) throw new Error(res?.message || "购买失败");

    detail.value.purchased = true;
    updateUser({ points: Number(user.points || 0) + amount });
    uni.showToast({ title: "购买成功", icon: "success" });
  } catch (error) {
    uni.showToast({ title: error.message || "购买失败", icon: "none" });
  } finally {
    buying.value = false;
  }
}

onLoad((query) => {
  productId.value = Number(query?.id || 0);
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
  gap: 14rpx;
}
.title {
  flex: 1;
  color: #203451;
  font-size: 34rpx;
  font-weight: 700;
}
.price {
  color: #b27018;
  font-weight: 700;
}
.info {
  display: block;
  margin-top: 14rpx;
  color: #4f637f;
  line-height: 1.6;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}
.meta {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  color: #486285;
  background: #eef4fc;
  font-size: 24rpx;
}
.section-title {
  color: #22344f;
  font-size: 30rpx;
  font-weight: 600;
}
.summary-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.summary-item {
  display: flex;
  gap: 12rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #edf2fa;
}
.summary-key {
  color: #627792;
  width: 180rpx;
  flex-shrink: 0;
}
.summary-value {
  color: #2e4461;
}
.buy-btn {
  margin-top: 6rpx;
}
.loading-text,
.empty-card,
.empty-summary {
  text-align: center;
  color: #70839a;
}
</style>
