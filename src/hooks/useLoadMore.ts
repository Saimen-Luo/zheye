import { useStore } from 'vuex'
import { ref, computed, ComputedRef } from 'vue'

interface ILoadParams {
  currentId?: string,
  currentPage: number,
  pageSize: number
}

const useLoadMore = (actionName: string, total: ComputedRef, params: ILoadParams = { currentPage: 2, pageSize: 5 }) => {
  const store = useStore()
  const currentPage = ref(params.currentPage)
  const requestParams = computed(() => {
    if (params.currentId) {
      return {
        currentId: params.currentId,
        currentPage: currentPage.value,
        pageSize: params.pageSize
      }
    } else {
      return {
        currentPage: currentPage.value,
        pageSize: params.pageSize
      }
    }
  })
  const loadMore = () => {
    store.dispatch(actionName, requestParams.value).then(() => {
      currentPage.value++
    })
  }
  const isLastPage = computed(() => {
    return Math.ceil(total.value / params.pageSize) < currentPage.value
  })
  return {
    loadMore,
    isLastPage,
    currentPage
  }
}

export default useLoadMore
