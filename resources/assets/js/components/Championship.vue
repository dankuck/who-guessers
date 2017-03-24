<template>
    <div>    
        <h3>Choose the Contestants</h3>
        <ul>
            <li v-for="(strategy, name) in strategies">
                <input type="checkbox" v-model="chosen" :value="name" /> {{ name }}
            </li>
        </ul>
        <button @click="run">Begin Championship!</button>

        <div v-if="report">
            <div>Matches: {{ report.matches }}
                <span v-if="report.progress">
                    {{ Math.floor(report.progress * 100) }}%
                </span>
            </div>
            <table>
                <tr>
                    <th>Player 1</th>
                    <th>Player 2</th>
                    <th>Winner</th>
                    <th>Details</th>
                </tr>
                <tr v-for="result in report.results">
                    <td :style="{'font-weight': result.winner === 0 ? 'bold' : ''}">{{ result.players[0].name }}</td>
                    <td :style="{'font-weight': result.winner === 1 ? 'bold' : ''}">{{ result.players[1].name }}</td>
                    <td>{{ result.winner === 0 ? 'Player 1' : 'Player 2' }}</td>
                    <td>...</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import Championship from '../Championship.js';
import ClassicWhos from '../ClassicWhos.js';
var strategies = [
    require('../strategies/SayAnything.js'),
];

export default {
    data() {
        var strategyMap = {};
        strategies.map(strategy => strategyMap[strategy.name] = strategy);
        return {
            championship: null,
            strategies: strategyMap,
            chosen: Object.keys(strategyMap),
            report: null,
        };
    },
    computed: {
        chosenStrategies()
        {
            return this.chosen.map(name => this.strategies[name]);
        },
    },
    methods: {
        run() {
            if (this.championship) {
                this.championship.stop();
            }
            this.report = null;
            this.championship = new Championship(
                this.chosenStrategies,
                ClassicWhos,
                100
            );
            this.championship
                .onProgress(report => {
                    console.log('onProgress', report);
                })
                .onDone(results => {
                    this.report = results;
                    console.log('onDone', results);
                })
                .run();
        },
    },
}
</script>
