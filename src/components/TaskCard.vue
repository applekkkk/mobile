<template>
  <view class="card task-card" @click="onOpen">
    <view class="head-row">
      <view class="title-wrap">
        <text class="title">{{ item.title || "-" }}</text>
        <view class="chip-row">
          <text class="chip">{{ item.category || "其他" }}</text>
          <text v-if="firstTag" class="chip">{{ firstTag }}</text>
        </view>
      </view>
      <view class="points-badge">
        <text class="points-value">{{ item.budget || 0 }}</text>
        <text class="points-label">积分</text>
      </view>
    </view>

    <text class="desc">{{ item.description || "暂无描述" }}</text>

    <view class="meta-row">
      <text class="meta">发布者：{{ item.publisher || "普通用户" }}</text>
      <text class="meta" v-if="item.deadline">截止：{{ item.deadline }}</text>
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

const firstTag = computed(() => {
  const tags = String(props.item?.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags[0] || "";
});

function onOpen() {
  emit("open", props.item);
}
</script>

<style scoped>
.task-card {
  margin-bottom: 14rpx;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.chip {
  padding: 6rpx 16rpx;
  border-radius: 14rpx;
  border: 1rpx solid #d9e2ef;
  color: #49617f;
  background: #f8fbff;
  font-size: 24rpx;
}

.head-row {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  align-items: flex-start;
}

.title-wrap {
  flex: 1;
}

.title {
  display: block;
  color: #1f314d;
  font-size: 34rpx;
  font-weight: 600;
}

.points-badge {
  min-width: 118rpx;
  border-radius: 14rpx;
  background: linear-gradient(140deg, #fff6e5, #ffe5b9);
  text-align: center;
  padding: 8rpx 10rpx;
}

.chip-row {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.points-value {
  display: block;
  color: #aa6514;
  font-size: 30rpx;
  font-weight: 700;
}

.points-label {
  color: #8f5b20;
  font-size: 20rpx;
}

.desc {
  display: block;
  margin-top: 12rpx;
  color: #5e7190;
  line-height: 1.6;
}

.meta-row {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.meta {
  color: #60738e;
  font-size: 24rpx;
}
</style>
