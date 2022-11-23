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
      }}>
      <p class="accordion-header">{headerTitle}</p>
    </button>
    <div
      class={!isExpanded ? 'accordion__panel' : 'accordion--active'}
      aria-hidden={!isExpanded}
      role="region">
      <slot />
    </div>
  </li>
</ul>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/accordion.min.css';

  .accordion-header {
    padding-left: 0.5rem;
    padding-right: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
</style>
