<script lang="ts">

</script>
<div class="flexy">
	<div class="top-app-bar-container">
		<TopAppBar
			variant="static"
			{prominent}
			{dense}
			color={secondaryColor ? 'secondary' : 'primary'}
		>
			<Row>
				<Section>
					<IconButton class="material-icons">menu</IconButton>
					<Title>Static</Title>
				</Section>
				<Section align="end" toolbar>
					<IconButton class="material-icons" aria-label="Download"
					>file_download</IconButton
					>
					<IconButton class="material-icons" aria-label="Print this page"
					>print</IconButton
					>
					<IconButton class="material-icons" aria-label="Bookmark this page"
					>bookmark</IconButton
					>
				</Section>
			</Row>
		</TopAppBar>
		<div>
			<LoremIpsum />
			<img
				alt="Page content placeholder"
				src="/page-content.jpg"
				style="display: block; max-width: 100%; height: auto; margin: 1em auto;"
			/>
		</div>
	</div>
