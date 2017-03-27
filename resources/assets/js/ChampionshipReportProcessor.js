const ChampionshipMatch = require('./ChampionshipMatch.js');

class ChampionshipReportProcessor
{
    constructor(report)
    {
        this.stats = {};
        this.report = report;
        report.results.map((result) => {
            var players = result.players.map(player => this.getStat(player.name));
            var winner = result.winner;
            var loser = winner === 0 ? 1 : 0;
            players[winner].matches++;
            players[winner].wins++;
            players[loser].losses++;
            var winnersLoserInfo = this.getCompetitor(players[winner], players[loser].name);
            var losersWinnerInfo = this.getCompetitor(players[loser], players[winner].name);
            winnersLoserInfo.matches++;
            winnersLoserInfo.wins_against++;
            losersWinnerInfo.losses_against++;
            winnersLoserInfo.win_reasons[result.reason]++;
            losersWinnerInfo.loss_reasons[result.reason]++;
            if (players[0] !== players[1]) {
                players[loser].matches++;
                players[winner].wins_against_others++;
                players[loser].losses_against_others++;
                losersWinnerInfo.matches++;
            }
        });
    }

    getStat(name)
    {
        if (!this.stats[name]) {
            this.stats[name] = {
                name: name,
                matches: 0,
                wins: 0,
                wins_against_others: 0,
                losses: 0,
                losses_against_others: 0,
                competitors: {},
            };
        }
        return this.stats[name];
    }

    getCompetitor(player, name)
    {
        function buildReasons() {
            var reasons = {};
            reasons[ChampionshipMatch.REASON_CORRECT_ANSWER] = 0;
            reasons[ChampionshipMatch.REASON_INCORRECT_ANSWER] = 0;
            reasons[ChampionshipMatch.REASON_EXCEPTION_DEFAULT] = 0;
            return reasons;
        };
        if (!player.competitors[name]) {
            player.competitors[name] = {
                name: name,
                matches: 0,
                wins_against: 0,
                losses_against: 0,
                is_self: (player.name === name),
                win_reasons: buildReasons(),
                loss_reasons: buildReasons(),
            };
        }
        return player.competitors[name];
    }
};

module.exports = ChampionshipReportProcessor;
