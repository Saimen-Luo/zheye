import { createStore } from 'vuex'
import axios from 'axios'
export interface IUser {
  isLogin: boolean,
  id?: number,
  name?: string,
  columnId?: number
}

interface IImage {
  _id?: string,
  url?: string,
  createdAt?: string
}

export interface IColumn {
  _id: string;
  title: string;
  avatar?: IImage;
  description: string;
}
export interface IPost {
  _id: number;
  title: string;
  excerpt?: string,
  content?: string;
  image?: IImage;
  createdAt: string;
  column: string;
}
export interface IGlobalData {
  columns: IColumn[],
  posts: IPost[],
  user: IUser
}

const store = createStore<IGlobalData>({
  state: {
    columns: [],
    posts: [],
    user: { isLogin: true, name: 'Luo', id: 1, columnId: 1 }
  },
  mutations: {
    login (state) {
      state.user = { ...state.user, isLogin: true, name: 'Luo' }
    },
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    fetchColumns (state, rawData) {
      state.columns = rawData.data.list
    },
    fetchColumn (state, rawData) {
      state.columns = [rawData.data]
    },
    fetchPosts (state, rawData) {
      state.posts = rawData.data.list
    }
  },
  actions: {
    async fetchColumns ({ commit }) {
      const { data } = await axios.get('/columns')
      commit('fetchColumns', data)
    },
    async fetchColumn ({ commit }, cid) {
      const { data } = await axios.get(`/columns/${cid}`)
      commit('fetchColumn', data)
    },
    async fetchPosts ({ commit }, cid) {
      const { data } = await axios.get(`/columns/${cid}/posts`)
      commit('fetchPosts', data)
    }
  },
  getters: {
    getColumnById (state) {
      // 返回函数
      return (id: string) => state.columns.find(c => c._id === id)
    },
    getPostsByCid (state) {
      return (cid: string) => state.posts.filter(p => p.column === cid)
    }
  }
})

export default store
