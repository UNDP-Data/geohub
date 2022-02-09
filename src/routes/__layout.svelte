
<script lang="ts">
  import Header from "../components/Header.svelte";
  import Content from "../components/Content.svelte";
  
  let drawerCollapsed: boolean = false ;
  $: updateDrawer = drawerCollapsed;
  let panelCollapsed: boolean = false

  
</script>

<Header bind:drawerCollapsed bind:panelCollapsed ></Header>

<Content bind:open={drawerCollapsed} bind:expanded={panelCollapsed} >
  
</Content>




 <slot />