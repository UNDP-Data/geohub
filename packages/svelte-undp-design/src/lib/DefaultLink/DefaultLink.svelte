<script lang="ts">
  export let href: string;
  export let title: string;
</script>
<a href={href} title={title}>
  {title}
  <slot name="content" />
</a>
<style lang="scss">
  @use '../css/base-minimal.min.css';
</style>