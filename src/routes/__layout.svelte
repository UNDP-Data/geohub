
<script lang="ts">
  import Header from "../components/Header.svelte";
  import Content from "../components/Content.svelte";
  
  let drawerCollapsed: boolean = false ;
  $: updateDrawer = drawerCollapsed;
  

  
</script>

<Header bind:drawerCollapsed ></Header>

<Content bind:open={drawerCollapsed} ></Content>




 <slot />