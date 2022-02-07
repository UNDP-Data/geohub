
<script lang="ts">
    import { onMount } from 'svelte'; 
    import TopAppBar, {
      Row,
      Section,
      Title,
      AutoAdjust,
      TopAppBarComponentDev,
    } from '@smui/top-app-bar';
    import { Icon } from '@smui/button';
    import IconButton from '@smui/icon-button';
    import {Svg} from '@smui/common/elements'    
    import { mdiWeatherSunny, mdiWeatherNight} from '@mdi/js';

  
    let topAppBar: TopAppBarComponentDev;
    let darkTheme: Boolean | undefined = false;

    onMount(() => {
        window.matchMedia('(prefers-color-scheme: light)')
    });
  </script>


<!-- set up color theme -->


<svelte:head>
    {#if darkTheme === undefined}

    <link rel="stylesheet" href="/smui.css" media="(prefers-color-scheme: light)" />
    <link rel="stylesheet" href="/smui-dark.css" media="screen and (prefers-color-scheme: dark)"/>
    {:else if darkTheme}
        <link rel="stylesheet" href="/smui.css" />
        <link rel="stylesheet" href="/smui-dark.css" media="screen"/>
    {:else}
        <link rel="stylesheet" href="/smui.css" />
    {/if}
		
</svelte:head>


<TopAppBar bind:this={topAppBar} variant="fixe">
    <Row>
      <Section>
        <IconButton class="material-icons">menu</IconButton>
        <Title>Standard</Title>
      </Section>
      <Section align="end" toolbar>
        <!-- <IconButton class="material-icons" aria-label="Download">
            file_download
        </IconButton>
        <IconButton class="material-icons" aria-label="Print this page">
            print
          </IconButton>
        <IconButton class="material-icons" aria-label="Bookmark this page">bookmark
        </IconButton> -->
        <IconButton on:click={() => (darkTheme = !darkTheme)}>
            <Icon component={Svg} viewBox="0 0 24 24" >
              <path fill="currentColor" d={darkTheme ? mdiWeatherSunny : mdiWeatherNight } />
            </Icon>
        </IconButton>
      </Section>
    </Row>
  </TopAppBar>
  <slot />
  <!-- <AutoAdjust {topAppBar}>
    
  </AutoAdjust> -->
  
 