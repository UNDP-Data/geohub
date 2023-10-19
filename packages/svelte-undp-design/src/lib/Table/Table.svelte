<script lang="ts">
  export let variant: "default" | "striped" | "border" = "default";
  export let size: "small" | "large" = "small";

  export let data :Array<{[key: string]: string | number | HTMLElement}> = [];





  // run check that all the datasets have the same number of columns
  let columns = data.map((item) => Object.keys(item));

  let uniqueColumns = [...new Set(columns.flat())];
</script>
<table class="{variant} {size}">
  <thead>
  <tr>
    {#each uniqueColumns as column}
      {#if column === "optional_html"}
        <th></th>
        {:else}
      <th>{column}</th>
        {/if}
    {/each}
  </tr>
  </thead>
  <tbody>
  {#each data as item}
    <tr>
      {#each Object.values(item) as value}
          <td>{value ? value:""}</td>
      {/each}
    </tr>
  {/each}
  </tbody>
</table>
<style lang="scss">
  @use "../css/base-minimal.min.css";
</style>