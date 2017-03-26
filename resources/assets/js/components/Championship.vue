<template>
    <div>    
        <h3>Choose the Contestants</h3>
        <ul>
            <li v-for="(strategy, name) in strategies">
                <input type="checkbox" v-model="chosen" :value="name" /> {{ name }}
            </li>
        </ul>
        <button @click="run">{{ championship ? 'Re-do Championship!' : 'Begin Championship!' }}</button>
        <button @click="addStrategy">+ Strategy</button>

        <div v-if="report">
            <div>Matches: {{ report.matches }}
                <span v-if="report.progress">
                    {{ Math.floor(report.progress * 100) }}%
                </span>
                <win-bar
                    :wins="report.progress || 1"
                    :losses="0"
                    :matches="1"
                ></win-bar>
            </div>
            <div v-for="stats in strategyStats" class="container">
                {{ stats.name }} 
                <win-bar 
                    :wins="stats.wins" 
                    :losses="stats.losses_against_others" 
                    :matches="100" 
                    @click="toggleUnfold(stats.name)"
                ></win-bar>
                <div v-if="unfoldedStrategy === stats.name" class="container">
                    <div>Matches: {{ stats.matches }} / 100</div>
                    <div>Wins: {{ stats.wins }} / {{ stats.matches}}</div>
                    <div>Losses: {{ stats.losses_against_others }} / {{ stats.matches }}</div>
                    <div>
                        Against:
                        <div class="container" v-for="competitor in stats.competitors">
                            <div>{{ competitor.name }}</div>
                            <win-bar
                                :wins="competitor.wins_against"
                                :losses="competitor.is_self ? 0 : competitor.losses_against"
                                :matches="competitor.matches"
                            ></win-bar>
                            <div class="container">
                                <div class="col-sm-5">
                                    {{ stats.name }} won by answering correctly:
                                    <win-bar
                                        :wins="competitor.win_reasons[REASON_CORRECT_ANSWER]"
                                        :losses="0"
                                        :matches="competitor.matches"
                                    ></win-bar>
                                </div>
                                <div class="col-sm-5">
                                    {{ stats.name }} won when {{ competitor.is_self ? 'opponent' : competitor.name }} answered incorrectly:
                                    <win-bar
                                        :wins="competitor.win_reasons[REASON_INCORRECT_ANSWER]"
                                        :losses="0"
                                        :matches="competitor.matches"
                                    ></win-bar>
                                </div>
                            </div>
                            <div class="container">
                                <div class="col-sm-5">
                                    {{ stats.name }} lost by answering incorrectly:
                                    <win-bar
                                        :losses="competitor.loss_reasons[REASON_INCORRECT_ANSWER]"
                                        :wins="0"
                                        :matches="competitor.matches"
                                    ></win-bar>
                                </div>
                                <div class="col-sm-5">
                                    {{ stats.name }} lost when {{ competitor.is_self ? 'opponent' : competitor.name }} answered correctly:
                                    <win-bar
                                        :losses="competitor.loss_reasons[REASON_CORRECT_ANSWER]"
                                        :wins="0"
                                        :matches="competitor.matches"
                                    ></win-bar>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <table>
                <tr>
                    <th>Strategy 1</th>
                    <th>Strategy 2</th>
                    <th>Winner</th>
                    <th>Details</th>
                </tr>
                <tr v-for="result in report.results">
                    <td :style="{'font-weight': result.winner === 0 ? 'bold' : ''}">{{ result.players[0].name }}</td>
                    <td :style="{'font-weight': result.winner === 1 ? 'bold' : ''}">{{ result.players[1].name }}</td>
                    <td>{{ result.winner === 0 ? 'Strategy 1' : 'Strategy 2' }}</td>
                    <td>...</td>
                </tr>
            </table>
        </div>
        <strategy-editor v-if="editStrategy" :code="editStrategy" @save="saveStrategy"></strategy-editor>
    </div>
</template>

<script>
import Championship from '../Championship.js';
import ChampionshipMatch from '../ChampionshipMatch.js';
import ClassicWhos from '../ClassicWhos.js';
import ChampionshipReportProcessor from '../ChampionshipReportProcessor.js';
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
            unfoldedStrategy: null,
            REASON_CORRECT_ANSWER: ChampionshipMatch.REASON_CORRECT_ANSWER,
            REASON_INCORRECT_ANSWER: ChampionshipMatch.REASON_INCORRECT_ANSWER,
            editStrategy: null,
        };
    },
    computed: {
        chosenStrategies()
        {
            return this.chosen.map(name => this.strategies[name]);
        },
        strategyStats()
        {
            if (!this.report) {
                return null;
            }
            return Object.values(new ChampionshipReportProcessor(this.report).stats)
                .sort((a, b) => {
                    if (a.wins < b.wins) {
                        return -1;
                    } else if (a.wins > b.wins) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
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
                    this.report = report;
                    console.log('onProgress', report);
                })
                .onDone(results => {
                    this.report = results;
                    console.log('onDone', results);
                })
                .run();
        },
        toggleUnfold(name)
        {
            if (name === this.unfoldedStrategy) {
                this.unfoldedStrategy = null;
            } else {
                this.unfoldedStrategy = name;
            }
        },
        addStrategy()
        {
            this.editStrategy = "class Custom {\n\n    test(){\n    \n}\n\n}\nmodule.exports = Custom;\n";
        },
        saveStrategy()
        {
            Vue.nextTick(() => {
                this.editStrategy = null;
            });
        },
    },
}
</script>
