<script lang="ts">
  export let headerTitle: string
  export let isExpanded = false
</script>

<ul
  class="accordion"
  aria-label="accordion">
  <li>
    <div class="accordion-title">
      <slot name="button" />
      <button
        tabindex="0"
        aria-expanded={isExpanded}
        class={`accordion-button ${isExpanded ? 'accordion--active' : ''}`}
        on:click={() => {
          isExpanded = !isExpanded
        }}>
        <p class="accordion-header">
          {headerTitle}
        </p>
      </button>
    </div>
    <div
      class={!isExpanded ? 'accordion__panel' : 'accordion--active'}
      aria-hidden={!isExpanded}
      role="region">
      <div class="accordion-content"><slot name="content" /></div>
    </div>
  </li>
</ul>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/accordion.min.css';

  .accordion {
    padding: 5px;
    padding-right: 10px;

    .accordion-title {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .accordion-button {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .accordion-header {
      padding-left: 0.5rem;
      padding-right: 1.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: capitalize;
    }

    .accordion-content {
      cursor: default;
    }
  }
</style>
