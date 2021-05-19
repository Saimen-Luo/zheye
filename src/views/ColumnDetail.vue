<template>
  <div class="column-detail-page w-75 mx-auto">
    <div
      class="column-info row mb-4 border-bottom pb-4 align-items-center"
      v-if="column"
    >
      <div class="col-3 text-center">
        <img
          :src="column.avatar && column.avatar.fitUrl"
          :alt="column.title"
          class="rounded-circle border w-100"
        />
      </div>
      <div class="col-9">
        <h4>{{ column.title }}</h4>
        <p class="text-muted">{{ column.description }}</p>
      </div>
    </div>
    <post-list :list="posts" />
    <button
      class="btn btn-outline-primary mt-2 mb-5 mx-auto d-block w-25"
      @click="loadMore"
      v-if="!isLastPage"
    >
      加载更多
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import PostList from '../components/PostList.vue'
import { IGlobalData, IColumn } from '../store'
import { generateFitUrl } from '../Helper'
import useLoadMore from '@/hooks/useLoadMore'

export default defineComponent({
  name: 'ColumnDetail',
  components: {
    PostList
  },
  setup () {
    const route = useRoute()
    const store = useStore<IGlobalData>()
    const currentId = route.params.id as string
    const column = computed<IColumn>(() => {
      const selectColumn = store.getters.getColumnById(currentId)
      if (selectColumn) {
        generateFitUrl(selectColumn, 100, 100)
      }
      return selectColumn
    })
    const posts = computed(() => store.getters.getPostsByCid(currentId))
    const total = computed(() => {
      const currentLoadcolumn = store.state.posts.loadedColumns[currentId]
      if (currentLoadcolumn) {
        return currentLoadcolumn.total
      }
      return 0
    })
    const currentPage = computed(() => {
      const currentLoadcolumn = store.state.posts.loadedColumns[currentId]
      if (currentLoadcolumn) {
        return currentLoadcolumn.currentPage
      }
      return 0
    })
    const { loadMore, isLastPage } = useLoadMore('fetchPosts', total, {
      currentPage: currentPage.value === 0 ? 2 : currentPage.value + 1,
      pageSize: 3,
      currentId
    })
    onMounted(() => {
      // needed when refresh on ColumnDetail
      store.dispatch('fetchColumn', currentId)
      store.dispatch('fetchPosts', {
        currentId,
        pageSize: 3
      })
    })
    return {
      column,
      posts,
      loadMore,
      isLastPage
    }
  }
})
</script>
