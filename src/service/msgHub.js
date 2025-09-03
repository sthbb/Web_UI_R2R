/**
 *
 *   消息中心.帮助转发订阅消息
 *
 */

import PubSub from 'pubsub-js'


export default {
    topic: {
        apiError: "apiError"
    },
    sendApiError(e) {
        PubSub.publish(this.topic.apiError, e)
        //console.log('send:', this.topic.apiError, e)
    },
    listenApiError(cb) {
        PubSub.subscribe(this.topic.apiError, cb)
        //console.log('listen:', this.topic.apiError, cb)
    }
}