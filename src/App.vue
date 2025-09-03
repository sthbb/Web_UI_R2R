<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>


    export default {
        name: 'App',
        methods: {
            test() {
                this.$msg.sendApiError('123456')
            }
        },
        mounted() {
            this.$msg.listenApiError(function (t, e) {
            })
        }
    }
</script>