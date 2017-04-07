<template>
    <div @click="$emit('click')" class="progress win-bar" :class="this.class">
        <div class="progress-bar progress-bar-success" role="progressbar" :style="winStyle()" :aria-valuenow="winValue()" aria-valuemin="0" aria-valuemax="100"><div v-if="showCounts">{{ wins }}</div></div>
        <div class="progress-bar progress-bar-danger" role="progressbar" :style="lossStyle()" :aria-valuenow="lossValue()" aria-valuemin="0" aria-valuemax="100"><div v-if="showCounts">{{ losses }}</div></div>
    </div>
</template>

<script>
export default {
    props: ['wins', 'losses', 'matches', 'class', 'showCounts'],
    methods: {
        winValue()
        {
            return (this.wins / this.matches) * 100;
        },
        lossValue()
        {
            return (this.losses / this.matches) * 100;
        },
        winStyle()
        {
            return 'width: ' + this.winValue()  + '%';
        },
        lossStyle()
        {
            return 'width: ' + this.lossValue() + '%';
        },
    },
};
</script>

<style>
.win-bar .progress-bar-success div {
    text-align: right;
    padding: 0 .5em;
}
.win-bar .progress-bar-danger div {
    text-align: left;
    padding: 0 .5em;
}
</style>
