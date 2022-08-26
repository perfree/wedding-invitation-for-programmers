import Vue from 'vue'
import Wedding from './Wedding.vue'
import axios from "axios";
import VueAwesomeSwiper from 'vue-awesome-swiper'

import 'swiper/dist/css/swiper.css'

Vue.use(VueAwesomeSwiper)
Vue.prototype.$axios = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(Wedding)
})