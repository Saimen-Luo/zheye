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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import PostList from '../components/PostList.vue'
import { IGlobalData, IColumn } from '../store'
import { generateFitUrl } from '../Helper'

export default defineComponent({
  name: 'ColumnDetail',
  components: {
    PostList
  },
  setup () {
    const route = useRoute()
    const store = useStore<IGlobalData>()
    const currentId = route.params.id
    const column = computed<IColumn>(() => {
      const selectColumn = store.getters.getColumnById(currentId)
      if (selectColumn) {
        generateFitUrl(selectColumn, 100, 100)
      }
      return selectColumn
    })
    const posts = computed(() => store.getters.getPostsByCid(currentId))
    onMounted(() => {
      store.dispatch('fetchPosts', currentId)
    })
    return {
      column,
      posts
    }
  }
})
</script>
