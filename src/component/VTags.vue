<template>
    <div class="tags" v-if="showTags">
        <div class="menu-box">
            <el-button class="tags-li" v-for="(item,index) in tagsList" :type="isActive(item.path) ? 'primary' : 'default'" :key="index">
                <router-link :to="item.path">
                    {{$t(item.title)}}
                </router-link>
                <span @click="closeTags(index)"><i class="el-icon-close"></i></span>
            </el-button>
        </div>
        <div class="tags-close-box" :style="{background:$root.theme}">
            <el-dropdown @command="handleTags">
                <el-button size="mini" type="primary">
                    {{$t('v_master_page_tag_config')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu size="small" slot="dropdown">
                    <el-dropdown-item command="other">{{$t('v_master_page_tag_clossother')}}</el-dropdown-item>
                    <el-dropdown-item command="all">{{$t('v_master_page_tag_closeall')}}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
    export default {
        name: "VTags",
        data() {
            return {
                tagsList: []
            }
        },
        methods: {
            isActive(path) {
                return path === this.$route.fullPath
            },
            // 关闭单个标签
            closeTags(index) {
                const delItem = this.tagsList[index]
                this.tagsList.splice(index,1)
                const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1]
                if (item) {
                    this.$route.fullPath === delItem.path && this.$router.push(item.path)
                } else {
                    this.$router.push('/')
                }
            },
            // 关闭全部标签
            closeAll() {
                this.tagsList = []
                this.$router.push('/')
            },
            // 关闭其他标签
            closeOther() {
                const curItem = this.tagsList.filter(item => {
                    return this.$route.fullPath === item.path
                })
                this.tagsList = curItem
            },
            // 设置标签
            setTags(route) {
                const isExist = this.tagsList.some(item => {
                    return route.fullPath === item.path
                })
                if (!isExist) {
                    if (this.tagsList.length >= 8) {
                        this.tagsList.shift()
                    }
                    this.tagsList.push({
                        title: route.meta.title,
                        path: route.fullPath,
                        name: route.matched[1].components.default.name
                    })
                }
                /*bus.$emit('tags', this.tagsList)*/
            },
            handleTags(command) {
                command === 'other' ? this.closeOther() : this.closeAll()
            }
        },
        computed: {
            showTags() {
                return this.tagsList.length > 0
            }
        },
        watch: {
            $route(newValue, oldValue) {
                newValue.path !== oldValue.path && this.setTags(newValue)
            }
        },
        created() {
            this.setTags(this.$route)
            // 监听关闭当前页面的标签页
            /* bus.$on('close_current_tags', () => {
                 for (let i = 0, len = this.tagsList.length; i < len; i++) {
                     const item = this.tagsList[i]
                     if (item.path === this.$route.fullPath) {
                         if (i < len - 1) {
                             this.$router.push(this.tagsList[i + 1].path)
                         } else if (i > 0) {
                             this.$router.push(this.tagsList[i - 1].path)
                         } else {
                             this.$router.push('/')
                         }
                         this.tagsList.splice(i, 1)
                     }
                 }
             })*/
        }
    }
</script>

<style scoped lang="scss">
    .tags {
        background: #fff;
        box-shadow:0px 1px 11px rgba(33, 83, 135, 0.16);
        display: flex;
        justify-content: space-between;
        padding: 6px 12px;
    }

    .tags .menu-box {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        overflow-x: auto;
    }

    .tags-close-box {
        border-radius:2px;
        margin-left: 10px;
        .el-button{
            color: #fff;
            border-color: transparent !important;
            background-color: transparent !important;
        }
    }

</style>