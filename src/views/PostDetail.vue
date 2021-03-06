<template>
  <div class="post-detail-page">
    <Modal
      title="删除文章"
      :visible="modalVisible"
      @modal-on-close="modalVisible = false"
      @modal-on-confirm="hideAndDelete"
    >
      <p>确认要删除这篇文章吗？</p>
    </Modal>
    <article class="w-75 mx-auto mb-5 pb-3" v-if="currentPost">
      <img
        :src="currentImageUrl"
        alt="currentPost.title"
        class="rounded-lg img-fluid my-4"
        v-if="currentImageUrl"
      />
      <h2 class="mb-4">{{ currentPost.title }}</h2>
      <div
        class="user-profile-component border-top border-bottom py-3 mb-5 align-items-center row g-0"
      >
        <div class="col">
          <user-profile
            :user="currentPost.author"
            v-if="typeof currentPost.author === 'object'"
          ></user-profile>
        </div>
        <span class="text-muted col text-right font-italic"
          >发表于：{{ currentPost.createdAt }}</span
        >
      </div>
      <div v-html="currentHTML"></div>
      <div v-if="showEditArea" class="btn-group mt-5">
        <router-link
          :to="{ name: 'create', query: { id: currentPost._id } }"
          type="button"
          class="btn btn-success"
        >
          编辑
        </router-link>
        <button
          type="button"
          class="btn btn-danger"
          @click="modalVisible = true"
        >
          删除
        </button>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { IGlobalData, IPost, IImage, IUser, IResponse } from '../store'
import UserProfile from '../components/UserProfile.vue'
import Modal from '../components/Modal.vue'
import createMessage from '@/components/createMessage'

export default defineComponent({
  name: 'post-detail',
  components: {
    UserProfile,
    Modal
  },
  setup () {
    const modalVisible = ref(false)
    const store = useStore<IGlobalData>()
    const route = useRoute()
    const router = useRouter()
    const currentId = route.params.id
    const md = new MarkdownIt({
      html: true
    })
    onMounted(() => {
      store.dispatch('fetchPost', currentId)
    })
    const currentPost = computed<IPost>(() => store.getters.getCurrentPost(currentId))
    const currentHTML = computed(() => {
      if (currentPost.value && currentPost.value.content) {
        return md.render(currentPost.value.content)
      }
      return ''
    })
    const currentImageUrl = computed(() => {
      if (currentPost.value && currentPost.value.image) {
        const { image } = currentPost.value
        return (image as IImage).url + '?x-oss-process=image/resize,w_850'
      } else {
        return null
      }
    })
    // 是否显示编辑区域
    const showEditArea = computed(() => {
      const { isLogin, _id } = store.state.user
      if (currentPost.value && currentPost.value.author && isLogin) {
        const postAuthour = currentPost.value.author as IUser
        return postAuthour._id === _id
      }
      return false
    })
    const hideAndDelete = () => {
      modalVisible.value = false
      store.dispatch('deletePost', currentId).then((rawDate: IResponse<IPost>) => {
        const timeout = 1000
        createMessage('success', '删除成功，跳转到专栏首页...')
        setTimeout(() => {
          router.push({ name: 'column', params: { id: rawDate.data.column } })
        }, timeout)
      })
    }
    return {
      currentPost,
      currentImageUrl,
      currentHTML,
      showEditArea,
      modalVisible,
      hideAndDelete
    }
  }
})
</script>
