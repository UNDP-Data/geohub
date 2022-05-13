<script lang="ts">
  export let title
</script>

<div style="display: flex; justify-content: space-between ; align-items: center; margin-top: 10px">
  <span style="margin-right: 5px">{title}</span>
  <slot />
</div>

<style lang="scss">
</style>
