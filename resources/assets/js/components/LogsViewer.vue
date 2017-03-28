<template>
    <div>
        <div id="logs-viewer" class="modal fade" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">{{ title || 'View Logs' }}</h4>
              </div>
              <div class="modal-body">
                <div>
                    <input v-model="search" type="text" class="form-control" placeholder="Search" />
                </div>
                <div>
                    <select v-model="viewing" style="width: 100%">
                        <option v-for="(log, i) in searchedLogs" :value="i">{{ i + ': ' + log[0] }}</option>
                    </select>
                </div>
                <pre>{{ logs[viewing].join("\n") }}</pre>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
    </div>
</template>

<script>
export default {
    props: ['title', 'logs'],
    data(){
        return {
          viewing: 0,
          search: '',
        };
    },
    computed: {
        searchedLogs() {
            if (!this.search) {
                return this.logs;
            }
            var filtered = {};
            var search = new RegExp(this.search, 'i');
            for (var i = 0; i < this.logs.length; i++) {
                if (search.test(this.logs[i].join("\n"))) {
                    filtered[i] = this.logs[i];
                }
            }
            return filtered;
        },
    },
    mounted()
    {
        Vue.nextTick(() => {
            $(this.$el).find('#logs-viewer').modal('toggle');
            $(this.$el).find('#logs-viewer').on("hidden.bs.modal", () => {
                this.$emit('close');
            });
        });
    },
    methods: {
    },
}
</script>
