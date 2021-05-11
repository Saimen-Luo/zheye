import { createApp } from 'vue'
import Message from './Message.vue'

type MessageType = 'success' | 'error' | 'default'
const createMessage = (type: MessageType, message: string, timeout = 2000) => {
  const messageInstance = createApp(Message, {
    type,
    message
  })
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)
  messageInstance.mount(mountNode)
  setTimeout(() => {
    messageInstance.unmount()
    document.body.removeChild(mountNode)
  }, timeout)
}

export default createMessage
