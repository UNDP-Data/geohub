
<script lang="ts">
    
</script>

<!-- Todo: This styles are set to ensure that the Map Content moves together with the drawer opening-->
<style global>
    .mdc-drawer{
        width:250px;
    }

    .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{
        margin-left: 250px;
        margin-right: 0;
    }
</style>

