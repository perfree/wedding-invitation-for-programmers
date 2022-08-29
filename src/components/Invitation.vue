<template>
  <div class="wedding-invitation" :class="{ 'invitation-bounce':canOpen }">
    <div class="invitation-container" :class="{ 'invitation-down':isOpening }">
      <div class="invitation-cover">
        <div class="cover-content" :class="{'invitation-up':isOpening}">
          <div class="content-inside">
            <!-- <img class="content-inside-photo" src="https://www.bing.com/th?id=OHR.PeljesacWind_ZH-CN9299214248_1920x1080.jpg&rf=LaDigue_1920x1080.jpg"> -->
            <div class="wrapper" v-show="type === 1">
              <swiper :options="swiperOptions">
                <swiper-slide v-for="item in swiperList" :key="item.id">
                  <img class="swiper-img" :src="item.imgUrl" />
                </swiper-slide>
                <div class="swiper-pagination" slot="pagination"></div>
              </swiper>
            </div>
            <div class="videxBox" v-show="type === 2">
                <video width="100%" height="240" :src="videoUrl" controls loop id="video" preload="none"  x5-playsinline="true"
 playsinline="true" 
 webkit-playsinline="true" >
                    您的浏览器不支持 video 标签。
                </video>
            </div>
            <div v-html="desc"></div>
            <!-- <p>我们结婚啦！</p>
            <p><b>Jun & undefined</b></p>
            <p>时间：invalid date value</p>
            <p>地点：<b>location can not be found</b></p> -->
            <div class="content-inside-bless">
              <input
                placeholder="留下你的名字" 
                v-model="userName"
              >
               <input
                placeholder="写下你的祝福" 
                @keyup.enter="sendBarrage"
                @focus="isFocused = true"
                @blur="isFocused = false, hasEntered = false"
                v-model="wish"
                ref="wishInput"
              >
              <p v-if="showTip">请输入名字和祝福哦</p>
              <div>
                <button @click="sendBarrage">发送祝福弹幕</button>
                <button @click="closeInvitation">关闭</button>
              </div>
            </div>
          </div>
        </div>
        <div class="cover-inside-left" :class="{'opening':isOpening}"></div>
        <div class="cover-inside-right" :class="{'opening':isOpening}"></div>
        <img class="cover-inside-seal" src="../images/seal.png" @click="openInvitation" :class="{'invitation-flight':isOpening}">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['canOpen'],
  data() {
    return {
      desc: '',
      isOpening: false,
      wish: '',
      userName: '',
      musicType: '',
      type: 1,
      isFocused: false,
      videoUrl: '',
      showTip: false,
      hasEntered: false,
      articleId: '',
      commentEmail: '',
      swiperOptions: {
        pagination: ".swiper-pagination",
        loop: true,
        autoplay: 2000,
        autoplayDisableOnInteraction : false,
      },
      swiperList: [
       
      ]
    }
  },
  created() {
      this.getOptions()
  },
  methods: {
    getOptions() {
      this.$axios.get('/api/option/getKeys',{params:{keys:'W_TOP_TYPE,W_SWIPER_IMG,W_DESC,W_VIDEO_URL,W_ARTICLE_ID,W_COMMENT_EMAIL,W_MUSIC_PLAY_TYPE'}}).then(resp => {
        this.desc = resp.data.data.W_DESC;
        this.type = Number.parseInt(resp.data.data.W_TOP_TYPE);
        this.articleId = resp.data.data.W_ARTICLE_ID;
        this.commentEmail = resp.data.data.W_COMMENT_EMAIL;
        this.musicType = resp.data.data.W_MUSIC_PLAY_TYPE;
        if(this.type === 1) {
          let imgStr = resp.data.data.W_SWIPER_IMG.replaceAll('\n','');
          imgStr = imgStr.substring(0, imgStr.lastIndexOf(','));
          let imgArr = imgStr.split(',');
          for (let index = 0; index < imgArr.length; index++) {
            const element = imgArr[index];
            const imgInfo = {id: index, imgUrl: element};
            this.swiperList.push(imgInfo);
          }
        } 

        if (this.type === 2) {
          this.videoUrl = resp.data.data.W_VIDEO_URL;
        }
        
      });
    },
    // 打开邀请函
    openInvitation(){
      this.isOpening = true;
      if(this.type === 2) {
        document.getElementById('video').play();
      }
      if(this.musicType === '2'){
         document.getElementById('music').play();
      }
    },
    closeInvitation () {
      this.isOpening = false;
      if(this.type === 2) {
        document.getElementById('video').pause();
      }
      setTimeout(() => {
        this.$emit('onClose')
      }, 660)
    },
    // 发送弹幕
    sendBarrage(){
      this.$nextTick(() => {
         this.showTip = false;
        if(!this.wish || !this.userName || this.wish === '' || this.userName === '') {
          this.showTip = true;
          return;
        }
        const formData = new FormData();
        formData.append('articleId', this.articleId);
        formData.append('pid', '-1');
        formData.append('topPid', '-1');
        formData.append('userName', this.userName);
        formData.append('email', this.commentEmail);
        formData.append('content', this.wish);
        this.$axios({
          method:"post",
          url:"/api/comment/submitComment",
          headers:{
          'Content-type': 'application/x-www-form-urlencoded'
          },
          data: formData
        }).then((res)=>{
          if (res.data.code === 200) {
            this.isOpening = false;
            if(this.type === 2) {
              document.getElementById('video').pause();
            }
            this.$refs.wishInput.blur()
            setTimeout(() => {
              this.$emit('sendBarrage', this.userName + ': ' + this.wish)
            }, 660)
          }
        })
       
      })
    }
  }
}
</script>

<style lang="less">
  .wedding-invitation{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 30px 20px;
    padding-top: 60px;
    z-index: 4;
    transform: scale(0.05);
    -webkit-transform: scale(0.05);
    opacity: 0;
    transition: transform 0.8s cubic-bezier(.26,1.84,.39,.61), opacity 0.5s linear;
    -webkit-transition: -webkit-transform 0.8s cubic-bezier(.26,1.84,.39,.61), opacity 0.5s linear;
    background-size: 100%;
    overflow: hidden;
    &.invitation-bounce{
      opacity: 1;
      transform: scale(1);
      -webkit-transform: scale(1);
    }
    .invitation-container{
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 1, 1);
      -webkit-transition: -webkit-transform 0.6s cubic-bezier(0.4, 0, 1, 1);
      &.invitation-down{
        transform: translateY(20px);
        -webkit-transform: translateY(20px);
      }
      .invitation-cover{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #D65047;
        border-radius: 10px;
        perspective: 500px;
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.15);
        .cover-content{
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 10px 20px;
          transition: transform 0.6s cubic-bezier(0.4, 0, 1, 1);
          -webkit-transition: -webkit-transform 0.6s cubic-bezier(0.4, 0, 1, 1);
          &.invitation-up{
            transform: translateY(-60px);
            -webkit-transform: translateY(-60px);
          }
          .content-inside{
            height: 100%;
            padding: 20px;
            color: #a9895d;
            background-color: #FFF1DE;
            text-align: center;
            overflow: auto;
            .content-inside-photo{
              width: 100%;
              margin-bottom: 10px;
              padding: 5px;
              border: 1px solid #f7debb;
            }
            p{
              margin-top: 0;
              margin-bottom: 5px;
            }
            .content-inside-bless{
              input{
                width: 100%;
                height: 35px;
                margin-bottom: 10px;
                outline: none;
                border: none;
                border-bottom: 1px solid #f7debb;
                color: #a9895d;
                background: transparent;
                font-size: 16px;
                &::-webkit-input-placeholder { color: #E8D1B1;font-size: 12px; }
                &::-moz-placeholder { color: #E8D1B1;font-size: 12px; }
                &:-ms-input-placeholder { color: #E8D1B1;font-size: 12px; }
                &:-moz-placeholder { color: #E8D1B1;font-size: 12px; }
              }
              >div{
                display: flex;
                button{
                  width: 100%;
                  height: 35px;
                  color: #a9895d;
                  background: #f7debb;
                  border: none;
                  outline: none;
                  &:disabled{
                    opacity: 0.8;
                  }
                  &:first-child{
                    margin-right: 10px;
                    flex: 1;
                  }
                  &:last-child{
                    width: 60px;
                    border: 1px solid #f7debb;
                    background: transparent;
                  }
                }
              }
            }
          }
        }
        .cover-inside-left{
          position: absolute;
          left: 0;
          top: 0;
          width: 70%;
          height: 100%;
          border-radius: 10px;
          background-color: #D65047;
          box-shadow: 5px 0 10px rgba(0,0,0,0.2);
          z-index: 6;
          transition: transform 0.5s;
          -webkit-transition: -webkit-transform 0.5s;
          transform-origin: 0 50%;
          -webkit-transform-origin: 0 50%;
          &.opening{
            transform: rotate3d(0,1,0,-140deg);
            -webkit-transform: rotate3d(0,1,0,-140deg);
          }
        }
        .cover-inside-right{
          position: absolute;
          right: 0;
          top: 0;
          width: 40%;
          height: 100%;
          border-radius: 10px;
          background-color: #D65047;
          box-shadow: -5px 0 10px rgba(0,0,0,0.2);
          z-index: 5;
          transition: transform 0.5s;
          -webkit-transition: -webkit-transform 0.5s;
          transform-origin: 100% 50%;
          -webkit-transform-origin: 100% 50%;
          &.opening{
            transform: rotate3d(0,1,0,140deg);
            -webkit-transform: rotate3d(0,1,0,140deg);
          }
        }
        .cover-inside-seal{
          position: absolute;
          left: 70%;
          bottom: 100px;
          width: 80px;
          height: 80px;
          margin-left: -40px;
          z-index: 7;
          transform-origin: 50% 50%;
          -webkit-transform-origin: 50% 50%;
          transition: all 0.8s cubic-bezier(0.4, 0, 1, 1);
          -webkit-transition: all 0.8s cubic-bezier(0.4, 0, 1, 1);
          &.invitation-flight{
            opacity: 0;
          }
        }
      }
    }
  }
</style>
