<script lang="ts">
  export let headerTitle: string
  export let isExpanded = false
</script>

<ul
  class="accordion"
  aria-label="accordion">
  <li>
    <button
      tabindex="0"
      aria-expanded={isExpanded}
      class={isExpanded ? 'accordion--active' : ''}
      on:click={() => {
        isExpanded = !isExpanded
      }}>{headerTitle}</button>
    <div
      class={!isExpanded ? 'accordion__panel' : 'accordion--active'}
      aria-hidden={!isExpanded}
      role="region">
      <slot />
    </div>
  </li>
</ul>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/accordion.min.css';
</style>
