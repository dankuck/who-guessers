<template>
    <div @click="$emit('click')" class="progress" :class="this.class">
        <div class="progress-bar progress-bar-success" role="progressbar" :style="winStyle()" :aria-valuenow="winValue()" aria-valuemin="0" aria-valuemax="100"></div>
        <div class="progress-bar progress-bar-danger" role="progressbar" :style="lossStyle()" :aria-valuenow="lossValue()" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
</template>

<script>
export default {
    props: ['wins', 'losses', 'matches', 'class'],
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
