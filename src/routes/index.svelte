
<script lang="ts">
    import Button from '@smui/button'

</script>

<!-- Todo: This styles are set to ensure that the Map Content moves together with the drawer opening-->
<style global>
    .mdc-drawer{
        width:500px;
    }

    .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{
        margin-left: 500px;
        margin-right: 0;
    }
</style>

<!-- <Button on:click={() => alert('It worked')}>Click me...</Button>
<Button on:click={() => alert('It worked')} color="secondary">Click me...</Button> -->
