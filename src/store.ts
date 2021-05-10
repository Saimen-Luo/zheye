import { createStore, Commit } from 'vuex'
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
  token: string,
  loading: boolean,
  columns: IColumn[],
  posts: IPost[],
  user: IUser
}

const getAndCommit = async (url: string, mutationName: string, commit: Commit) => {
  const { data } = await axios.get(url)
  commit(mutationName, data)
}

const postAndCommit = async (url: string, mutationName: string, commit: Commit, payload: any) => {
  const { data } = await axios.post(url, payload)
  commit(mutationName, data)
  return data
}

const store = createStore<IGlobalData>({
  state: {
    token: '',
    loading: false,
    columns: [],
    posts: [],
    user: { isLogin: false, name: 'Luo', id: 1, columnId: 1 }
  },
  mutations: {
    // login (state) {
    //   state.user = { ...state.user, isLogin: true, name: 'Luo' }
    // },
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
    },
    setLoading (state, status) {
      state.loading = status
    },
    login (state, rawData) {
      state.token = rawData.data.token
    }
  },
  actions: {
    fetchColumns ({ commit }) {
      getAndCommit('/columns', 'fetchColumns', commit)
    },
    fetchColumn ({ commit }, cid) {
      getAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
    },
    fetchPosts ({ commit }, cid) {
      getAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit)
    },
    login ({ commit }, payload) {
      return postAndCommit('/user/login', 'login', commit, payload)
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
