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
                This feature does not yet function.
                <textarea style="width: 100%; height: 60%" v-model="edit"></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" @click="$emit('cancel')">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="$emit('save', edit)">Save changes</button>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
    </div>
</template>

<script>
export default {
    props: ['code'],
    data(){
        return {
            edit: '',
        };
    },
    mounted()
    {
        this.edit = this.code;
        Vue.nextTick(() => {
            $(this.$el).find('#strategy-editor').modal('toggle');
        });
    },
}
</script>
