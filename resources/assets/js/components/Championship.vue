<template>
    <div>   
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Choose the Strategies to Compete</h3>
            </div>
            <div class="panel-body"> 
                <div v-for="(strategy, name) in strategies">
                    <input type="checkbox" v-model="chosen" :value="name" :id="name" />
                    <label :for="name">{{ name }}</label>
                    <a href="javascript:void(0);" @click="editStrategy(name)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
                </div>
                <button v-if="!running" @click="run" type="button" class="btn btn-default btn-lg">{{ championship ? 'Re-do Championship!' : 'Begin Championship!' }}</button>
                <button v-else @click="stop" type="button" class="btn btn-default btn-lg">Stop Championship</button>
                <button @click="addStrategy" type="button" class="btn btn-default btn-lg">New Strategy</button>
            </div>
        </div>

        <div v-if="report">
            <div>Rounds: {{ report.rounds }} / 100
                <win-bar
                    :wins="typeof report.progress == 'undefined' ? 1 : report.progress"
                    :losses="0"
                    :matches="1"
                ></win-bar>
            </div>
            <div v-for="stats in strategyStats" class="container">
                {{ stats.name }} | {{ strategies[stats.name].description }}
                <win-bar 
                    class="pointer"
                    :wins="stats.wins" 
                    :losses="stats.losses_against_others" 
                    :matches="stats.matches" 
                    @click="toggleUnfold(stats.name)"
                ></win-bar>
                <div v-if="unfoldedStrategy === stats.name" class="container">
                    <div class="row">
                        <ul class="list-group col-sm-2">
                            <li class="list-group-item">
                                <span class="badge">{{ stats.matches }}</span>
                                Matches
                            </li>
                            <li class="list-group-item">
                                <span class="badge">{{ stats.wins }}</span>
                                Wins
                            </li>
                            <li class="list-group-item">
                                <span class="badge">{{ stats.losses_against_others }}</span>
                                Losses
                            </li>
                        </ul>
                    </div>
                    <div class="row">
                        <div class="panel panel-default" v-for="competitor in stats.competitors">
                            <div class="panel-heading">
                                <h3 class="panel-title">{{ stats.name }} vs. {{ competitor.name }}</h3>
                            </div>
                            <div class="panel-body">
                                <div>{{ strategies[stats.name].description }}</div>
                                <div>vs. {{ strategies[competitor.name].description }}</div>
                                <div>Matches: {{ competitor.matches }}</div>
                                <win-bar
                                    :wins="competitor.wins_against"
                                    :losses="competitor.is_self ? 0 : competitor.losses_against"
                                    :matches="competitor.matches"
                                ></win-bar>
                                <div class="container">
                                    <div class="col-sm-5">
                                        {{ stats.name }} won by answering correctly:
                                        <win-bar
                                            class="pointer"
                                            :wins="competitor.win_reasons[REASON_CORRECT_ANSWER]"
                                            :losses="0"
                                            :matches="competitor.matches"
                                            @click="showLogs(stats.name + ' won by answering correctly', competitor.win_logs[REASON_CORRECT_ANSWER])"
                                        ></win-bar>
                                    </div>
                                    <div class="col-sm-5">
                                        {{ stats.name }} won when {{ competitor.is_self ? 'opponent' : competitor.name }} answered incorrectly:
                                        <win-bar
                                            class="pointer"
                                            :wins="competitor.win_reasons[REASON_INCORRECT_ANSWER]"
                                            :losses="0"
                                            :matches="competitor.matches"
                                            @click="showLogs(stats.name + ' won when ' + (competitor.is_self ? 'opponent' : competitor.name) + ' answered incorrectly', competitor.win_logs[REASON_INCORRECT_ANSWER])"
                                        ></win-bar>
                                    </div>
                                </div>
                                <div class="container">
                                    <div class="col-sm-5">
                                        {{ stats.name }} lost by answering incorrectly:
                                        <win-bar
                                            class="pointer"
                                            :losses="competitor.loss_reasons[REASON_INCORRECT_ANSWER]"
                                            :wins="0"
                                            :matches="competitor.matches"
                                            @click="showLogs(stats.name + ' lost by answering incorrectly', competitor.loss_logs[REASON_INCORRECT_ANSWER])"
                                        ></win-bar>
                                    </div>
                                    <div class="col-sm-5">
                                        {{ stats.name }} lost when {{ competitor.is_self ? 'opponent' : competitor.name }} answered correctly:
                                        <win-bar
                                            class="pointer"
                                            :losses="competitor.loss_reasons[REASON_CORRECT_ANSWER]"
                                            :wins="0"
                                            :matches="competitor.matches"
                                            @click="showLogs(stats.name + ' lost when ' + (competitor.is_self ? 'opponent' : competitor.name) + ' answered correctly', competitor.loss_logs[REASON_CORRECT_ANSWER])"
                                        ></win-bar>
                                    </div>
                                </div>
                                <div class="container" v-if="competitor.loss_reasons[REASON_EXCEPTION_DEFAULT]">
                                    <div class="col-sm-5">
                                        {{ stats.name }} lost when it threw an exception:
                                        <win-bar
                                            class="pointer"
                                            :losses="competitor.loss_reasons[REASON_EXCEPTION_DEFAULT]"
                                            :wins="0"
                                            :matches="competitor.matches"
                                            @click="showLogs(stats.name + ' lost when it threw an exception', competitor.loss_logs[REASON_EXCEPTION_DEFAULT])"
                                        ></win-bar>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <strategy-editor 
            v-if="editingStrategy" 
            :code="editingStrategy" 
            @save="saveStrategy"
            @close="closeStrategyEdit"
        ></strategy-editor>
        <logs-viewer
            v-if="viewingLogs"
            :logs="viewingLogs"
            :title="viewingLogsTitle"
            @close="closeLogViewer"
        ></logs-viewer>
    </div>
</template>

<script>
import Championship from '../Championship.js';
import ChampionshipMatch from '../ChampionshipMatch.js';
import ClassicWhos from '../ClassicWhos.js';
import ChampionshipReportProcessor from '../ChampionshipReportProcessor.js';
import StrategyBuilder from '../StrategyBuilder.js';
import roster from '../strategies/roster.js';

const defaultEditingStrategy = `
const _ = require('lodash');
const Searcher = require('../Searcher.js');

class Custom
{
  move(me, other, log)
  {
    
  }
}

Custom.description = 'Explain your strategy briefly';

module.exports = Custom;
`;

export default {
    data() {
        var strategyMap = {};
        roster.map(strategy => strategyMap[strategy.name] = strategy);
        return {
            championship: null,
            running: false,
            strategies: strategyMap,
            chosen: Object.keys(strategyMap),
            report: null,
            unfoldedStrategy: null,
            REASON_CORRECT_ANSWER: ChampionshipMatch.REASON_CORRECT_ANSWER,
            REASON_INCORRECT_ANSWER: ChampionshipMatch.REASON_INCORRECT_ANSWER,
            REASON_EXCEPTION_DEFAULT: ChampionshipMatch.REASON_EXCEPTION_DEFAULT,
            editingStrategy: null,
            editingStrategyName: null,
            strategyCode: {},
            reportSetter: null,
            lastReportSet: null,
            viewingLogs: null,
            viewingLogsTitle: '',
        };
    },
    computed: {
        strategyStats()
        {
            if (!this.report) {
                return null;
            }
            var stats = Object.values(new ChampionshipReportProcessor(this.report).stats)
            if (!this.running) {
                stats = stats.sort((a, b) => {
                    if (a.wins < b.wins) {
                        return -1;
                    } else if (a.wins > b.wins) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }
            return stats;
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
                })
                .onDone(report => {
                    this.setReport(report);
                    this.running = false;
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
            this.editingStrategy = defaultEditingStrategy;
        },
        editStrategy(name)
        {
            if (this.strategyCode[name]) {
                this.editingStrategyName = name;
                this.editingStrategy = this.strategyCode[name];
            } else {
                this.downloadStrategy(name)
                    .then(() => {
                        this.editingStrategyName = name;
                        this.editingStrategy = this.strategyCode[name];
                    })
                    .catch(error => {
                        alert("Unable to read file: " + error);
                    });
            }
        },
        downloadStrategy(name)
        {
            return this.$http
                .get('resources/assets/js/strategies/' + name + '.js')
                .then(response => {
                    return new Promise((resolve, error) => {
                        var f = new FileReader();
                        f.onload = () => {
                            resolve(f.result);
                        };
                        f.onerror = () => {
                            error(f.error);
                        };
                        f.readAsText(response.body);
                    });
                })
                .then(code => {
                    this.strategyCode[name] = code;
                });
        },
        saveStrategy(strategy, code)
        {
            this.strategies[strategy.name] = strategy;
            this.strategyCode[strategy.name] = code;
            if (strategy.name !== this.editingStrategyName) {
                // oh a new one
                this.chosen.push(strategy.name);
            }
        },
        closeStrategyEdit()
        {
            Vue.nextTick(() => {
                this.editingStrategyName = null;
                this.editingStrategy = null;
            });
        },
        showLogs(title, logs)
        {
            this.viewingLogsTitle = title;
            this.viewingLogs = logs;
        },
        closeLogViewer()
        {
            Vue.nextTick(() => {
                this.viewingLogs = null;
            });
        },
    },
}
</script>

<style>
.pointer {
    cursor: pointer;
}
</style>
