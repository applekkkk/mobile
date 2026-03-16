<template>
  <view class="card dataset-card" @click="onOpen">
    <text class="title">{{ item.name || "-" }}</text>
    <view class="chip-row">
      <text class="chip">{{ item.category || "其他" }}</text>
      <text v-for="tag in tags" :key="tag" class="chip">{{ tag }}</text>
    </view>
    <text class="desc">{{ item.info || "暂无描述" }}</text>

    <view class="meta-row">
      <text class="meta">{{ item.author || "普通用户" }}</text>
      <text class="divider">|</text>
      <text class="meta">{{ item.uploadDate || "-" }} 上传</text>
      <text class="divider">|</text>
      <text class="meta">{{ item.sizeLabel || item.size || "-" }}</text>
      <text class="divider">|</text>
      <text class="meta price">{{ item.price || 0 }} 积分</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["open"]);

const tags = computed(() =>
  String(props.item?.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
);

function onOpen() {
  emit("open", props.item);
}
</script>

<style scoped>
.dataset-card {
  margin-bottom: 14rpx;
}

.chip {
  padding: 6rpx 16rpx;
  border-radius: 14rpx;
  border: 1rpx solid #d9e2ef;
  color: #49617f;
  background: #f8fbff;
  font-size: 24rpx;
}

.title {
  display: block;
  color: #1f314d;
  font-size: 34rpx;
  font-weight: 600;
}

.chip-row {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.desc {
  display: block;
  margin-top: 14rpx;
  color: #5e7190;
  line-height: 1.6;
}

.meta-row {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
}

.meta {
  color: #60738e;
  font-size: 24rpx;
}

.divider {
  color: #9bacbf;
  font-size: 24rpx;
}

.price {
  color: #2a527f;
  font-weight: 600;
}
</style>
