<script lang="ts">
  export let title
</script>

<div class="style-editing-box">
  <span class="box-title">{title}</span>
  <p>
    <slot />
  </p>
</div>

<style lang="scss">
  @import '../../styles/style-editing-box.scss';
</style>
