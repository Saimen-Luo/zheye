import { createStore } from 'vuex'

import { testColumns, testPosts, IColumn, IPost } from './testData'

interface IUser {
  isLogin: boolean,
  id?: number,
  name?: string,
  columnId?: number
}

export interface IGlobalData {
  columns: IColumn[],
  posts: IPost[],
  user: IUser
}

const store = createStore<IGlobalData>({
  state: {
    columns: testColumns,
    posts: testPosts,
    user: { isLogin: false, name: 'Luo', id: 1, columnId: 1 }
  },
  mutations: {
    login (state) {
      state.user = { ...state.user, isLogin: true, name: 'Luo' }
    },
    createPost (state, newPost) {
      state.posts.push(newPost)
    }
  },
  getters: {
    getColumnById (state) {
      // 返回函数
      return (id: number) => state.columns.find(c => c.id === id)
    },
    getPostsByCid (state) {
      return (cid: number) => state.posts.filter(p => p.columnId === cid)
    }
  }
})

export default store
