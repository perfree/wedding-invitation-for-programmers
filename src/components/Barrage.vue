<template>
  <div class="wedding-barrage" ref="barrage" :style="{opacity: canStart ? 1 : 0}">
    <div v-html="codeInStyleTag"></div>
    <p class="code barrage-0" ref="barrageFirst" :style="{transform:'translate('+initialOffset+'px)',top:'10px'}">
      <span class="mine">{{ wish }}</span>
      <span v-for="(item, index) in filterBarrage(barrages, 0)" :key="index">{{ item }}</span>
    </p>
    <p class="code barrage-1" ref="barrageSecond" :style="{transform:'translate('+initialOffset+'px)',top:'40px'}">
      <span v-for="(item, index) in filterBarrage(barrages, 1)" :key="index">{{ item }}</span>
    </p>
    <p class="code barrage-2" ref="barrageThird" :style="{transform:'translate('+initialOffset+'px)',top:'70px'}">
      <span v-for="(item, index) in filterBarrage(barrages, 2)" :key="index">{{ item }}</span>
    </p>
    <p class="code barrage-3" ref="barrageFourth" :style="{transform:'translate('+initialOffset+'px)',top:'100px'}">
      <span v-for="(item, index) in filterBarrage(barrages, 3)" :key="index">{{ item }}</span>
    </p>
    <div class="barrage-space"></div>
  </div>
</template>

<script>
  export default {
    props: ['wish', 'canStart'],
    data(){
      return {
        barrages: [],
        animationStyle:'',
        initialOffset: 0
      }
    },
     created() {
      this.getOptions()
      
    },
    computed: {
      codeInStyleTag: function () {
        return `<style>${this.animationStyle}</style>`
      }
    },
    watch: {
      canStart: function (val) {
        if (val===true) {
          this.barrageAnimationStart()
        }
      }
    },
    methods: {
      getOptions() {
        this.$axios.get('/api/option/getKeys',{params:{keys:'W_ARTICLE_ID'}}).then(resp => {
          this.$axios.post('/api/comment/getCommentByArticleId?articleId=' + resp.data.data.W_ARTICLE_ID + '&pageIndex=1&pageSize=99999').then(resp => {
            resp.data.data.forEach(element => {
              this.barrages.push( element.userName + ': ' + element.content);
            });
          });
        });
      },
      // 弹幕动画开始
      barrageAnimationStart() {
        let barrageWidth = this.getWidth(this.$refs.barrage)
        let barrageWidthGroup = [
              this.getWidth(this.$refs.barrageFirst),
              this.getWidth(this.$refs.barrageSecond),
              this.getWidth(this.$refs.barrageThird),
              this.getWidth(this.$refs.barrageFourth)
            ]
        this.initialOffset = barrageWidth + 15
        barrageWidthGroup.map((item,index) => {
          this.animationStyle += `
            .barrage-${index}{
              animation: barrage-${index} ${item/40}s linear infinite;
              -webkit-animation: barrage-${index} ${item/40}s linear infinite;
            }
            @keyframes barrage-${index} {
              from {
                transform:translate3d(${barrageWidth+15}px,0,0);
                -webkit-transform:translate3d(${barrageWidth+15}px,0,0);
              }
              to {
                transform:translate3d(-${item+15}px,0,0);
                -webkit-transform:translate3d(-${item+15}px,0,0);
              }
            }`
        })
      },
      getWidth(ref) {
        return window.getComputedStyle(ref,null).width.replace('px','') - 0
      },
      filterBarrage(barrages, remainder) {
        if(barrages){
          return barrages.filter((barrage, index) => {
            if(index%4 === remainder){
              return barrage
            }
          })
        }
      }
    }
  }
</script>

<style lang="less">
  .wedding-barrage{
    position: relative;
    p{
      position: absolute;
      padding: 5px 0;
      white-space:nowrap;
      span{
        padding: 0 15px;
        &.mine{
          color: #e6db74;
          padding: 4px 6px;
          border: 1px solid #e6db74;
        }
      }
    }
    .barrage-space{
      height: 180px;
    }
  }
</style>