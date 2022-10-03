<script lang="ts">
  let currentSelectedOperation: string = ''

  const operationOptions = [
    { value: '==', label: 'Equal To' },
    { value: '!=', label: 'Not Equal To' },
    { value: '<', label: 'Less Than' },
    { value: '<=', label: 'Less or Equal To' },
    { value: '>', label: 'Greater Than' },
    { value: '>=', label: 'Greater or Equal To' },
  ]
</script>

<div class="grid" role="menu">
  {#each operationOptions as operation}
    <div
      class="card grid-item vector-property-card {operation.value === currentSelectedOperation ? 'clicked' : null}"
      on:click={() => (currentSelectedOperation = operation.value)}>
      <div class="vector-property-card-content">
        <span class="property-text">{operation.label}</span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
</style>
