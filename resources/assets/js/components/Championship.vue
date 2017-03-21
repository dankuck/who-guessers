<template>
    <div>    
        <button @click="run">Begin Championship!</button>

        <div v-if="championship">

        </div>
    </div>
</template>

<script>
import Championship from '../Championship.js';
import SayAnything from '../strategies/SayAnything.js';

export default {
    data() {
        return {
            championship: null,
        };
    },
    methods: {
        run() {
            this.championship = new Championship([
                {name: 'SayAnything', class: SayAnything},
            ]);
            this.championship.run();
        },
    },
}
</script>
