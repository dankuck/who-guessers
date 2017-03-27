<template>
    <div>
        <div id="strategy-editor" class="modal fade" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Edit Strategy</h4>
              </div>
              <div class="modal-body">
                <ul class="nav nav-pills">
                    <li role="presentation" :class="{active: tab == 'code'}" @click="tab = 'code'"><a href="javascript:void(0)">Code</a></li>
                    <li role="presentation" :class="{active: tab == 'wtf'}" @click="tab = 'wtf'"><a href="javascript:void(0)">What Do I Do?</a></li>
                </ul>
                <div v-if="tab == 'code'">
                    <textarea style="width: 100%; height: 60%" v-model="edit"></textarea>
                    <div v-if="error" class="alert alert-danger" role="alert">
                      <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                      <span class="sr-only">Error:</span>
                      <pre style="font-size: 80%">{{ error.stack }}</pre>
                    </div>
                </div>
                <div v-if="tab == 'wtf'" v-html="how_to_write_a_strategy">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" @click="compileAndSave">Save changes</button>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
    </div>
</template>

<script>
import StrategyBuilder from '../StrategyBuilder.js';
import how_to_write_a_strategy from '../../md/how-to-write-a-strategy.md';

export default {
    props: ['code'],
    data(){
        return {
            edit: '',
            error: null,
            tab: 'code',
            how_to_write_a_strategy: how_to_write_a_strategy,
        };
    },
    mounted()
    {
        this.edit = this.code;
        Vue.nextTick(() => {
            $(this.$el).find('#strategy-editor').modal('toggle');
            $(this.$el).find('#strategy-editor').on("hidden.bs.modal", () => {
                this.$emit('close');
            });
        });
    },
    methods: {
        compileAndSave()
        {
            this.error = null
            Vue.nextTick(() => {
                try {
                    var builder = new StrategyBuilder(this.edit);
                    var Strategy = builder.get();
                    var test = new Strategy();
                    if (typeof test.move !== 'function') {
                        throw new Error('No `move` method specified.');
                    }
                    this.lastSave = this.edit;
                    this.$emit('save', Strategy, this.edit);
                    $(this.$el).find('#strategy-editor').modal('toggle');
                } catch (e) {
                    this.error = e;
                    this.tab = 'code';
                }
            });
        }
    },
}
</script>
