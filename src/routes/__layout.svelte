
<script lang="ts">
  import Header from "../components/Header.svelte";
  import Content from "../components/Content.svelte";
  
  let drawerCollapsed: boolean = true ;
  $: updateDrawer = drawerCollapsed;
  let panelCollapsed: boolean = false;
  import {style} from "svelte-body";
  
</script>
<svelte:body
    use:style="{{ height:'100vh', margin:'0px',padding:'0px', border:'0px solid red'}}"
/>

  <Header bind:drawerCollapsed bind:panelCollapsed ></Header>

  <Content bind:open={drawerCollapsed} bind:expanded={panelCollapsed} >
    
  </Content>




 

 <style>
   

 </style>