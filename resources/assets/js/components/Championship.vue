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
import Whos from '../Whos.js';

export default {
    data() {
        return {
            championship: null,
        };
    },
    methods: {
        run() {
            if (this.championship) {
                this.championship.stop();
            }
            this.championship = new Championship(
                [
                    SayAnything,
                ],
                Whos,
                100
            );
            this.championship
                .onProgress(report => {
                    console.log('onProgress', report);
                })
                .onDone(results => {
                    console.log('onDone', results);
                })
                .run();
        },
    },
}
</script>
