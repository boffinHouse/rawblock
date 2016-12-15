#{Name}

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
	{{#mergeJSON {fullUnderscoreName}.default}}
		{{> {fullUnderscoreName} }}
	{{/mergeJSON}}
</div>
