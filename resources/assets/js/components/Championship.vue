<template>
    <div>    
        <h3>Choose the Contestants</h3>
        <div v-for="(strategy, name) in strategies">
            <input type="checkbox" v-model="chosen" :value="name" :id="name" />
            <label :for="name">{{ name }}</label>
            <a href="javascript:void(0);"><i v-if="strategyCode[name]" class="fa fa-pencil-square-o" aria-hidden="true" @click="editStrategy(name)"></i></a>
        </div>
        <button v-if="!running" @click="run">{{ championship ? 'Re-do Championship!' : 'Begin Championship!' }}</button>
        <button v-else @click="stop">Stop Championship</button>
        <button @click="addStrategy">+ Strategy</button>

        <div v-if="report">
            <div>Matches: {{ report.matches }} / 100
                <win-bar
                    :wins="typeof report.progress == 'undefined' ? 1 : report.progress"
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
        <strategy-editor 
            v-if="editingStrategy" 
            :code="editingStrategy" 
            @save="saveStrategy"
            @cancel="cancelStrategyEdit"
        ></strategy-editor>
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
            running: false,
            strategies: strategyMap,
            chosen: Object.keys(strategyMap),
            report: null,
            unfoldedStrategy: null,
            REASON_CORRECT_ANSWER: ChampionshipMatch.REASON_CORRECT_ANSWER,
            REASON_INCORRECT_ANSWER: ChampionshipMatch.REASON_INCORRECT_ANSWER,
            editingStrategy: null,
            editingStrategyName: null,
            strategyCode: {},
            reportSetter: null,
            lastReportSet: null,
        };
    },
    computed: {
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
        chosenStrategies()
        {
            return this.chosen.map(name => this.strategies[name]);
        },
        run() {
            if (this.championship) {
                this.championship.stop();
            }
            this.report = null;
            this.championship = new Championship(
                this.chosenStrategies(),
                ClassicWhos,
                100
            );
            this.running = true;
            this.championship
                .onProgress(report => {
                    this.setReport(report);
                    console.log('onProgress', report);
                })
                .onDone(report => {
                    this.setReport(report);
                    this.running = false;
                    console.log('onDone', report);
                })
                .run();
        },
        setReport(report)
        {
            // an attempt to strike a balance between showing new data and keeping things fast
            if (this.reportSetter) {
                // we have a new report, ignore the old one
                clearTimeout(this.reportSetter);
                this.reportSetter = null;
            }
            var setReport = () => {
                this.report = report;
                this.lastReportSet = new Date();
            }   
            if (!this.lastReportSet || new Date().valueOf() - this.lastReportSet.valueOf() > 250) {
                // it's been a long time, lets just set it
                setReport();
            } else {
                // we can afford to wait a few milliseconds
                this.reportSetter = setTimeout(setReport, 100);
            }
        },
        stop()
        {
            if (this.championship) {
                this.championship.stop();
                this.championship = null;
            }
            this.running = false;
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
            this.editingStrategyName = null;
            this.editingStrategy = "class Custom\n{\n\n    move(me, other, log){\n        \n    }\n\n}\nmodule.exports = Custom;\n";
        },
        editStrategy(name)
        {
            this.editingStrategyName = name;
            this.editingStrategy = this.strategyCode[name];
        },
        saveStrategy(code)
        {
            var strategy = this.evalStrategy(code);
            this.strategies[strategy.name] = strategy;
            this.strategyCode[strategy.name] = code;
            if (strategy.name !== this.editingStrategyName) {
                // oh a new one
                this.chosen.push(strategy.name);
            }
            Vue.nextTick(() => {
                this.editingStrategyName = null;
                this.editingStrategy = null;
            });
        },
        cancelStrategyEdit()
        {
            Vue.nextTick(() => {
                this.editingStrategyName = null;
                this.editingStrategy = null;
            });
        },
        evalStrategy(code)
        {
            return (function() {
                var module = {};
                var exports = {};
                module.exports = exports;
                eval(code);
                return module.exports;
            })();
        },
    },
}
</script>
