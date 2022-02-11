
<script lang="ts">
	import { mdiWeatherSunny } from '@mdi/js';
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  import Paper, { Title, Subtitle, Content } from '@smui/paper';
  import List, { Item, Text } from '@smui/list';
  import IconButton from '@smui/icon-button'
  export let expanded = false;
  export let open = false;

  import Icon from '@iconify/svelte';
  let active = 'Vector tiles';
  
  


  function setActive(value: string) {
    active = value;
  }
  
  let panel;
  
</script>
<div class="drawer-container">
  <Drawer variant="dismissible" bind:open>
    <Header>
      <Title>Layers</Title>
      <Subtitle>Operations with Layers</Subtitle>
    </Header>
    <Content>
      <List>
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
      </List>
    </Content>
  </Drawer>

  <!-- Todo: Create a component for the following -->
  <AppContent class="app-content">
    <main class="main-content">
      <!-- <slot></slot> -->
      <pre class="status">Active: {active}</pre>
      <h1>Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
      </h1>

    </main>
    <div class="bottom-drawer" bind:this={panel} class:expanded>
      
      {#if expanded}
      <Paper unelevated square variant="outlined" >

        <!-- <Title>Info Panel</Title>
        <Subtitle>This is an unelevated sheet of paper.</Subtitle> -->
        <Content>Unelevated paper is used to build a surface.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum totam modi dolor, quae officiis nobis! Ipsum dicta culpa esse temporibus molestiae? Veniam distinctio beatae, perferendis sapiente libero ad adipisci est voluptas dolores, necessitatibus, doloremque corrupti soluta iure harum! Ipsam, id similique pariatur nobis consequatur earum sed hic explicabo debitis veritatis voluptates temporibus ipsum dolorum alias eaque vitae voluptatem, mollitia modi? Autem voluptas sequi delectus nemo fuga beatae sint ex cumque nihil quisquam neque, cupiditate porro molestiae est mollitia dolor tempora alias itaque. Iusto voluptas voluptate debitis consequuntur excepturi quae quos, consectetur amet aliquid ut facere autem veniam dolor sed distinctio nam nesciunt minus porro harum magnam dignissimos impedit numquam ullam. Enim quaerat odit ipsam, praesentium autem beatae explicabo laboriosam. Possimus excepturi aperiam in aliquam rem cumque sed, ut, vitae sint blanditiis molestias similique voluptatum eius voluptas? Ducimus laborum non veritatis, incidunt porro corporis amet officiis, saepe fugiat modi dolore eius expedita! Aliquid eaque nesciunt minima dignissimos laboriosam quos deleniti cum aut vero necessitatibus rerum, totam mollitia nemo. Accusamus quia cupiditate mollitia labore deserunt consectetur aspernatur harum eius magni, odio corporis minima officia, placeat vitae? Asperiores hic error laboriosam non esse nesciunt dolore cupiditate iste, illum sunt! Possimus iste, culpa repudiandae quis inventore esse totam perspiciatis odit dolore aliquam, adipisci, accusantium eveniet. Voluptates debitis magnam unde beatae quae repudiandae error ipsam, deleniti eveniet accusantium perspiciatis nihil ipsa nesciunt iusto odio non, nam distinctio obcaecati saepe. Suscipit, ullam. In repudiandae similique aut accusantium. Eligendi officiis quisquam libero delectus ipsa veritatis ratione corrupti dolorem modi assumenda atque perferendis quia deserunt, molestiae ab iste est nobis dolore aliquid, nesciunt sit fugiat. Architecto, deleniti? Ab, ratione dolore, minima deserunt beatae eum ea earum omnis porro ad ducimus minus quisquam soluta ex neque reprehenderit. Eius debitis perspiciatis fugit beatae corrupti assumenda dolorem suscipit vitae aperiam enim!


        </Content>
      </Paper>
      {/if}
    </div>
    
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>



<style>
  
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: absolute;
    display: flex;
    height: calc(100vh - 64px);
    /* height:100vh; */
    width: 100%;
    border: 0px solid; 
    /* overflow: hidden; */
    z-index: 0;
    flex-grow: 1;
    box-sizing: border-box;
  }

  .app-content {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }

  .main-content {
    overflow: hidden;
    /* padding: 66px; */
    height: 100%;
    box-sizing: border-box;
  }
  .bottom-drawer{
    position: absolute;
    bottom: 0;
    left: 0%;
    /* background-color: dodgerblue; */
    width: 100%;
    /* height: 100%; */
    /* border-radius: 5px 50px 50px 5px; */
    flex-grow: 1;
    overflow: auto
  }
  
  .ipanel {
    border-top: 10px;
  }

  .expanded{
    display :inline-block;
    max-height: 150px;
    /* height: 150px; */
    position: absolute;
    bottom: 0;
    left: 0%;
    /* background-color: dodgerblue; */
    width: 100%;
    
  }


  
</style>