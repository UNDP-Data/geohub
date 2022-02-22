
<script lang="ts">
	import LayerList from './LayerList.svelte';
	import { mdiWeatherSunny } from '@mdi/js';
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  //import LoadData from "./LoadData.svelte"

  import Accordion, { Panel, Header as AccHeader, Content as AccContent } from '@smui-extra/accordion';
  import Paper from '@smui/paper';
  import List, { Item, Text } from '@smui/list';
  import IconButton from '@smui/icon-button'
  export let expanded = true;
  export let open = false;
  
  
  import Icon from '@iconify/svelte';
  let active = 'Vector tiles';
  let rlabel;
  let expandedt;
 

  
  


  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  // import { Tabs, TabList, TabPanel, Tab } from '../components/tabs';

  // function setActive(value: string) {
  //   active = value;
  // }
  
  let panel;


  import {wtree}  from '../stores/stores';
  import TreeView from './TreeView.svelte';
  import LayerList from './LayerList.svelte';
  
  
</script>
<TabBar tabs={['Load...', 'Layers', 'Analyze']}   let:tab bind:active>
  <!-- Note: the `tab` property is required! -->
  <Tab {tab} class="tab">
    <Label  >{tab}</Label>
  </Tab>
</TabBar>
<div class="drawer-container">
  
  <Drawer variant="dismissible" bind:open >
    
    <!-- <Header>
      <Title>Layers</Title>
    </Header> -->
    
    <Content>
      
      {#if active == 'Load...'}
          <TreeView tree={$wtree.tree}   />
      {:else if active =='Layers'}
        <LayerList></LayerList>
        <!-- <List>
          <Item
                  href="javascript:void(0)"
                  on:click={() => setActive('Vector tiles')}
                  activated={active === 'Vector tiles'}
          >
            <Text>Vector tiles</Text>
          </Item>
          <Item
                  href="javascript:void(0)"
                  on:click={() => setActive('A Space Rocket')}
                  activated={active === 'A Space Rocket'}
          >
            <Text>A Space Rocket</Text>
          </Item>
          <Item
                  href="javascript:void(0)"
                  on:click={() => setActive('100 Pounds of Gravel')}
                  activated={active === '100 Pounds of Gravel'}
          >
            <Text>100 Pounds of Gravel</Text>
          </Item>
          <Item
                  href="javascript:void(0)"
                  on:click={() => setActive('All of the Shrimp')}
                  activated={active === 'All of the Shrimp'}
          >
            <Text>All of the Shrimp</Text>
          </Item>
          <Item
                  href="javascript:void(0)"
                  on:click={() => setActive('A Planet with a Mall')}
                  activated={active === 'A Planet with a Mall'}
          >
            <Text>A Planet with a Mall</Text>
          </Item>
      </List> -->
      {:else if active=='Analyze'}
        Analyze
      {/if}
      
       
      
      
    </Content>
    
      <Accordion class="expanded">
        <Panel bind:open={expanded} color="primary" square>
          <AccHeader>Info Panel</AccHeader>
          <AccContent>
           Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae modi natus adipisci ut, ab voluptates accusamus, veniam quam id corporis nisi earum at nemo libero quod iure sequi nihil ullam.
          </AccContent>
        </Panel>
        
      </Accordion>
    
  </Drawer>

  <!-- Todo: Create a component for the following -->
  <AppContent class="app-content " >
    <main class="main-content">
      
      <slot></slot>

      <!-- a LARGE  bottom info panel covering the map
    use as an alternative to placing the info panel in the side bar
    -->
    <!-- <div  bind:this={panel} class:expanded>
      
      {#if expanded}
      <div class="accordion-container">
        <Accordion>
          <Panel bind:open={expanded} color="primary">
            <AccHeader>Info Panel</AccHeader>
            <AccContent>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores error consequatur neque enim mollitia earum, obcaecati consectetur in corporis inventore. Minima doloribus dicta quas nostrum nemo porro animi sit tempore earum maxime similique quam temporibus voluptatum neque ad, aspernatur hic odit. Totam, ad autem doloribus veniam numquam, quod non commodi reiciendis excepturi consectetur explicabo dolorum. Quasi perferendis minima itaque, similique at sed asperiores iure repudiandae id qui minus. Rem dolore vitae non debitis voluptatem quam dignissimos ad, tenetur illo ducimus porro quibusdam adipisci eligendi aspernatur, neque nemo veritatis sit assumenda ut impedit voluptates dolorum eum ex consequuntur. Molestias iure nam, provident, repellendus sint sit earum quod aliquid rerum eos exercitationem harum placeat aliquam illum. Consectetur amet neque saepe accusamus ea quas. Officia saepe voluptatibus et quasi doloremque, mollitia iste maxime debitis dolorem consequatur laborum dolorum aut labore voluptates est corporis? Nihil aliquid porro nam? Nam eveniet voluptate repudiandae debitis molestias pariatur magni eos. Debitis enim voluptatem tempora omnis dolore commodi dolorem consequatur sequi, fugit, possimus est sed velit, provident ipsam. Facilis, omnis impedit! Quia saepe eligendi harum rerum voluptate dolorum ipsum ea. Id quam quibusdam, delectus ipsa porro doloribus, sequi odio asperiores cumque voluptatum inventore nemo, libero rerum unde consectetur.
            </AccContent>
          </Panel>
          
        </Accordion>
      </div>
      {/if}
    </div>
    </main> -->
    
    
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>



<style>
  .tab {
    height:8px;
    font-size: 12pt;
  }
  .expand {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }
  
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: absolute;
    display: flex;
    height: calc(100vh - calc(64px+48px));
    /* height:100vh; */
    width: 100%;
    overflow: auto;
    /* overflow: hidden; */
    z-index: 0;
    flex-grow: 1;
    /* box-sizing: border-box; */
  }

  .acordion-container {
    max-height: 350px;
    overflow: auto;
    z-index: inherit;
  }

  * :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }
  .main-content {
    overflow: hidden;
    display: flex;
    height: 100%;
    /* box-sizing: border-box; */
    /* border: 30px  whitesmoke; */
    flex-grow: 1;
    z-index: -1;
    flex-direction: row;
    flex-wrap: wrap;

  }
  .bottom-drawer{
    position: absolute;
    bottom: 0;
    left: 0%;
    /* background-color: dodgerblue; */
    width: 100%;
    height: 100%;
    /* border-radius: 5px 50px 50px 5px; */
    flex-grow: 1;
    overflow: auto;
    
    
  }
  


  :global(.expanded){
    display :inline-block;
    max-height: 300px;
    min-height: auto;
    /* height: 150px; */
    position: absolute;
    bottom: 0;
    left: 0%;
    color: red;
    width: 100%;
    text-align: center;
    overflow:auto;


    
  }


  
</style>