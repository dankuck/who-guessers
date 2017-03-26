

Vue.component('championship', require('./components/Championship.vue'));
Vue.component('win-bar', require('./components/WinBar.vue'));
Vue.component('strategy-editor', require('./components/StrategyEditor.vue'));

const app = new Vue({
    el: '#game'
});

