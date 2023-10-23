<script lang="ts">
  export let href: string;
  export let title: string;
  export let openInNewTab: boolean = false;

</script>
<a href={href} title={title} target={openInNewTab ? "_blank":""}>
  {title}
  <slot name="content" />
</a>
<style lang="scss">
  @use '../css/base-minimal.min.css';
</style>